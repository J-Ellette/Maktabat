/**
 * useIpc — returns the window.maktabat bridge (or null in browser / test environments).
 * Usage: const ipc = useIpc(); if (ipc) await ipc.invoke('library:get-surahs')
 */

type IpcBridge = {
  invoke: (channel: string, ...args: unknown[]) => Promise<unknown>
  on: (channel: string, callback: (...args: unknown[]) => void) => () => void
}

export function useIpc(): IpcBridge | null {
  return (window as Window & { maktabat?: IpcBridge }).maktabat ?? null
}
