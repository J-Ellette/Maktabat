import { app, BrowserWindow } from 'electron'
import { WindowManager } from './window-manager.js'

const windowManager = new WindowManager()

app.whenReady().then(() => {
  windowManager.createMainWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      windowManager.createMainWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
