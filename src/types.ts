/* ── Shared Types for Reactive Avatar Studio ── */

export interface AvatarImagePaths {
  idle: string | null
  talk1: string | null
  talk2: string | null
  talk3: string | null
  blink: string | null
  mute: string | null
}

export interface AvatarImageData {
  idle: string | null    // base64 data URL
  talk1: string | null
  talk2: string | null
  talk3: string | null
  blink: string | null
  mute: string | null
}

export type ImageSlot = 'idle' | 'talk1' | 'talk2' | 'talk3' | 'blink' | 'mute'

export type AvatarState = 'idle' | 'talking' | 'blink' | 'muted'

export interface AppSettings {
  imagePaths: AvatarImagePaths
  microphoneDeviceId: string
  sensitivity: number        // 0-100
  silenceDelay: number       // ms, e.g. 300
  frameSpeed: number         // ms, e.g. 200
  backgroundColor: string   // hex color
  greenScreenEnabled: boolean
  overlayWidth: number
  overlayHeight: number
  alwaysOnTop: boolean
  isMuted: boolean
  // New features
  bounceEnabled: boolean
  scaleEnabled: boolean
  blinkRate: number         // 0-100 probability
}

export interface OverlayStatePayload {
  avatarState: AvatarState
  currentImageData: string | null  // base64 data URL of current frame
  volume?: number                 // optional real-time volume
}

export interface OverlaySettingsPayload {
  backgroundColor: string
  greenScreenEnabled: boolean
  bounceEnabled: boolean
  scaleEnabled: boolean
}

export interface SelectImageResult {
  path: string
  dataUrl: string
}

export const DEFAULT_SETTINGS: AppSettings = {
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
