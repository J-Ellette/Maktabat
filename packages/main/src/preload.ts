import { contextBridge, ipcRenderer } from 'electron'

const validChannels = [
  'library:search',
  'library:get-ayah',
  'library:get-tafsir',
  'library:get-hadith',
  'library:get-morphology',
  'user:save-note',
  'user:get-notes',
  'user:save-highlight',
  'user:get-reading-plan',
  'audio:play',
  'audio:pause',
  'settings:get',
  'settings:set',
] as const

type IpcChannel = (typeof validChannels)[number]

contextBridge.exposeInMainWorld('maktabat', {
  invoke: (channel: IpcChannel, ...args: unknown[]): Promise<unknown> => {
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args)
    }
    return Promise.reject(new Error(`Invalid IPC channel: ${channel}`))
  },
  on: (channel: IpcChannel, callback: (...args: unknown[]) => void): (() => void) => {
    if (validChannels.includes(channel)) {
      const listener = (_event: Electron.IpcRendererEvent, ...args: unknown[]): void =>
        callback(...args)
      ipcRenderer.on(channel, listener)
      return () => ipcRenderer.removeListener(channel, listener)
    }
    return () => {}
  },
})
