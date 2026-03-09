export { useTranslation } from 'react-i18next'
import i18n from '../i18n/index'
import { useSettingsStore } from '../store/settings-store'
import { useEffect } from 'react'

/**
 * Syncs the i18next language with the app settings store.
 * Call this once in the app root.
 */
export function useI18nSync(): void {
  const interfaceLanguage = useSettingsStore((s) => s.interfaceLanguage)
  useEffect(() => {
    const lang = interfaceLanguage === 'ar' ? 'ar' : 'en'
    if (i18n.language !== lang) {
      void i18n.changeLanguage(lang)
    }
  }, [interfaceLanguage])
}
