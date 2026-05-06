import { useState, useEffect, useCallback } from 'react'
import type { AppSettings, AvatarImageData, ImageSlot } from '../types'
import { DEFAULT_SETTINGS } from '../types'

const api = () => (window as unknown as { electronAPI: typeof import('../../electron/preload').electronAPI }).electronAPI

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>({ ...DEFAULT_SETTINGS })
  const [imageData, setImageData] = useState<AvatarImageData>({
    idle: null, talk1: null, talk2: null, talk3: null, blink: null, mute: null
  })
  const [isLoaded, setIsLoaded] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')

  // Load settings on mount
  const load = useCallback(async () => {
    try {
      const result = await api().loadSettings()
      if (result) {
        setSettings(result.settings as unknown as AppSettings)
        setImageData(result.imageData as unknown as AvatarImageData)
      }
      setIsLoaded(true)
      setStatusMsg('Settings loaded')
    } catch (err) {
      console.error('Failed to load settings:', err)
      setIsLoaded(true)
      setStatusMsg('Failed to load settings')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Save settings
  const save = useCallback(async (newSettings?: Partial<AppSettings>) => {
    try {
      const toSave = newSettings ? { ...settings, ...newSettings } : settings
      await api().saveSettings(toSave as unknown as Record<string, unknown>)
      if (newSettings) {
        setSettings(prev => ({ ...prev, ...newSettings }))
      }
      setStatusMsg('✅ Settings saved!')
      setTimeout(() => setStatusMsg(''), 3000)
    } catch (err) {
      console.error('Failed to save settings:', err)
      setStatusMsg('❌ Failed to save settings')
    }
  }, [settings])

  // Reset settings
  const reset = useCallback(async () => {
    try {
      const result = await api().resetSettings()
      setSettings(result.settings as unknown as AppSettings)
      setImageData(result.imageData as unknown as AvatarImageData)
      setStatusMsg('🔄 Settings reset to defaults')
      setTimeout(() => setStatusMsg(''), 3000)
    } catch (err) {
      console.error('Failed to reset settings:', err)
      setStatusMsg('❌ Failed to reset settings')
    }
  }, [])

  // Select image
  const selectImage = useCallback(async (slot: ImageSlot) => {
    try {
      const result = await api().selectImage(slot)
      if (result) {
        setImageData(prev => ({ ...prev, [slot]: result.dataUrl }))
        setSettings(prev => ({
          ...prev,
          imagePaths: { ...prev.imagePaths, [slot]: result.path }
        }))
        setStatusMsg(`📷 ${slot} image selected`)
        setTimeout(() => setStatusMsg(''), 2000)
      }
    } catch (err) {
      console.error('Failed to select image:', err)
      setStatusMsg('❌ Failed to select image')
    }
  }, [])

  // Update a setting
  const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }, [])

  return {
    settings,
    imageData,
    isLoaded,
    statusMsg,
    setStatusMsg,
    save,
    reset,
    load,
    selectImage,
    updateSetting
  }
}
