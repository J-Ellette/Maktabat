import { app, BrowserWindow, protocol, shell, session } from 'electron'
import path from 'path'
import { buildMenu } from './menu-builder.js'
import { TrayManager, sendNotification } from './tray-manager.js'
import { WindowManager } from './window-manager.js'
import { LibraryService } from './library-service.js'
import { UserService } from './user-service.js'
import { AccountService } from './account-service.js'
import { SyncService } from './sync-service.js'
import { ResourceManagerService } from './resource-manager.js'
import { registerIpcHandlers } from './ipc-handlers.js'

// ─── Services ──────────────────────────────────────────────────────────────────

const userData: string = app.getPath('userData')
const libraryDbPath: string = path.join(userData, 'library.db')
const userDbPath: string = path.join(userData, 'user.db')

let libraryService: LibraryService
let userService: UserService
let accountService: AccountService
let syncService: SyncService
let resourceManager: ResourceManagerService
const windowManager = new WindowManager()
let trayManager: TrayManager
let memoryMonitor: ReturnType<typeof setInterval> | undefined
let reminderTimer: ReturnType<typeof setInterval> | undefined

// ─── Protocol: maktabat:// ─────────────────────────────────────────────────────

// Register as a standard scheme so renderer can navigate to maktabat:// URLs
app.setAsDefaultProtocolClient('maktabat')

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'maktabat',
    privileges: { secure: true, standard: true, supportFetchAPI: false },
  },
])

// ─── File association: .mkt ────────────────────────────────────────────────────

/** Handle opening .mkt files passed as argv (Windows / Linux). */
function handleMktFile(filePath: string): void {
  const win = windowManager.getMainWindow()
  if (win) {
    win.show()
    win.focus()
    win.webContents.send('file:open-mkt', filePath)
  }
}

function parseArgvForMkt(argv: string[]): string | null {
  const mktArg = argv.find((a) => a.endsWith('.mkt'))
  return mktArg ?? null
}

// ─── App lifecycle ─────────────────────────────────────────────────────────────

app.on('will-finish-launching', () => {
  // macOS: open-file event fired before app is ready
  app.on('open-file', (event, filePath) => {
    event.preventDefault()
    if (filePath.endsWith('.mkt')) {
      handleMktFile(filePath)
    }
  })

  // macOS: open-url event for maktabat:// deep links
  app.on('open-url', (event, url) => {
    event.preventDefault()
    const win = windowManager.getMainWindow()
    if (win) {
      win.show()
      win.focus()
      win.webContents.send('protocol:open-url', url)
    }
  })
})

void app.whenReady().then(() => {
  // Initialise services
  libraryService = new LibraryService(libraryDbPath)
  userService = new UserService(userDbPath)
  accountService = new AccountService(userDbPath)
  syncService = new SyncService(userService)

  // Create ResourceManagerService with a progress callback that sends IPC events
  // to the renderer via webContents.
  resourceManager = new ResourceManagerService(
    libraryService,
    userData,
    (resourceKey, percentage, status, message) => {
      const win = windowManager.getMainWindow()
      if (win && !win.isDestroyed()) {
        win.webContents.send('resource:download-progress', {
          resourceKey,
          percentage,
          status,
          message,
        })
      }
    }
  )

  // Register IPC handlers
  registerIpcHandlers(libraryService, userService, accountService, syncService, resourceManager)

  // Warm up the FTS5 search index after startup (non-blocking)
  setImmediate(() => libraryService.warmUpSearchIndex())

  // ─── Content Security Policy ─────────────────────────────────────────────────
  const scriptSrc = app.isPackaged ? "'self'" : "'self' 'unsafe-eval'"
  const csp = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "img-src 'self' data:",
    "connect-src 'self'",
    "media-src 'self' blob:",
  ].join('; ')

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [csp],
        'X-Content-Type-Options': ['nosniff'],
        'X-Frame-Options': ['DENY'],
      },
    })
  })

  // Create main window
  windowManager.createMainWindow()

  // Build native menus
  buildMenu(() => windowManager.getMainWindow())

  // Set up tray
  trayManager = new TrayManager(windowManager)
  trayManager.create()

  // Register custom protocol handler (intercept maktabat:// in renderer)
  protocol.handle('maktabat', (request) => {
    // Translate maktabat://quran/2:255 → forward to renderer as a route event
    const win = windowManager.getMainWindow()
    if (win) {
      win.webContents.send('protocol:open-url', request.url)
    }
    // Return an empty response; renderer handles the navigation
    return new Response(null, { status: 204 })
  })

  // Handle .mkt files passed as command-line args (Windows / Linux)
  const mktFile = parseArgvForMkt(process.argv.slice(1))
  if (mktFile) handleMktFile(mktFile)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      windowManager.createMainWindow()
    }
  })

  // Send a test notification to confirm notification support on first run
  const firstRun = userService.getSetting<boolean>('app.firstRun', true)
  if (firstRun) {
    userService.setSetting('app.firstRun', false)
    sendNotification('Maktabat', 'Welcome to Maktabat — مكتبة. Your library is ready.')
  }

  // ─── Memory health monitor ────────────────────────────────────────────────────
  // Log memory usage every 5 minutes; warn if heap exceeds 512 MB
  const MEMORY_CHECK_INTERVAL_MS = 5 * 60 * 1000
  const MEMORY_WARN_THRESHOLD_MB = 512
  memoryMonitor = setInterval(() => {
    const mem = process.memoryUsage()
    const heapMB = Math.round(mem.heapUsed / 1024 / 1024)
    const rssMB = Math.round(mem.rss / 1024 / 1024)
    if (heapMB > MEMORY_WARN_THRESHOLD_MB) {
      console.warn(`[Maktabat] High memory usage — heap: ${heapMB} MB, RSS: ${rssMB} MB`)
    } else {
      console.info(`[Maktabat] Memory OK — heap: ${heapMB} MB, RSS: ${rssMB} MB`)
    }
  }, MEMORY_CHECK_INTERVAL_MS).unref()

  // ─── Reading plan reminder scheduler ─────────────────────────────────────────
  // Check every minute whether a reading plan reminder should fire
  reminderTimer = scheduleReadingPlanReminders()
})

function scheduleReadingPlanReminders(): ReturnType<typeof setInterval> {
  const CHECK_INTERVAL_MS = 60 * 1000 // every minute
  let lastFiredDate = ''

  return setInterval(() => {
    const remindersEnabled = userService?.getSetting<boolean>(
      'notifications.readingPlanReminders',
      true
    )
    if (!remindersEnabled) return

    const reminderTime = userService?.getSetting<string>('notifications.reminderTime', '08:00')
    const now = new Date()
    const todayKey = now.toISOString().slice(0, 10)
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    // Fire at most once per day at the configured time
    if (currentTime === reminderTime && lastFiredDate !== todayKey) {
      lastFiredDate = todayKey
      const plans = userService?.getAllReadingPlans() ?? []
      if (plans.length > 0) {
        const planKeys = plans.map((p) => p.plan_key).join(', ')
        sendNotification('Maktabat — Reading Reminder', `Time for your daily reading: ${planKeys}`)
      }
    }
  }, CHECK_INTERVAL_MS).unref()
}

// Handle .mkt files opened while app is already running (Windows second-instance)
app.on('second-instance', (_event, argv) => {
  const win = windowManager.getMainWindow()
  if (win) {
    if (win.isMinimized()) win.restore()
    win.focus()
  }
  const mktFile = parseArgvForMkt(argv.slice(1))
  if (mktFile) handleMktFile(mktFile)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  clearInterval(memoryMonitor)
  clearInterval(reminderTimer)
  trayManager?.destroy()
  libraryService?.close()
  userService?.close()
})

// Prevent navigation to external URLs in the main window (security)
app.on('web-contents-created', (_event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl)
    const allowedOrigins = new Set(['http://localhost:5173', 'maktabat:'])
    if (!allowedOrigins.has(parsedUrl.origin) && parsedUrl.protocol !== 'file:') {
      event.preventDefault()
      void shell.openExternal(navigationUrl)
    }
  })

  contents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url)
    return { action: 'deny' }
  })
})
