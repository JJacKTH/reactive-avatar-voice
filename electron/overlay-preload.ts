import { contextBridge, ipcRenderer } from 'electron'

export const overlayAPI = {
  // Listen for avatar state updates
  onAvatarState: (callback: (payload: { avatarState: string; currentImageData: string | null; volume?: number }) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, payload: { avatarState: string; currentImageData: string | null; volume?: number }) =>
      callback(payload)
    ipcRenderer.on('avatar-state', handler)
    return () => ipcRenderer.removeListener('avatar-state', handler)
  },

  // Listen for image data updates
  onOverlayImages: (callback: (imageData: Record<string, string | null>) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, imageData: Record<string, string | null>) =>
      callback(imageData)
    ipcRenderer.on('overlay-images', handler)
    return () => ipcRenderer.removeListener('overlay-images', handler)
  },

  // Listen for overlay settings updates
  onOverlaySettings: (callback: (payload: { backgroundColor: string; greenScreenEnabled: boolean; bounceEnabled: boolean; scaleEnabled: boolean }) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, payload: { backgroundColor: string; greenScreenEnabled: boolean; bounceEnabled: boolean; scaleEnabled: boolean }) =>
      callback(payload)
    ipcRenderer.on('overlay-settings', handler)
    return () => ipcRenderer.removeListener('overlay-settings', handler)
  }
}

contextBridge.exposeInMainWorld('overlayAPI', overlayAPI)
