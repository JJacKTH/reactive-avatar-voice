import { useState, useEffect, useRef, useCallback } from 'react'

interface AudioState {
  devices: MediaDeviceInfo[]
  selectedDeviceId: string
  isListening: boolean
  volume: number           // 0-100
  error: string | null
}

interface UseAudioOptions {
  deviceId: string
  sensitivity: number
  onDeviceChange?: (deviceId: string) => void
}

export function useAudio(options: UseAudioOptions) {
  const { deviceId, sensitivity } = options

  const [state, setState] = useState<AudioState>({
    devices: [],
    selectedDeviceId: deviceId,
    isListening: false,
    volume: 0,
    error: null
  })

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number>(0)
  const dataArrayRef = useRef<Float32Array | null>(null)

  // Enumerate audio devices
  const refreshDevices = useCallback(async () => {
    try {
      // Request permission first to get labeled devices
      const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      tempStream.getTracks().forEach(t => t.stop())

      const allDevices = await navigator.mediaDevices.enumerateDevices()
      const audioInputs = allDevices.filter(d => d.kind === 'audioinput')
      setState(prev => ({ ...prev, devices: audioInputs, error: null }))
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to access microphone'
      setState(prev => ({ ...prev, error: msg }))
    }
  }, [])

  // Start listening
  const startListening = useCallback(async (selectedId?: string) => {
    const useDeviceId = selectedId || state.selectedDeviceId

    try {
      // Stop previous stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }

      const constraints: MediaStreamConstraints = {
        audio: useDeviceId
          ? { deviceId: { exact: useDeviceId } }
          : true
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      const audioContext = new AudioContext()
      audioContextRef.current = audioContext

      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 1024
      analyser.smoothingTimeConstant = 0.5
      source.connect(analyser)
      analyserRef.current = analyser

      const dataArray = new Float32Array(analyser.fftSize)
      dataArrayRef.current = dataArray

      setState(prev => ({
        ...prev,
        isListening: true,
        selectedDeviceId: useDeviceId,
        error: null
      }))

      // Start volume monitoring loop
      let lastVolume = 0
      const updateVolume = () => {
        if (!analyserRef.current || !dataArrayRef.current) return
        analyserRef.current.getFloatTimeDomainData(dataArrayRef.current as any)

        // Calculate RMS
        let sum = 0
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          sum += dataArrayRef.current[i] * dataArrayRef.current[i]
        }
        const rms = Math.sqrt(sum / dataArrayRef.current.length)

        // Normalize to 0-100
        const normalized = Math.min(100, Math.round(rms * 500))
        
        // Apply smoothing (EWMA)
        const smoothed = lastVolume * 0.3 + normalized * 0.7
        lastVolume = smoothed
        const rounded = Math.round(smoothed)

        setState(prev => {
          // Only update if value changed to reduce re-renders
          if (prev.volume === rounded) return prev
          return { ...prev, volume: rounded }
        })
        
        rafRef.current = requestAnimationFrame(updateVolume)
      }

      rafRef.current = requestAnimationFrame(updateVolume)

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to start microphone'
      setState(prev => ({ ...prev, error: msg, isListening: false }))
    }
  }, [state.selectedDeviceId])

  // Stop listening
  const stopListening = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    analyserRef.current = null
    dataArrayRef.current = null

    setState(prev => ({ ...prev, isListening: false, volume: 0 }))
  }, [])

  // Select device
  const selectDevice = useCallback((newDeviceId: string) => {
    setState(prev => ({ ...prev, selectedDeviceId: newDeviceId }))
    if (state.isListening) {
      startListening(newDeviceId)
    }
    options.onDeviceChange?.(newDeviceId)
  }, [state.isListening, startListening, options])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening()
    }
  }, [])

  // Load devices on mount
  useEffect(() => {
    refreshDevices()
  }, [refreshDevices])

  // Determine if speaking
  const isSpeaking = state.volume >= sensitivity

  return {
    ...state,
    isSpeaking,
    startListening: () => startListening(),
    stopListening,
    selectDevice,
    refreshDevices
  }
}
