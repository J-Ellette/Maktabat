import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Panel, Group, Separator } from 'react-resizable-panels'
import { useAppStore, type PanelLayout } from '../../store/app-store'
import { useSettingsStore } from '../../store/settings-store'
import { useDirection } from '../../hooks/useDirection'
import { useCommandPalette } from '../../hooks/useCommandPalette'
import Sidebar from './Sidebar'
import PanelWorkspace from './PanelWorkspace'
import CommandPalette from '../navigation/CommandPalette'
import NavigationControls from '../navigation/NavigationControls'
import AddressBar from '../navigation/AddressBar'

// ────────────────────────────────────────────────────────────────
// Theme provider: applies CSS class + sync with settings store
// ────────────────────────────────────────────────────────────────
function ThemeSynchronizer() {
  const theme = useSettingsStore((s) => s.theme)
  const accessibility = useSettingsStore((s) => s.accessibility)

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark', 'sepia')
    root.classList.add(theme)
    if (accessibility.highContrast) root.classList.add('high-contrast')
    else root.classList.remove('high-contrast')
    if (accessibility.reducedMotion) root.style.setProperty('--transition-speed', '0ms')
    else root.style.removeProperty('--transition-speed')
  }, [theme, accessibility])

  return null
}

// ────────────────────────────────────────────────────────────────
// IPC menu channel listener
// ────────────────────────────────────────────────────────────────
function IpcMenuListener({ onLayoutChange }: { onLayoutChange: (layout: PanelLayout) => void }) {
  const navigate = useNavigate()
  const openCommandPalette = useAppStore((s) => s.openCommandPalette)
  const setTheme = useSettingsStore((s) => s.setTheme)

  type MaktabatBridge = { on: (channel: string, cb: (data: unknown) => void) => void }
  const maktabatBridge = (window as Window & { maktabat?: MaktabatBridge }).maktabat

  useEffect(() => {
    const maktabat = maktabatBridge
    if (!maktabat) return

    maktabat.on('menu:preferences', () => void navigate('/settings'))
    maktabat.on('menu:find', () => openCommandPalette())
    maktabat.on('menu:find-in-library', () => openCommandPalette())
    maktabat.on('menu:layout-single', () => onLayoutChange('single'))
    maktabat.on('menu:layout-two', () => onLayoutChange('two-column'))
    maktabat.on('menu:layout-three', () => onLayoutChange('three-column'))
    maktabat.on('menu:theme', (data) => {
      const t = data as { theme: 'light' | 'dark' | 'sepia' }
      if (t?.theme) setTheme(t.theme)
    })
    maktabat.on('menu:reading-plans', () => void navigate('/reading-plans'))
    maktabat.on('menu:khutbah-builder', () => void navigate('/khutbah'))
    maktabat.on('menu:library-manager', () => void navigate('/library'))
    maktabat.on('protocol:open-url', (data) => {
      const url = String(data ?? '').replace('maktabat://', '/')
      void navigate(url)
    })
  }, [navigate, openCommandPalette, onLayoutChange, setTheme, maktabatBridge])

  return null
}

// ────────────────────────────────────────────────────────────────
// Top toolbar
// ────────────────────────────────────────────────────────────────
function Toolbar({
  onLayoutChange,
}: {
  onLayoutChange: (layout: PanelLayout) => void
}): React.ReactElement {
  const navigate = useNavigate()
  const layout = useAppStore((s) => s.layout)
  const sidebarOpen = useAppStore((s) => s.sidebarOpen)
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)
  const theme = useSettingsStore((s) => s.theme)
  const setTheme = useSettingsStore((s) => s.setTheme)
  const { openPalette } = useCommandPalette()

  const themes = [
    { key: 'light' as const, label: '☀️', title: 'Light mode' },
    { key: 'dark' as const, label: '🌙', title: 'Dark mode' },
    { key: 'sepia' as const, label: '📜', title: 'Sepia mode' },
  ]

  const layouts = [
    { key: 'single' as const, label: '▢', title: 'Single panel' },
    { key: 'two-column' as const, label: '⊞', title: 'Two panels' },
    { key: 'three-column' as const, label: '⊟', title: 'Three panels' },
  ]

  return (
    <header className="flex items-center gap-2 px-3 h-11 bg-[var(--bg-primary)] border-b border-[var(--border-color)] flex-shrink-0">
      {/* Sidebar toggle */}
      <button
        onClick={toggleSidebar}
        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        className="p-1.5 rounded hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Brand */}
      <button
        onClick={() => void navigate('/')}
        className="font-arabic-display text-sm font-bold text-[var(--accent-primary)] hover:opacity-80 transition-opacity px-1 flex-shrink-0"
        aria-label="Go to dashboard"
      >
        مكتبة
      </button>

      {/* Navigation controls */}
      <NavigationControls />

      {/* Address bar */}
      <AddressBar />

      {/* Command palette trigger */}
      <button
        onClick={openPalette}
        aria-label="Open command palette (Cmd+K)"
        title="Command palette (⌘K)"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[var(--border-color)] text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors flex-shrink-0"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <circle cx="7" cy="7" r="4" />
          <path d="M10.5 10.5L14 14" />
        </svg>
        <kbd className="hidden sm:inline">⌘K</kbd>
      </button>

      {/* Divider */}
      <div className="h-5 w-px bg-[var(--border-color)] flex-shrink-0" />

      {/* Layout switcher */}
      <div className="flex items-center rounded border border-[var(--border-color)] overflow-hidden flex-shrink-0">
        {layouts.map((l) => (
          <button
            key={l.key}
            onClick={() => onLayoutChange(l.key)}
            title={l.title}
            aria-label={l.title}
            aria-pressed={layout === l.key}
            className={`px-2 py-1 text-sm transition-colors ${
              layout === l.key
                ? 'bg-[var(--accent-primary)] text-white'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* Theme switcher */}
      <div className="flex items-center rounded border border-[var(--border-color)] overflow-hidden flex-shrink-0">
        {themes.map((t) => (
          <button
            key={t.key}
            onClick={() => setTheme(t.key)}
            title={t.title}
            aria-label={t.title}
            aria-pressed={theme === t.key}
            className={`px-2 py-1 text-sm transition-colors ${
              theme === t.key
                ? 'bg-[var(--accent-primary)] text-white'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Settings */}
      <button
        onClick={() => void navigate('/settings')}
        aria-label="Open settings"
        title="Settings"
        className="p-1.5 rounded hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors flex-shrink-0"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>
    </header>
  )
}

// ────────────────────────────────────────────────────────────────
// App Shell
// ────────────────────────────────────────────────────────────────
export default function AppShell(): React.ReactElement {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen)
  const setLayout = useAppStore((s) => s.setLayout)
  useDirection()

  function handleLayoutChange(layout: PanelLayout) {
    setLayout(layout)
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <ThemeSynchronizer />
      <IpcMenuListener onLayoutChange={handleLayoutChange} />

      {/* Top toolbar */}
      <Toolbar onLayoutChange={handleLayoutChange} />

      {/* Body: sidebar + workspace */}
      <div className="flex flex-1 min-h-0">
        <Group orientation="horizontal" className="flex-1">
          {sidebarOpen && (
            <>
              <Panel defaultSize={18} minSize={14} maxSize={35} id="sidebar">
                <Sidebar />
              </Panel>
              <Separator className="group relative flex items-center justify-center w-1.5 bg-[var(--border-color)] hover:bg-[var(--accent-primary)] transition-colors cursor-col-resize">
                <div className="w-0.5 h-8 rounded-full bg-[var(--ae-black-300)] group-hover:bg-white transition-colors" />
              </Separator>
            </>
          )}
          <Panel id="workspace">
            <PanelWorkspace />
          </Panel>
        </Group>
      </div>

      {/* Command Palette (portal-like, rendered at end) */}
      <CommandPalette onLayoutChange={handleLayoutChange} />
    </div>
  )
}
