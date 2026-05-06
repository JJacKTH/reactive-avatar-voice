import { app, BrowserWindow, ipcMain, dialog, screen, nativeImage, Menu } from 'electron'
import path from 'path'
import { loadSettings, saveSettings, resetSettings, readImageAsDataUrl } from './store'

// Env vars set by vite-plugin-electron
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
const MAIN_DIST = path.join(__dirname)
const RENDERER_DIST = path.join(__dirname, '../dist')

let controlPanelWindow: BrowserWindow | null = null
let overlayWindow: BrowserWindow | null = null
// Path to icon (works in dev and production)
const ICON_PATH = path.join(__dirname, '../assets/icon.png')
const appIcon = nativeImage.createFromPath(ICON_PATH)

/* ─────────────────── Window Creation ─────────────────── */

function createControlPanel() {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize

  controlPanelWindow = new BrowserWindow({
    width: Math.min(1280, screenWidth - 100),
    height: Math.min(820, screenHeight - 100),
    minWidth: 960,
    minHeight: 640,
    title: 'Reactive Avatar Studio',
    icon: appIcon,
    backgroundColor: '#0f0f17',
    show: false,
    webPreferences: {
      preload: path.join(MAIN_DIST, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      backgroundThrottling: false // ต้องปิดที่นี่ด้วย เพราะ mic detection อยู่ในหน้าต่างนี้
    }
  })

  controlPanelWindow.once('ready-to-show', () => {
    controlPanelWindow?.show()
  })

  if (VITE_DEV_SERVER_URL) {
    controlPanelWindow.loadURL(VITE_DEV_SERVER_URL)
  } else {
    controlPanelWindow.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  controlPanelWindow.on('closed', () => {
    controlPanelWindow = null
    // Close overlay when control panel closes
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.close()
    }
    overlayWindow = null
  })
}

function createOverlayWindow(width: number, height: number, alwaysOnTop: boolean) {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.focus()
    return
  }

  overlayWindow = new BrowserWindow({
    width,
    height,
    minWidth: 128,
    minHeight: 128,
    title: 'Reactive Avatar - Overlay',
    icon: appIcon,
    backgroundColor: '#00FF00',
    alwaysOnTop,
    skipTaskbar: false,
    resizable: true,
    frame: true,
    show: false,
    webPreferences: {
      preload: path.join(MAIN_DIST, 'overlay-preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      backgroundThrottling: false // เพิ่มบรรทัดนี้เพื่อให้ทำงานตลอดเวลาแม้ไม่ได้ focus
    }
  })

  overlayWindow.once('ready-to-show', () => {
    overlayWindow?.show()
    // Notify control panel that overlay is open
    controlPanelWindow?.webContents.send('overlay-status', true)
  })

  if (VITE_DEV_SERVER_URL) {
    overlayWindow.loadURL(VITE_DEV_SERVER_URL + '/overlay.html')
  } else {
    overlayWindow.loadFile(path.join(RENDERER_DIST, 'overlay.html'))
  }

  overlayWindow.on('closed', () => {
    overlayWindow = null
    controlPanelWindow?.webContents.send('overlay-status', false)
  })
}

/* ─────────────────── Helper: Load all images as data URLs ─────────────────── */

function loadAllImageData(imagePaths: Record<string, string | null>): Record<string, string | null> {
  const result: Record<string, string | null> = {}
  for (const [key, filePath] of Object.entries(imagePaths)) {
    result[key] = filePath ? readImageAsDataUrl(filePath) : null
  }
  return result
}

/* ─────────────────── IPC Handlers ─────────────────── */

function registerIpcHandlers() {

  // Select image file
  ipcMain.handle('select-image', async (_event, slot: string) => {
    if (!controlPanelWindow) return null
    const result = await dialog.showOpenDialog(controlPanelWindow, {
      title: `Select ${slot} Image`,
      filters: [
        { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp'] }
      ],
      properties: ['openFile']
    })
    if (result.canceled || result.filePaths.length === 0) return null
    const filePath = result.filePaths[0]
    const dataUrl = readImageAsDataUrl(filePath)
    return { path: filePath, dataUrl }
  })

  // Open overlay window
  ipcMain.handle('open-overlay', async () => {
    const settings = loadSettings()
    createOverlayWindow(
      settings.overlayWidth,
      settings.overlayHeight,
      settings.alwaysOnTop
    )
    return true
  })

  // Close overlay window
  ipcMain.handle('close-overlay', async () => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.close()
    }
    overlayWindow = null
    return true
  })

  // Forward avatar state to overlay
  ipcMain.on('avatar-state', (_event, payload) => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.webContents.send('avatar-state', payload)
    }
  })

  // Forward images to overlay
  ipcMain.on('overlay-images', (_event, imageData) => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.webContents.send('overlay-images', imageData)
    }
  })

  // Forward overlay settings to overlay
  ipcMain.on('overlay-settings', (_event, payload) => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.webContents.send('overlay-settings', payload)
    }
  })

  // Set always on top
  ipcMain.handle('set-always-on-top', async (_event, value: boolean) => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.setAlwaysOnTop(value)
    }
    return true
  })

  // Resize overlay
  ipcMain.handle('resize-overlay', async (_event, width: number, height: number) => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.setSize(width, height)
    }
    return true
  })

  // Save settings
  ipcMain.handle('save-settings', async (_event, settings) => {
    return saveSettings(settings)
  })

  // Load settings (with image data URLs)
  ipcMain.handle('load-settings', async () => {
    const settings = loadSettings()
    const imageData = loadAllImageData(settings.imagePaths as unknown as Record<string, string | null>)
    return { settings, imageData }
  })

  // Reset settings
  ipcMain.handle('reset-settings', async () => {
    const settings = resetSettings()
    return { settings, imageData: { idle: null, talk1: null, talk2: null, talk3: null, mute: null } }
  })
}

/* ─────────────────── App Lifecycle ─────────────────── */

app.whenReady().then(() => {
  Menu.setApplicationMenu(null)
  registerIpcHandlers()
  createControlPanel()
})

app.on('window-all-closed', () => {
  app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createControlPanel()
  }
})
