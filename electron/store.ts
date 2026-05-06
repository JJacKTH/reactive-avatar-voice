import { app } from 'electron'
import path from 'path'
import fs from 'fs'

const SETTINGS_FILE = 'settings.json'

interface AvatarImagePaths {
  idle: string | null
  talk1: string | null
  talk2: string | null
  talk3: string | null
  blink: string | null
  mute: string | null
}

interface AppSettings {
  imagePaths: AvatarImagePaths
  microphoneDeviceId: string
  sensitivity: number
  silenceDelay: number
  frameSpeed: number
  backgroundColor: string
  greenScreenEnabled: boolean
  overlayWidth: number
  overlayHeight: number
  alwaysOnTop: boolean
  isMuted: boolean
  bounceEnabled: boolean
  scaleEnabled: boolean
  blinkRate: number
}

const DEFAULT_SETTINGS: AppSettings = {
  imagePaths: {
    idle: null,
    talk1: null,
    talk2: null,
    talk3: null,
    blink: null,
    mute: null
  },
  microphoneDeviceId: '',
  sensitivity: 30,
  silenceDelay: 300,
  frameSpeed: 200,
  backgroundColor: '#00FF00',
  greenScreenEnabled: true,
  overlayWidth: 512,
  overlayHeight: 512,
  alwaysOnTop: false,
  isMuted: false,
  bounceEnabled: true,
  scaleEnabled: true,
  blinkRate: 30
}

function getSettingsPath(): string {
  return path.join(app.getPath('userData'), SETTINGS_FILE)
}

export function loadSettings(): AppSettings {
  try {
    const filePath = getSettingsPath()
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8')
      const parsed = JSON.parse(data)
      return { ...DEFAULT_SETTINGS, ...parsed }
    }
  } catch (err) {
    console.error('Failed to load settings:', err)
  }
  return { ...DEFAULT_SETTINGS }
}

export function saveSettings(settings: Partial<AppSettings>): AppSettings {
  try {
    const current = loadSettings()
    const merged = { ...current, ...settings }
    const filePath = getSettingsPath()
    fs.writeFileSync(filePath, JSON.stringify(merged, null, 2), 'utf-8')
    return merged
  } catch (err) {
    console.error('Failed to save settings:', err)
    return loadSettings()
  }
}

export function resetSettings(): AppSettings {
  try {
    const filePath = getSettingsPath()
    fs.writeFileSync(filePath, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf-8')
  } catch (err) {
    console.error('Failed to reset settings:', err)
  }
  return { ...DEFAULT_SETTINGS }
}

export function readImageAsDataUrl(filePath: string): string | null {
  try {
    if (!fs.existsSync(filePath)) return null
    const buffer = fs.readFileSync(filePath)
    const ext = path.extname(filePath).toLowerCase()
    const mimeMap: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp'
    }
    const mime = mimeMap[ext] || 'image/png'
    return `data:${mime};base64,${buffer.toString('base64')}`
  } catch (err) {
    console.error('Failed to read image:', filePath, err)
    return null
  }
}

export { DEFAULT_SETTINGS }
export type { AppSettings, AvatarImagePaths }
