import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  useSettingsStore,
  type Theme,
  type ArabicScript,
  type TransliterationSystem,
  type InterfaceLanguage,
  type FontSizes,
  type ShortcutMap,
} from '../../store/settings-store'

// ────────────────────────────────────────────────────────────────
// Appearance
// ────────────────────────────────────────────────────────────────
function AppearanceSettings() {
  const theme = useSettingsStore((s) => s.theme)
  const setTheme = useSettingsStore((s) => s.setTheme)
  const fontSizes = useSettingsStore((s) => s.fontSizes)
  const setFontSize = useSettingsStore((s) => s.setFontSize)

  const themes: { key: Theme; label: string; description: string }[] = [
    { key: 'light', label: '☀️ Light', description: 'Clean white background' },
    { key: 'dark', label: '🌙 Dark', description: 'Easy on the eyes at night' },
    { key: 'sepia', label: '📜 Sepia', description: 'Warm parchment tone for long reading' },
  ]

  const fontPanels: { key: keyof FontSizes; label: string }[] = [
    { key: 'quran', label: 'Quran Arabic Text' },
    { key: 'translation', label: 'Translation' },
    { key: 'tafsir', label: 'Tafsir' },
    { key: 'hadith', label: 'Hadith' },
    { key: 'body', label: 'Body Text' },
  ]

  return (
    <div className="flex flex-col gap-8">
      {/* Theme */}
      <section>
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
          Theme
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {themes.map((t) => (
            <button
              key={t.key}
              onClick={() => setTheme(t.key)}
              aria-pressed={theme === t.key}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                theme === t.key
                  ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5'
                  : 'border-[var(--border-color)] hover:border-[var(--accent-primary)]/50'
              }`}
            >
              <div className="text-lg mb-1">{t.label}</div>
              <div className="text-xs text-[var(--text-secondary)]">{t.description}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Font sizes */}
      <section>
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
          Font Sizes
        </h3>
        <div className="flex flex-col gap-4">
          {fontPanels.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-4">
              <label
                htmlFor={`font-${key}`}
                className="w-48 text-sm text-[var(--text-primary)] flex-shrink-0"
              >
                {label}
              </label>
              <input
                id={`font-${key}`}
                type="range"
                min={10}
                max={36}
                step={1}
                value={fontSizes[key]}
                onChange={(e) => setFontSize(key, Number(e.target.value))}
                className="flex-1 accent-[var(--accent-primary)]"
                aria-valuemin={10}
                aria-valuemax={36}
                aria-valuenow={fontSizes[key]}
              />
              <span className="w-12 text-sm text-[var(--text-secondary)] text-right font-mono">
                {fontSizes[key]}px
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────
// Language
// ────────────────────────────────────────────────────────────────
function LanguageSettings() {
  const arabicScript = useSettingsStore((s) => s.arabicScript)
  const setArabicScript = useSettingsStore((s) => s.setArabicScript)
  const transliterationSystem = useSettingsStore((s) => s.transliterationSystem)
  const setTransliterationSystem = useSettingsStore((s) => s.setTransliterationSystem)
  const interfaceLanguage = useSettingsStore((s) => s.interfaceLanguage)
  const setInterfaceLanguage = useSettingsStore((s) => s.setInterfaceLanguage)

  const scripts: { key: ArabicScript; label: string; arabic: string; description: string }[] = [
    {
      key: 'hafs',
      label: 'Hafs an Asim',
      arabic: 'حَفْص عَن عَاصِم',
      description: 'Most widely used riwayah worldwide',
    },
    {
      key: 'warsh',
      label: 'Warsh an Nafi',
      arabic: 'وَرْش عَن نَافِع',
      description: 'Common in North and West Africa',
    },
    {
      key: 'qalun',
      label: 'Qalun an Nafi',
      arabic: 'قَالُون عَن نَافِع',
      description: 'Used in Libya and Tunisia',
    },
  ]

  const systems: { key: TransliterationSystem; label: string; example: string }[] = [
    { key: 'loc', label: 'Library of Congress', example: 'al-Ḥamd' },
    { key: 'ala-lc', label: 'ALA-LC Romanization', example: 'al-Ḥamd' },
    { key: 'simple', label: 'Simplified', example: 'al-Hamd' },
  ]

  const languages: { key: InterfaceLanguage; label: string }[] = [
    { key: 'en', label: '🇬🇧 English' },
    { key: 'ar', label: '🇸🇦 العربية' },
  ]

  return (
    <div className="flex flex-col gap-8">
      {/* Interface Language */}
      <section>
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
          Interface Language
        </h3>
        <div className="flex gap-3">
          {languages.map((lang) => (
            <button
              key={lang.key}
              onClick={() => setInterfaceLanguage(lang.key)}
              aria-pressed={interfaceLanguage === lang.key}
              className={`px-6 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                interfaceLanguage === lang.key
                  ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5 text-[var(--accent-primary)]'
                  : 'border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--accent-primary)]/50'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </section>

      {/* Arabic Script */}
      <section>
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
          Default Arabic Script (Riwayah)
        </h3>
        <div className="flex flex-col gap-3">
          {scripts.map((s) => (
            <button
              key={s.key}
              onClick={() => setArabicScript(s.key)}
              aria-pressed={arabicScript === s.key}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                arabicScript === s.key
                  ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5'
                  : 'border-[var(--border-color)] hover:border-[var(--accent-primary)]/50'
              }`}
            >
              <div className="quran-text text-xl">{s.arabic}</div>
              <div>
                <div className="text-sm font-medium text-[var(--text-primary)]">{s.label}</div>
                <div className="text-xs text-[var(--text-secondary)]">{s.description}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Transliteration */}
      <section>
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
          Transliteration System
        </h3>
        <div className="flex flex-col gap-2">
          {systems.map((sys) => (
            <button
              key={sys.key}
              onClick={() => setTransliterationSystem(sys.key)}
              aria-pressed={transliterationSystem === sys.key}
              className={`flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all ${
                transliterationSystem === sys.key
                  ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5'
                  : 'border-[var(--border-color)] hover:border-[var(--accent-primary)]/50'
              }`}
            >
              <span className="text-sm font-medium text-[var(--text-primary)]">{sys.label}</span>
              <span className="font-mono text-sm text-[var(--text-secondary)]">{sys.example}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────
// Library
// ────────────────────────────────────────────────────────────────
function LibrarySettings() {
  return (
    <div>
      <p className="text-sm text-[var(--text-secondary)] mb-4">
        Manage your installed resources, browse the catalog, and import your own materials.
      </p>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault()
          // Navigate to the dedicated Library Manager page
          window.location.hash = '/library'
        }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
      >
        Open Library Manager →
      </a>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────
// Account
// ────────────────────────────────────────────────────────────────
function AccountSettings() {
  return (
    <div>
      <p className="text-sm text-[var(--text-secondary)] mb-4">
        Sign in to sync your notes, highlights, and reading progress across devices.
      </p>
      <div className="mb-4">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault()
            window.location.hash = '/account'
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Open Account Panel →
        </a>
      </div>
      <div>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault()
            window.location.hash = '/sync'
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border-color)] text-[var(--text-primary)] text-sm font-semibold hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-colors"
        >
          Sync &amp; Backup Settings →
        </a>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────
// Keyboard Shortcuts
// ────────────────────────────────────────────────────────────────
function ShortcutsSettings() {
  const shortcuts = useSettingsStore((s) => s.shortcuts)
  const setShortcut = useSettingsStore((s) => s.setShortcut)
  const [editing, setEditing] = useState<keyof ShortcutMap | null>(null)

  const shortcutList: { key: keyof ShortcutMap; label: string }[] = [
    { key: 'commandPalette', label: 'Command Palette' },
    { key: 'find', label: 'Find' },
    { key: 'findInLibrary', label: 'Find in Library' },
    { key: 'back', label: 'Navigate Back' },
    { key: 'forward', label: 'Navigate Forward' },
    { key: 'newPanel', label: 'New Panel' },
    { key: 'closePanel', label: 'Close Panel' },
    { key: 'layoutSingle', label: 'Single Panel Layout' },
    { key: 'layoutTwo', label: 'Two Panel Layout' },
    { key: 'layoutThree', label: 'Three Panel Layout' },
  ]

  function handleKeyCapture(e: React.KeyboardEvent, key: keyof ShortcutMap) {
    e.preventDefault()
    if (e.key === 'Escape') {
      setEditing(null)
      return
    }
    const parts: string[] = []
    if (e.metaKey || e.ctrlKey) parts.push('Mod')
    if (e.altKey) parts.push('Alt')
    if (e.shiftKey) parts.push('Shift')
    const keyName = e.key.length === 1 ? e.key.toUpperCase() : e.key
    if (!['Meta', 'Control', 'Alt', 'Shift'].includes(keyName)) {
      parts.push(keyName)
    }
    if (parts.length > 1 || (parts.length === 1 && parts[0] !== 'Mod')) {
      setShortcut(key, parts.join('+'))
      setEditing(null)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-[var(--text-secondary)] mb-2">
        Click a shortcut to rebind it. Press{' '}
        <kbd className="px-1 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs">
          Esc
        </kbd>{' '}
        to cancel.
      </p>
      {shortcutList.map(({ key, label }) => (
        <div
          key={key}
          className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]"
        >
          <span className="text-sm text-[var(--text-primary)]">{label}</span>
          {editing === key ? (
            <div
              className="px-3 py-1.5 rounded-lg border-2 border-[var(--accent-primary)] bg-[var(--bg-primary)] text-sm font-mono text-[var(--accent-primary)] min-w-[120px] text-center cursor-pointer outline-none"
              tabIndex={0}
              onKeyDown={(e) => handleKeyCapture(e, key)}
              onBlur={() => setEditing(null)}
              autoFocus
              aria-label={`Press keys for ${label}`}
            >
              Press keys…
            </div>
          ) : (
            <button
              onClick={() => setEditing(key)}
              className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-sm font-mono text-[var(--text-secondary)] hover:border-[var(--accent-primary)] transition-colors min-w-[120px] text-center"
            >
              {shortcuts[key]}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

// ────────────────────────────────────────────────────────────────
// Accessibility
// ────────────────────────────────────────────────────────────────
function AccessibilitySettings() {
  const accessibility = useSettingsStore((s) => s.accessibility)
  const setAccessibility = useSettingsStore((s) => s.setAccessibility)

  const toggles = [
    {
      key: 'highContrast' as const,
      label: 'High Contrast',
      description: 'Increases contrast ratio for better readability',
    },
    {
      key: 'reducedMotion' as const,
      label: 'Reduced Motion',
      description: 'Disables animations and transitions',
    },
    {
      key: 'screenReaderOptimized' as const,
      label: 'Screen Reader Optimized',
      description: 'Enhanced ARIA labels and focus management',
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      {toggles.map(({ key, label, description }) => (
        <div
          key={key}
          className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]"
        >
          <div>
            <div className="text-sm font-medium text-[var(--text-primary)]">{label}</div>
            <div className="text-xs text-[var(--text-secondary)] mt-0.5">{description}</div>
          </div>
          <button
            role="switch"
            aria-checked={accessibility[key]}
            onClick={() => setAccessibility({ [key]: !accessibility[key] })}
            className={`relative inline-flex h-6 w-11 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] ${
              accessibility[key] ? 'bg-[var(--accent-primary)]' : 'bg-[var(--border-color)]'
            }`}
          >
            <span
              className={`inline-block w-4 h-4 mt-1 rounded-full bg-white shadow transition-transform ${
                accessibility[key] ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      ))}
    </div>
  )
}

// ────────────────────────────────────────────────────────────────
// Notifications
// ────────────────────────────────────────────────────────────────
function NotificationSettings() {
  const notifications = useSettingsStore((s) => s.notifications)
  const setNotifications = useSettingsStore((s) => s.setNotifications)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
        <div>
          <div className="text-sm font-medium text-[var(--text-primary)]">
            Reading Plan Reminders
          </div>
          <div className="text-xs text-[var(--text-secondary)] mt-0.5">
            Daily reminder to maintain your reading streak
          </div>
        </div>
        <button
          role="switch"
          aria-checked={notifications.readingPlanReminders}
          onClick={() =>
            setNotifications({
              readingPlanReminders: !notifications.readingPlanReminders,
            })
          }
          className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
            notifications.readingPlanReminders
              ? 'bg-[var(--accent-primary)]'
              : 'bg-[var(--border-color)]'
          }`}
        >
          <span
            className={`inline-block w-4 h-4 mt-1 rounded-full bg-white shadow transition-transform ${
              notifications.readingPlanReminders ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {notifications.readingPlanReminders && (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
          <label htmlFor="reminder-time" className="text-sm text-[var(--text-primary)]">
            Reminder Time
          </label>
          <input
            id="reminder-time"
            type="time"
            value={notifications.reminderTime}
            onChange={(e) => setNotifications({ reminderTime: e.target.value })}
            className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
          />
        </div>
      )}

      <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
        <div>
          <div className="text-sm font-medium text-[var(--text-primary)]">New Resource Alerts</div>
          <div className="text-xs text-[var(--text-secondary)] mt-0.5">
            Notified when new resources become available for your subscription
          </div>
        </div>
        <button
          role="switch"
          aria-checked={notifications.newResourceAlerts}
          onClick={() =>
            setNotifications({
              newResourceAlerts: !notifications.newResourceAlerts,
            })
          }
          className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
            notifications.newResourceAlerts
              ? 'bg-[var(--accent-primary)]'
              : 'bg-[var(--border-color)]'
          }`}
        >
          <span
            className={`inline-block w-4 h-4 mt-1 rounded-full bg-white shadow transition-transform ${
              notifications.newResourceAlerts ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────
// Main Settings Panel
// ────────────────────────────────────────────────────────────────
type SettingsSection =
  | 'appearance'
  | 'language'
  | 'library'
  | 'account'
  | 'shortcuts'
  | 'accessibility'
  | 'notifications'

interface SectionMeta {
  key: SettingsSection
  label: string
  icon: string
  description: string
}

const sections: SectionMeta[] = [
  {
    key: 'appearance',
    label: 'Appearance',
    icon: '🎨',
    description: 'Theme, font sizes, color accents',
  },
  {
    key: 'language',
    label: 'Language',
    icon: '🌐',
    description: 'Interface language, Arabic script, transliteration',
  },
  {
    key: 'library',
    label: 'Library',
    icon: '📚',
    description: 'Installed resources, downloads, storage',
  },
  { key: 'account', label: 'Account', icon: '👤', description: 'Subscription, sign in, sync' },
  {
    key: 'shortcuts',
    label: 'Keyboard Shortcuts',
    icon: '⌨️',
    description: 'Customize keyboard shortcuts',
  },
  {
    key: 'accessibility',
    label: 'Accessibility',
    icon: '♿',
    description: 'High contrast, reduced motion, screen reader',
  },
  {
    key: 'notifications',
    label: 'Notifications',
    icon: '🔔',
    description: 'Reading reminders, resource alerts',
  },
]

export default function SettingsPanel(): React.ReactElement {
  const { section: sectionParam } = useParams<{ section?: SettingsSection }>()
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState<SettingsSection>(
    (sectionParam as SettingsSection) ?? 'appearance'
  )

  function handleSectionChange(key: SettingsSection) {
    setActiveSection(key)
    void navigate(`/settings/${key}`, { replace: true })
  }

  const activeTitle = sections.find((s) => s.key === activeSection)?.label ?? 'Settings'

  return (
    <div className="flex h-full">
      {/* Settings sidebar */}
      <nav
        className="w-56 flex-shrink-0 border-e border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-y-auto"
        aria-label="Settings sections"
      >
        <div className="p-4 border-b border-[var(--border-color)]">
          <h2 className="font-latin-display text-lg font-semibold text-[var(--text-primary)]">
            Settings
          </h2>
        </div>
        <ul className="p-2 flex flex-col gap-0.5">
          {sections.map((s) => (
            <li key={s.key}>
              <button
                onClick={() => handleSectionChange(s.key)}
                aria-current={activeSection === s.key ? 'page' : undefined}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-sm transition-colors ${
                  activeSection === s.key
                    ? 'bg-[var(--accent-primary)] text-white'
                    : 'text-[var(--text-primary)] hover:bg-[var(--bg-primary)]'
                }`}
              >
                <span className="text-base">{s.icon}</span>
                <span className="truncate">{s.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Settings content */}
      <main className="flex-1 overflow-y-auto p-8">
        <h2 className="font-latin-display text-2xl font-semibold text-[var(--text-primary)] mb-6">
          {activeTitle}
        </h2>

        {activeSection === 'appearance' && <AppearanceSettings />}
        {activeSection === 'language' && <LanguageSettings />}
        {activeSection === 'library' && <LibrarySettings />}
        {activeSection === 'account' && <AccountSettings />}
        {activeSection === 'shortcuts' && <ShortcutsSettings />}
        {activeSection === 'accessibility' && <AccessibilitySettings />}
        {activeSection === 'notifications' && <NotificationSettings />}
      </main>
    </div>
  )
}
