import { useEffect, useCallback } from 'react'
import { useAppStore } from '../store/app-store'

/**
 * Registers the Cmd+K / Ctrl+K shortcut to open the command palette and
 * provides helpers to open / close it imperatively.
 */
export function useCommandPalette() {
  const open = useAppStore((s) => s.commandPaletteOpen)
  const openPalette = useAppStore((s) => s.openCommandPalette)
  const closePalette = useAppStore((s) => s.closeCommandPalette)

  const toggle = useCallback(() => {
    if (open) closePalette()
    else openPalette()
  }, [open, openPalette, closePalette])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey
      if (isMod && e.key === 'k') {
        e.preventDefault()
        toggle()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [toggle])

  return { open, openPalette, closePalette, toggle }
}
