import { app, BrowserWindow, screen } from 'electron'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

interface WindowState {
  x?: number
  y?: number
  width: number
  height: number
  isMaximized: boolean
}

const DEFAULT_STATE: WindowState = { width: 1400, height: 900, isMaximized: false }

function getWindowStateFile(): string {
  return path.join(app.getPath('userData'), 'window-state.json')
}

function loadWindowState(): WindowState {
  try {
    const raw = fs.readFileSync(getWindowStateFile(), 'utf-8')
    return JSON.parse(raw) as WindowState
  } catch {
    return { ...DEFAULT_STATE }
  }
}

function saveWindowState(win: BrowserWindow): void {
  const isMaximized = win.isMaximized()
  const bounds = win.getNormalBounds()
  const state: WindowState = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    isMaximized,
  }
  try {
    fs.writeFileSync(getWindowStateFile(), JSON.stringify(state, null, 2))
  } catch {
    // ignore write errors
  }
}

export class WindowManager {
  private mainWindow: BrowserWindow | null = null
  private detachedWindows: Set<BrowserWindow> = new Set()

  createMainWindow(): BrowserWindow {
    const { width: screenW, height: screenH } = screen.getPrimaryDisplay().workAreaSize
    const saved = loadWindowState()

    // Clamp dimensions to screen size
    const winWidth = Math.min(saved.width, screenW)
    const winHeight = Math.min(saved.height, screenH)

    this.mainWindow = new BrowserWindow({
      x: saved.x,
      y: saved.y,
      width: winWidth,
      height: winHeight,
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
      titleBarStyle: 'hiddenInset',
      show: false,
    })

    if (saved.isMaximized) {
      this.mainWindow.maximize()
    }

    this.loadURL(this.mainWindow)

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show()
    })

    // Persist state on close / resize / move
    this.mainWindow.on('close', () => {
      if (this.mainWindow) saveWindowState(this.mainWindow)
    })
    this.mainWindow.on('resize', () => {
      if (this.mainWindow && !this.mainWindow.isMaximized()) saveWindowState(this.mainWindow)
    })
    this.mainWindow.on('move', () => {
      if (this.mainWindow && !this.mainWindow.isMaximized()) saveWindowState(this.mainWindow)
    })

    this.mainWindow.on('closed', () => {
      this.mainWindow = null
    })

    return this.mainWindow
  }

  /** Open a detached panel window (same renderer, different route). */
  createDetachedWindow(initialPath = '/'): BrowserWindow {
    const win = new BrowserWindow({
      width: 900,
      height: 700,
      minWidth: 400,
      minHeight: 400,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
      titleBarStyle: 'hiddenInset',
      show: false,
    })

    this.loadURL(win, initialPath)

    win.once('ready-to-show', () => win.show())
    win.on('closed', () => this.detachedWindows.delete(win))

    this.detachedWindows.add(win)
    return win
  }

  private loadURL(win: BrowserWindow, hashPath = '/'): void {
    if (process.env['NODE_ENV'] === 'development') {
      const url = `http://localhost:5173${hashPath !== '/' ? `#${hashPath}` : ''}`
      void win.loadURL(url)
    } else {
      const filePath = path.join(__dirname, '../renderer/dist/index.html')
      const hash = hashPath !== '/' ? `#${hashPath}` : ''
      void win.loadFile(filePath, { hash })
    }
  }

  getMainWindow(): BrowserWindow | null {
    return this.mainWindow
  }

  getAllWindows(): BrowserWindow[] {
    const wins: BrowserWindow[] = []
    if (this.mainWindow) wins.push(this.mainWindow)
    this.detachedWindows.forEach((w) => wins.push(w))
    return wins
  }
}
