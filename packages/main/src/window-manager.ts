import { BrowserWindow, screen } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export class WindowManager {
  private mainWindow: BrowserWindow | null = null

  createMainWindow(): BrowserWindow {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize

    this.mainWindow = new BrowserWindow({
      width: Math.min(1400, width),
      height: Math.min(900, height),
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

    if (process.env['NODE_ENV'] === 'development') {
      void this.mainWindow.loadURL('http://localhost:5173')
    } else {
      void this.mainWindow.loadFile(path.join(__dirname, '../renderer/dist/index.html'))
    }

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show()
    })

    return this.mainWindow
  }

  getMainWindow(): BrowserWindow | null {
    return this.mainWindow
  }
}
