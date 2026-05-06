/// <reference types="vite/client" />

interface Window {
  electronAPI: typeof import('../electron/preload').electronAPI
  overlayAPI: typeof import('../electron/overlay-preload').overlayAPI
}
