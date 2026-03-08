import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'sepia'
export type ArabicScript = 'hafs' | 'warsh' | 'qalun'
export type TransliterationSystem = 'loc' | 'ala-lc' | 'simple'
export type InterfaceLanguage = 'en' | 'ar'

export interface FontSizes {
  quran: number
  translation: number
  tafsir: number
  hadith: number
  body: number
}

export interface AccessibilitySettings {
  highContrast: boolean
  reducedMotion: boolean
  screenReaderOptimized: boolean
}

export interface NotificationSettings {
  readingPlanReminders: boolean
  newResourceAlerts: boolean
  reminderTime: string // e.g., "08:00"
}

export interface ShortcutMap {
  commandPalette: string
  find: string
  findInLibrary: string
  back: string
  forward: string
  newPanel: string
  closePanel: string
  layoutSingle: string
  layoutTwo: string
  layoutThree: string
}

export interface SettingsState {
  theme: Theme
  fontSizes: FontSizes
  arabicScript: ArabicScript
  transliterationSystem: TransliterationSystem
  interfaceLanguage: InterfaceLanguage
  accessibility: AccessibilitySettings
  notifications: NotificationSettings
  shortcuts: ShortcutMap
  // Actions
  setTheme: (theme: Theme) => void
  setFontSize: (panel: keyof FontSizes, size: number) => void
  setArabicScript: (script: ArabicScript) => void
  setTransliterationSystem: (system: TransliterationSystem) => void
  setInterfaceLanguage: (lang: InterfaceLanguage) => void
  setAccessibility: (settings: Partial<AccessibilitySettings>) => void
  setNotifications: (settings: Partial<NotificationSettings>) => void
  setShortcut: (action: keyof ShortcutMap, keys: string) => void
}

const defaultFontSizes: FontSizes = {
  quran: 24,
  translation: 16,
  tafsir: 15,
  hadith: 16,
  body: 15,
}

const defaultAccessibility: AccessibilitySettings = {
  highContrast: false,
  reducedMotion: false,
  screenReaderOptimized: false,
}

const defaultNotifications: NotificationSettings = {
  readingPlanReminders: true,
  newResourceAlerts: true,
  reminderTime: '08:00',
}

const defaultShortcuts: ShortcutMap = {
  commandPalette: 'Mod+K',
  find: 'Mod+F',
  findInLibrary: 'Mod+Shift+F',
  back: 'Alt+ArrowLeft',
  forward: 'Alt+ArrowRight',
  newPanel: 'Mod+\\',
  closePanel: 'Mod+W',
  layoutSingle: 'Mod+1',
  layoutTwo: 'Mod+2',
  layoutThree: 'Mod+3',
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'light',
      fontSizes: defaultFontSizes,
      arabicScript: 'hafs',
      transliterationSystem: 'loc',
      interfaceLanguage: 'en',
      accessibility: defaultAccessibility,
      notifications: defaultNotifications,
      shortcuts: defaultShortcuts,

      setTheme: (theme) => set({ theme }),
      setFontSize: (panel, size) =>
        set((state) => ({
          fontSizes: { ...state.fontSizes, [panel]: size },
        })),
      setArabicScript: (arabicScript) => set({ arabicScript }),
      setTransliterationSystem: (transliterationSystem) => set({ transliterationSystem }),
      setInterfaceLanguage: (interfaceLanguage) => set({ interfaceLanguage }),
      setAccessibility: (settings) =>
        set((state) => ({
          accessibility: { ...state.accessibility, ...settings },
        })),
      setNotifications: (settings) =>
        set((state) => ({
          notifications: { ...state.notifications, ...settings },
        })),
      setShortcut: (action, keys) =>
        set((state) => ({
          shortcuts: { ...state.shortcuts, [action]: keys },
        })),
    }),
    {
      name: 'maktabat-settings',
    }
  )
)
