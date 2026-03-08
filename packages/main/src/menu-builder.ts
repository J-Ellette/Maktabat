import { app, Menu, MenuItem, shell, BrowserWindow } from 'electron'

export function buildMenu(getMainWindow: () => BrowserWindow | null): void {
  const isMac = process.platform === 'darwin'

  const template: Electron.MenuItemConstructorOptions[] = [
    // App menu (macOS only)
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' as const },
              { type: 'separator' as const },
              { role: 'services' as const },
              { type: 'separator' as const },
              { role: 'hide' as const },
              { role: 'hideOthers' as const },
              { role: 'unhide' as const },
              { type: 'separator' as const },
              { role: 'quit' as const },
            ],
          },
        ]
      : []),

    // File menu
    {
      label: 'File',
      submenu: [
        {
          label: 'New Window',
          accelerator: 'CmdOrCtrl+N',
          click: (): void => {
            // Emit event to main process to open new window
            app.emit('activate')
          },
        },
        { type: 'separator' },
        {
          label: 'Open Library',
          accelerator: 'CmdOrCtrl+O',
          click: (): void => {
            getMainWindow()?.webContents.send('menu:open-library')
          },
        },
        {
          label: 'Import Resource',
          accelerator: 'CmdOrCtrl+I',
          click: (): void => {
            getMainWindow()?.webContents.send('menu:import-resource')
          },
        },
        {
          label: 'Export Notes',
          accelerator: 'CmdOrCtrl+E',
          click: (): void => {
            getMainWindow()?.webContents.send('menu:export-notes')
          },
        },
        { type: 'separator' },
        {
          label: 'Preferences',
          accelerator: isMac ? 'Cmd+,' : 'Ctrl+,',
          click: (): void => {
            getMainWindow()?.webContents.send('menu:preferences')
          },
        },
        { type: 'separator' },
        isMac ? { role: 'close' as const } : { role: 'quit' as const },
      ],
    },

    // Edit menu
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' as const },
        { role: 'redo' as const },
        { type: 'separator' },
        { role: 'cut' as const },
        { role: 'copy' as const },
        { role: 'paste' as const },
        { type: 'separator' },
        {
          label: 'Find',
          accelerator: 'CmdOrCtrl+F',
          click: (): void => {
            getMainWindow()?.webContents.send('menu:find')
          },
        },
        {
          label: 'Find in Library',
          accelerator: 'CmdOrCtrl+Shift+F',
          click: (): void => {
            getMainWindow()?.webContents.send('menu:find-in-library')
          },
        },
        ...(isMac
          ? [
              { type: 'separator' as const },
              {
                label: 'Speech',
                submenu: [
                  { role: 'startSpeaking' as const },
                  { role: 'stopSpeaking' as const },
                ],
              },
            ]
          : []),
      ],
    },

    // View menu
    {
      label: 'View',
      submenu: [
        {
          label: 'Single Panel',
          accelerator: 'CmdOrCtrl+1',
          click: (): void => {
            getMainWindow()?.webContents.send('menu:layout-single')
          },
        },
        {
          label: 'Two Panels',
          accelerator: 'CmdOrCtrl+2',
          click: (): void => {
            getMainWindow()?.webContents.send('menu:layout-two')
          },
        },
        {
          label: 'Three Panels',
          accelerator: 'CmdOrCtrl+3',
          click: (): void => {
            getMainWindow()?.webContents.send('menu:layout-three')
          },
        },
        { type: 'separator' },
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+=',
          click: (): void => {
            const win = getMainWindow()
            if (win) win.webContents.setZoomFactor(win.webContents.getZoomFactor() + 0.1)
          },
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          click: (): void => {
            const win = getMainWindow()
            if (win) win.webContents.setZoomFactor(Math.max(0.5, win.webContents.getZoomFactor() - 0.1))
          },
        },
        {
          label: 'Reset Zoom',
          accelerator: 'CmdOrCtrl+0',
          click: (): void => {
            getMainWindow()?.webContents.setZoomFactor(1)
          },
        },
        { type: 'separator' },
        {
          label: 'Theme',
          submenu: [
            {
              label: 'Light',
              click: (): void => {
                getMainWindow()?.webContents.send('menu:theme', 'light')
              },
            },
            {
              label: 'Dark',
              click: (): void => {
                getMainWindow()?.webContents.send('menu:theme', 'dark')
              },
            },
            {
              label: 'Sepia',
              click: (): void => {
                getMainWindow()?.webContents.send('menu:theme', 'sepia')
              },
            },
          ],
        },
        { type: 'separator' },
        { role: 'togglefullscreen' as const },
      ],
    },

    // Library menu
    {
      label: 'Library',
      submenu: [
        {
          label: 'Library Manager',
          accelerator: 'CmdOrCtrl+L',
          click: (): void => {
            getMainWindow()?.webContents.send('menu:library-manager')
          },
        },
        {
          label: 'Download Resources',
          click: (): void => {
            getMainWindow()?.webContents.send('menu:download-resources')
          },
        },
        {
          label: 'Sync',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: (): void => {
            getMainWindow()?.webContents.send('menu:sync')
          },
        },
      ],
    },

    // Study menu
    {
      label: 'Study',
      submenu: [
        {
          label: 'Reading Plans',
          click: (): void => {
            getMainWindow()?.webContents.send('menu:reading-plans')
          },
        },
        {
          label: 'Khutbah Builder',
          click: (): void => {
            getMainWindow()?.webContents.send('menu:khutbah-builder')
          },
        },
        {
          label: 'Study Templates',
          click: (): void => {
            getMainWindow()?.webContents.send('menu:study-templates')
          },
        },
      ],
    },

    // Help menu
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation',
          click: async (): Promise<void> => {
            await shell.openExternal('https://github.com/maktabat/maktabat/wiki')
          },
        },
        {
          label: 'Keyboard Shortcuts',
          accelerator: 'CmdOrCtrl+/',
          click: (): void => {
            getMainWindow()?.webContents.send('menu:keyboard-shortcuts')
          },
        },
        { type: 'separator' },
        ...(!isMac
          ? [
              {
                label: 'About Maktabat',
                click: (): void => {
                  app.showAboutPanel()
                },
              },
            ]
          : []),
      ],
    },
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
