import React, { useState, useEffect, useRef, useCallback } from 'react'
import { ImageSettings } from './components/ImageSettings'
import { AudioSettings } from './components/AudioSettings'
import { OverlayControls } from './components/OverlayControls'
import { StateControls } from './components/StateControls'
import { StatusBar } from './components/StatusBar'
import { useAudio } from './hooks/useAudio'
import { useSettings } from './hooks/useSettings'
import type { AvatarState } from './types'
import './App.css'

const api = () => (window as unknown as { electronAPI: typeof import('../electron/preload').electronAPI }).electronAPI

function App() {
  const {
    settings, imageData, isLoaded, statusMsg, setStatusMsg,
    save, reset, selectImage, updateSetting
  } = useSettings()

  const [isOverlayOpen, setIsOverlayOpen] = useState(false)
  const [avatarState, setAvatarState] = useState<AvatarState>('idle')
  const [forcedState, setForcedState] = useState<AvatarState | null>(null)
  const [talkFrameIndex, setTalkFrameIndex] = useState(0)

  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const blinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const talkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastSentStateRef = useRef<string>('')

  const audio = useAudio({
    deviceId: settings.microphoneDeviceId,
    sensitivity: settings.sensitivity,
    onDeviceChange: (deviceId) => updateSetting('microphoneDeviceId', deviceId)
  })

  // Listen for overlay status from main process
  useEffect(() => {
    const cleanup = api().onOverlayStatus((isOpen: boolean) => {
      setIsOverlayOpen(isOpen)
    })
    return cleanup
  }, [])

  /* ─────────────── Avatar State Logic ─────────────── */

  // Determine avatar state from audio
  useEffect(() => {
    if (forcedState) return // Don't override forced state

    if (settings.isMuted) {
      setAvatarState('muted')
      return
    }

    if (audio.isSpeaking) {
      // Clear silence timer
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
        silenceTimerRef.current = null
      }
      setAvatarState('talking')
    } else {
      // Start silence delay
      if (avatarState === 'talking' && !silenceTimerRef.current) {
        silenceTimerRef.current = setTimeout(() => {
          setAvatarState('idle')
          silenceTimerRef.current = null
        }, settings.silenceDelay)
      }
    }
  }, [audio.isSpeaking, settings.isMuted, settings.silenceDelay, forcedState])

  // Random Blink Logic
  useEffect(() => {
    if (avatarState !== 'idle' || forcedState || settings.blinkRate === 0) {
      if (blinkTimerRef.current) {
        clearTimeout(blinkTimerRef.current)
        blinkTimerRef.current = null
      }
      return
    }

    const scheduleBlink = () => {
      // Random delay between 1s and 8s based on blinkRate
      const baseDelay = 1000 + (100 - settings.blinkRate) * 70
      const randomDelay = baseDelay + Math.random() * 3000
      
      blinkTimerRef.current = setTimeout(() => {
        setAvatarState('blink')
      }, randomDelay)
    }

    scheduleBlink()

    return () => {
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current)
    }
  }, [avatarState, settings.blinkRate, forcedState])

  // Blink duration handler: return to idle after 150ms
  useEffect(() => {
    if (avatarState === 'blink') {
      const timer = setTimeout(() => {
        setAvatarState('idle')
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [avatarState])

  // Handle forced state timeout
  useEffect(() => {
    if (forcedState === 'talking') {
      const timer = setTimeout(() => setForcedState(null), 3000)
      return () => clearTimeout(timer)
    }
    if (forcedState === 'idle') {
      const timer = setTimeout(() => setForcedState(null), 2000)
      return () => clearTimeout(timer)
    }
  }, [forcedState])

  // Apply forced state
  useEffect(() => {
    if (forcedState) {
      setAvatarState(forcedState)
    }
  }, [forcedState])

  // Talk frame cycling
  useEffect(() => {
    if (avatarState === 'talking') {
      talkIntervalRef.current = setInterval(() => {
        setTalkFrameIndex(prev => prev + 1)
      }, settings.frameSpeed)
    } else {
      if (talkIntervalRef.current) {
        clearInterval(talkIntervalRef.current)
        talkIntervalRef.current = null
      }
      setTalkFrameIndex(0)
    }
    return () => {
      if (talkIntervalRef.current) {
        clearInterval(talkIntervalRef.current)
      }
    }
  }, [avatarState, settings.frameSpeed])

  /* ─────────────── Send State to Overlay ─────────────── */

  // Get current image data URL based on state
  const getCurrentImageData = useCallback((): string | null => {
    if (avatarState === 'muted') {
      return imageData.mute || imageData.idle || null
    }

    if (avatarState === 'talking') {
      const talkImages = [imageData.talk1, imageData.talk2, imageData.talk3].filter(Boolean)
      if (talkImages.length === 0) {
        return imageData.idle || null
      }
      return talkImages[talkFrameIndex % talkImages.length]!
    }

    if (avatarState === 'blink') {
      return imageData.blink || imageData.idle || null
    }

    return imageData.idle || null
  }, [avatarState, talkFrameIndex, imageData])

  // Send avatar state and volume to overlay
  useEffect(() => {
    if (!isOverlayOpen) return

    const currentImage = getCurrentImageData()
    const stateKey = `${avatarState}-${talkFrameIndex}-${currentImage?.slice(-20) || 'none'}-${audio.volume}`

    if (stateKey === lastSentStateRef.current) return
    lastSentStateRef.current = stateKey

    api().sendAvatarState({
      avatarState,
      currentImageData: currentImage,
      volume: audio.volume
    })
  }, [avatarState, talkFrameIndex, isOverlayOpen, getCurrentImageData, audio.volume])

  // Send overlay settings when they change
  useEffect(() => {
    if (!isOverlayOpen) return
    api().sendOverlaySettings({
      backgroundColor: settings.backgroundColor,
      greenScreenEnabled: settings.greenScreenEnabled,
      bounceEnabled: settings.bounceEnabled,
      scaleEnabled: settings.scaleEnabled
    })
  }, [settings.backgroundColor, settings.greenScreenEnabled, settings.bounceEnabled, settings.scaleEnabled, isOverlayOpen])

  // Send images to overlay when they change
  useEffect(() => {
    if (!isOverlayOpen) return
    api().sendOverlayImages(imageData as unknown as Record<string, string | null>)
  }, [imageData, isOverlayOpen])

  /* ─────────────── Handlers ─────────────── */

  const handleOpenOverlay = async () => {
    await api().openOverlay()
  }

  const handleCloseOverlay = async () => {
    await api().closeOverlay()
  }

  const handleAlwaysOnTop = async (value: boolean) => {
    updateSetting('alwaysOnTop', value)
    await api().setAlwaysOnTop(value)
  }

  const handleMuteToggle = () => {
    setForcedState(null)
    updateSetting('isMuted', !settings.isMuted)
  }

  const handleForceIdle = () => {
    setForcedState('idle')
    setStatusMsg('⏸ Forcing idle state...')
  }

  const handleForceTalk = () => {
    setForcedState('talking')
    setStatusMsg('🗣️ Forcing talk state...')
  }

  const handleResizeOverlay = async () => {
    if (isOverlayOpen) {
      await api().resizeOverlay(settings.overlayWidth, settings.overlayHeight)
      setStatusMsg('📐 Overlay resized')
    }
  }

  const handleResetSize = () => {
    updateSetting('overlayWidth', 512)
    updateSetting('overlayHeight', 512)
  }

  const handleSave = async () => {
    await save()
  }

  const handleReset = async () => {
    if (confirm('Reset all settings to defaults?')) {
      await reset()
    }
  }

  if (!isLoaded) {
    return (
      <div className="app-loading">
        <div className="loading-spinner" />
        <p>Loading Reactive Avatar Studio...</p>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-logo">
          <span className="logo-icon">🎭</span>
          <h1 className="app-title">Reactive Avatar Studio</h1>
        </div>
        <div className="header-badges">
          <span className={`badge ${audio.isListening ? 'badge-active' : 'badge-inactive'}`}>
            {audio.isListening ? '🎙️ Mic Active' : '🎙️ Mic Off'}
          </span>
          <span className={`badge ${isOverlayOpen ? 'badge-active' : 'badge-inactive'}`}>
            {isOverlayOpen ? '🖥️ Overlay On' : '🖥️ Overlay Off'}
          </span>
        </div>
      </header>

      <main className="app-main">
        <div className="column column-left">
          <ImageSettings
            imageData={imageData}
            onSelectImage={selectImage}
          />
        </div>

        <div className="column column-center">
          <AudioSettings
            devices={audio.devices}
            selectedDeviceId={audio.selectedDeviceId}
            isListening={audio.isListening}
            volume={audio.volume}
            sensitivity={settings.sensitivity}
            silenceDelay={settings.silenceDelay}
            frameSpeed={settings.frameSpeed}
            error={audio.error}
            onSelectDevice={audio.selectDevice}
            onStartListening={audio.startListening}
            onStopListening={audio.stopListening}
            onSensitivityChange={v => updateSetting('sensitivity', v)}
            onSilenceDelayChange={v => updateSetting('silenceDelay', v)}
            onFrameSpeedChange={v => updateSetting('frameSpeed', v)}
            onRefreshDevices={audio.refreshDevices}
          />
        </div>

        <div className="column column-right">
          <OverlayControls
            isOverlayOpen={isOverlayOpen}
            alwaysOnTop={settings.alwaysOnTop}
            greenScreenEnabled={settings.greenScreenEnabled}
            backgroundColor={settings.backgroundColor}
            overlayWidth={settings.overlayWidth}
            overlayHeight={settings.overlayHeight}
            bounceEnabled={settings.bounceEnabled}
            scaleEnabled={settings.scaleEnabled}
            blinkRate={settings.blinkRate}
            onOpenOverlay={handleOpenOverlay}
            onCloseOverlay={handleCloseOverlay}
            onAlwaysOnTopChange={handleAlwaysOnTop}
            onGreenScreenChange={v => updateSetting('greenScreenEnabled', v)}
            onBackgroundColorChange={v => updateSetting('backgroundColor', v)}
            onBounceChange={v => updateSetting('bounceEnabled', v)}
            onScaleChange={v => updateSetting('scaleEnabled', v)}
            onBlinkRateChange={v => updateSetting('blinkRate', v)}
            onWidthChange={v => updateSetting('overlayWidth', v)}
            onHeightChange={v => updateSetting('overlayHeight', v)}
            onResetSize={handleResetSize}
            onResizeOverlay={handleResizeOverlay}
          />
          <StateControls
            isMuted={settings.isMuted}
            avatarState={avatarState}
            onMuteToggle={handleMuteToggle}
            onForceIdle={handleForceIdle}
            onForceTalk={handleForceTalk}
            onSave={handleSave}
            onReset={handleReset}
          />
        </div>
      </main>

      <StatusBar message={statusMsg} />
    </div>
  )
}

export default App
