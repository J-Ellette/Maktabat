import { app, Menu, MenuItem, Notification, Tray, nativeImage } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import type { WindowManager } from './window-manager.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// A rotating selection of short adhkar for the tray menu
const DAILY_ADHKAR = [
  'سبحان الله — SubhanAllah (Glory be to Allah)',
  'الحمد لله — Alhamdulillah (All praise is due to Allah)',
  'الله أكبر — Allahu Akbar (Allah is the Greatest)',
  'لا إله إلا الله — La ilaha illallah (There is no god but Allah)',
  'أستغفر الله — Astaghfirullah (I seek forgiveness from Allah)',
  'لا حول ولا قوة إلا بالله — La hawla wala quwwata illa billah',
  'بسم الله الرحمن الرحيم — Bismillah ir-Rahman ir-Rahim',
]

function getTodaysDhikr(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000
  )
  const idx = dayOfYear % DAILY_ADHKAR.length
  return DAILY_ADHKAR[idx] ?? DAILY_ADHKAR[0] ?? 'سبحان الله'
}

export class TrayManager {
  private tray: Tray | null = null
  private windowManager: WindowManager

  constructor(windowManager: WindowManager) {
    this.windowManager = windowManager
  }

  create(): void {
    // Use a minimal 16×16 image if no icon asset is available at runtime.
    // The real icon would be bundled at assets/tray-icon.png in production.
    const iconPath = path.join(__dirname, '../../assets/tray-icon.png')
    let icon: Electron.NativeImage
    try {
      icon = nativeImage.createFromPath(iconPath)
      if (icon.isEmpty()) {
        icon = nativeImage.createEmpty()
      }
    } catch {
      icon = nativeImage.createEmpty()
    }

    this.tray = new Tray(icon)
    this.tray.setToolTip('Maktabat — مكتبة')
    this.updateMenu()

    this.tray.on('double-click', () => {
      const win = this.windowManager.getMainWindow()
      if (win) {
        if (win.isMinimized()) win.restore()
        win.show()
        win.focus()
      }
    })
  }

  updateMenu(): void {
    if (!this.tray) return

    const dhikr = getTodaysDhikr()
    const contextMenu = Menu.buildFromTemplate([
      new MenuItem({ label: 'Daily Dhikr', enabled: false }),
      new MenuItem({ label: dhikr, enabled: false }),
      new MenuItem({ type: 'separator' }),
      new MenuItem({
        label: 'Show Maktabat',
        click: (): void => {
          const win = this.windowManager.getMainWindow()
          if (win) {
            if (win.isMinimized()) win.restore()
            win.show()
            win.focus()
          }
        },
      }),
      new MenuItem({
        label: 'Verse of the Day',
        click: (): void => {
          const win = this.windowManager.getMainWindow()
          if (win) {
            win.show()
            win.focus()
            win.webContents.send('tray:verse-of-day')
          }
        },
      }),
      new MenuItem({ type: 'separator' }),
      new MenuItem({ label: 'Quit Maktabat', click: (): void => app.quit() }),
    ])
    this.tray.setContextMenu(contextMenu)
  }

  destroy(): void {
    this.tray?.destroy()
    this.tray = null
  }
}

/** Send a desktop notification (reading plan reminder, download complete, etc.). */
export function sendNotification(title: string, body: string): void {
  if (Notification.isSupported()) {
    new Notification({ title, body }).show()
  }
}
