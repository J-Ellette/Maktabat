import { useEffect } from 'react'
import { useSettingsStore } from '../store/settings-store'

/**
 * Returns the current document direction ('rtl' | 'ltr') based on the active
 * interface language.  Also applies the `dir` attribute to `<html>` so that
 * Tailwind RTL utilities and CSS `[dir='rtl']` selectors work globally.
 */
export function useDirection(): 'rtl' | 'ltr' {
  const interfaceLanguage = useSettingsStore((s) => s.interfaceLanguage)
  const dir: 'rtl' | 'ltr' = interfaceLanguage === 'ar' ? 'rtl' : 'ltr'

  useEffect(() => {
    document.documentElement.setAttribute('dir', dir)
  }, [dir])

  return dir
}
