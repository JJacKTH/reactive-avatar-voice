import { contextBridge, ipcRenderer } from 'electron'

export const electronAPI = {
  // Image selection
  selectImage: (slot: string) =>
    ipcRenderer.invoke('select-image', slot) as Promise<{ path: string; dataUrl: string } | null>,

  // Overlay window control
  openOverlay: () => ipcRenderer.invoke('open-overlay'),
  closeOverlay: () => ipcRenderer.invoke('close-overlay'),

  // Forward state to overlay
  sendAvatarState: (payload: { avatarState: string; currentImageData: string | null; volume?: number }) =>
    ipcRenderer.send('avatar-state', payload),

  sendOverlayImages: (imageData: Record<string, string | null>) =>
    ipcRenderer.send('overlay-images', imageData),

  sendOverlaySettings: (payload: { backgroundColor: string; greenScreenEnabled: boolean; bounceEnabled: boolean; scaleEnabled: boolean }) =>
    ipcRenderer.send('overlay-settings', payload),

  // Overlay controls
  setAlwaysOnTop: (value: boolean) =>
    ipcRenderer.invoke('set-always-on-top', value),

  resizeOverlay: (width: number, height: number) =>
    ipcRenderer.invoke('resize-overlay', width, height),

  // Settings
  saveSettings: (settings: Record<string, unknown>) =>
    ipcRenderer.invoke('save-settings', settings),

  loadSettings: () =>
    ipcRenderer.invoke('load-settings') as Promise<{ settings: Record<string, unknown>; imageData: Record<string, string | null> }>,

  resetSettings: () =>
    ipcRenderer.invoke('reset-settings') as Promise<{ settings: Record<string, unknown>; imageData: Record<string, string | null> }>,

  // Listen for overlay status changes
  onOverlayStatus: (callback: (isOpen: boolean) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, isOpen: boolean) => callback(isOpen)
    ipcRenderer.on('overlay-status', handler)
    return () => {
      ipcRenderer.removeListener('overlay-status', handler)
    }
  }
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
