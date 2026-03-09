import { contextBridge, ipcRenderer } from 'electron'

const validChannels = [
  'library:search',
  'library:get-surahs',
  'library:get-ayah',
  'library:get-ayahs-by-surah',
  'library:get-translations',
  'library:get-tafsir',
  'library:get-tafsirs-for-ayah',
  'library:get-tafsirs-by-surah',
  'library:get-tafsir-keys',
  'library:get-hadith',
  'library:get-morphology',
  'library:get-word-occurrences',
  'user:save-note',
  'user:get-notes',
  'user:save-highlight',
  'user:get-highlights',
  'user:get-reading-plan',
  'audio:play',
  'audio:pause',
  'settings:get',
  'settings:set',
] as const

/** Channels that the main process can push to the renderer. */
const validReceiveChannels = [
  'menu:open-library',
  'menu:import-resource',
  'menu:export-notes',
  'menu:preferences',
  'menu:find',
  'menu:find-in-library',
  'menu:layout-single',
  'menu:layout-two',
  'menu:layout-three',
  'menu:theme',
  'menu:library-manager',
  'menu:download-resources',
  'menu:sync',
  'menu:reading-plans',
  'menu:khutbah-builder',
  'menu:study-templates',
  'menu:keyboard-shortcuts',
  'tray:verse-of-day',
  'file:open-mkt',
  'protocol:open-url',
] as const

type IpcChannel = (typeof validChannels)[number]
type ReceiveChannel = (typeof validReceiveChannels)[number]

contextBridge.exposeInMainWorld('maktabat', {
  invoke: (channel: IpcChannel, ...args: unknown[]): Promise<unknown> => {
    if ((validChannels as readonly string[]).includes(channel)) {
      return ipcRenderer.invoke(channel, ...args)
    }
    return Promise.reject(new Error(`Invalid IPC channel: ${channel}`))
  },
  on: (channel: ReceiveChannel, callback: (...args: unknown[]) => void): (() => void) => {
    if ((validReceiveChannels as readonly string[]).includes(channel)) {
      const listener = (_event: Electron.IpcRendererEvent, ...args: unknown[]): void =>
        callback(...args)
      ipcRenderer.on(channel, listener)
      return () => ipcRenderer.removeListener(channel, listener)
    }
    return () => {}
  },
})
