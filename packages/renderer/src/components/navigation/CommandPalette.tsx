import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCommandPalette } from '../../hooks/useCommandPalette'
import { useAppStore } from '../../store/app-store'
import type { PanelLayout } from '../../store/app-store'

interface CommandItem {
  id: string
  label: string
  description?: string
  category: 'navigate' | 'layout' | 'settings' | 'action'
  icon: string
  action: () => void
  keywords?: string
}

interface CommandPaletteProps {
  onLayoutChange: (layout: PanelLayout) => void
}

export default function CommandPalette({
  onLayoutChange,
}: CommandPaletteProps): React.ReactElement | null {
  const navigate = useNavigate()
  const { open, closePalette } = useCommandPalette()
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)
  const setSidebarSection = useAppStore((s) => s.setSidebarSection)

  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const commands: CommandItem[] = [
    // Navigation
    {
      id: 'nav-home',
      label: 'Go to Dashboard',
      category: 'navigate',
      icon: '🏠',
      action: () => {
        void navigate('/')
        closePalette()
      },
    },
    {
      id: 'nav-quran',
      label: 'Open Quran',
      category: 'navigate',
      icon: '📖',
      keywords: 'mushaf quran',
      action: () => {
        void navigate('/quran')
        closePalette()
      },
    },
    {
      id: 'nav-hadith',
      label: 'Open Hadith Collections',
      category: 'navigate',
      icon: '📜',
      keywords: 'sunnah hadith bukhari muslim',
      action: () => {
        void navigate('/hadith')
        closePalette()
      },
    },
    {
      id: 'nav-search',
      label: query ? `Search for "${query}"` : 'Search Library',
      category: 'navigate',
      icon: '🔍',
      keywords: 'search find',
      action: () => {
        void navigate(`/search?q=${encodeURIComponent(query)}`)
        closePalette()
      },
    },
    {
      id: 'nav-bookmarks',
      label: 'Open Bookmarks',
      category: 'navigate',
      icon: '🔖',
      action: () => {
        setSidebarSection('bookmarks')
        closePalette()
      },
    },
    {
      id: 'nav-notes',
      label: 'Open Notes & Highlights',
      category: 'navigate',
      icon: '📝',
      action: () => {
        setSidebarSection('notes')
        closePalette()
      },
    },
    {
      id: 'nav-reading-plans',
      label: 'Open Reading Plans',
      category: 'navigate',
      icon: '📅',
      action: () => {
        void navigate('/reading-plans')
        closePalette()
      },
    },
    {
      id: 'nav-settings',
      label: 'Open Settings',
      category: 'settings',
      icon: '⚙️',
      action: () => {
        void navigate('/settings')
        closePalette()
      },
    },
    {
      id: 'nav-settings-appearance',
      label: 'Settings: Appearance',
      category: 'settings',
      icon: '🎨',
      action: () => {
        void navigate('/settings/appearance')
        closePalette()
      },
    },
    {
      id: 'nav-settings-language',
      label: 'Settings: Language',
      category: 'settings',
      icon: '🌐',
      action: () => {
        void navigate('/settings/language')
        closePalette()
      },
    },
    {
      id: 'nav-settings-shortcuts',
      label: 'Settings: Keyboard Shortcuts',
      category: 'settings',
      icon: '⌨️',
      action: () => {
        void navigate('/settings/shortcuts')
        closePalette()
      },
    },
    // Layout commands
    {
      id: 'layout-single',
      label: 'Layout: Single Panel',
      category: 'layout',
      icon: '▢',
      keywords: 'layout panel single',
      action: () => {
        onLayoutChange('single')
        closePalette()
      },
    },
    {
      id: 'layout-two',
      label: 'Layout: Two Columns',
      category: 'layout',
      icon: '⊞',
      keywords: 'layout panel two columns',
      action: () => {
        onLayoutChange('two-column')
        closePalette()
      },
    },
    {
      id: 'layout-three',
      label: 'Layout: Three Columns',
      category: 'layout',
      icon: '⊟',
      keywords: 'layout panel three columns',
      action: () => {
        onLayoutChange('three-column')
        closePalette()
      },
    },
    {
      id: 'action-toggle-sidebar',
      label: 'Toggle Sidebar',
      category: 'action',
      icon: '◧',
      keywords: 'sidebar toggle',
      action: () => {
        toggleSidebar()
        closePalette()
      },
    },
    {
      id: 'nav-factbook',
      label: 'Open Factbook',
      category: 'navigate',
      icon: '📚',
      keywords: 'factbook encyclopedia',
      action: () => {
        void navigate('/factbook')
        closePalette()
      },
    },
    {
      id: 'nav-atlas',
      label: 'Open Islamic Atlas',
      category: 'navigate',
      icon: '🗺️',
      keywords: 'atlas map geography history',
      action: () => {
        void navigate('/atlas')
        closePalette()
      },
    },
    {
      id: 'nav-khutbah',
      label: 'Open Khutbah Builder',
      category: 'navigate',
      icon: '🕌',
      keywords: "khutbah sermon jumu'ah",
      action: () => {
        void navigate('/khutbah')
        closePalette()
      },
    },
  ]

  const filteredCommands = query
    ? commands.filter((cmd) => {
        const q = query.toLowerCase()
        return (
          cmd.label.toLowerCase().includes(q) ||
          cmd.description?.toLowerCase().includes(q) ||
          cmd.keywords?.toLowerCase().includes(q) ||
          cmd.category.includes(q)
        )
      })
    : commands

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((i) => Math.max(i - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          filteredCommands[selectedIndex]?.action()
          break
        case 'Escape':
          closePalette()
          break
      }
    },
    [filteredCommands, selectedIndex, closePalette]
  )

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Focus input when palette opens
  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 10)
    }
  }, [open])

  // Scroll selected item into view
  useEffect(() => {
    const el = listRef.current?.children[selectedIndex] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  if (!open) return null

  const categoryLabels: Record<CommandItem['category'], string> = {
    navigate: 'Navigate',
    layout: 'Layout',
    settings: 'Settings',
    action: 'Actions',
  }

  // Group by category
  const groups = new Map<CommandItem['category'], CommandItem[]>()
  for (const cmd of filteredCommands) {
    const existing = groups.get(cmd.category) ?? []
    existing.push(cmd)
    groups.set(cmd.category, existing)
  }

  let itemIndex = 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={closePalette}
        aria-hidden="true"
      />

      {/* Palette window */}
      <div className="relative w-full max-w-xl bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl shadow-2xl overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-color)]">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="text-[var(--text-secondary)] flex-shrink-0"
          >
            <circle cx="7" cy="7" r="4" />
            <path d="M10.5 10.5L14 14" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search commands, navigate, or type a resource address…"
            className="flex-1 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-secondary)] text-sm focus:outline-none"
            aria-label="Command search"
            aria-autocomplete="list"
            aria-activedescendant={
              filteredCommands[selectedIndex]
                ? `cmd-${filteredCommands[selectedIndex].id}`
                : undefined
            }
          />
          <kbd className="hidden sm:inline text-xs px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)]">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <ul
          ref={listRef}
          role="listbox"
          className="max-h-80 overflow-y-auto py-2"
          aria-label="Command results"
        >
          {filteredCommands.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-[var(--text-secondary)]">
              No matching commands
            </li>
          )}
          {Array.from(groups.entries()).map(([category, items]) => (
            <React.Fragment key={category}>
              <li
                role="none"
                className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]"
              >
                {categoryLabels[category]}
              </li>
              {items.map((cmd) => {
                const currentIndex = itemIndex
                itemIndex++
                const isSelected = currentIndex === selectedIndex
                return (
                  <li
                    key={cmd.id}
                    id={`cmd-${cmd.id}`}
                    role="option"
                    aria-selected={isSelected}
                    className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[var(--accent-primary)] text-white'
                        : 'hover:bg-[var(--bg-secondary)] text-[var(--text-primary)]'
                    }`}
                    onClick={() => cmd.action()}
                    onMouseEnter={() => {
                      // Find the global index
                      const idx = filteredCommands.findIndex((c) => c.id === cmd.id)
                      if (idx !== -1) setSelectedIndex(idx)
                    }}
                  >
                    <span className="text-base w-5 text-center flex-shrink-0">{cmd.icon}</span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{cmd.label}</div>
                      {cmd.description && (
                        <div
                          className={`text-xs truncate ${isSelected ? 'text-white/70' : 'text-[var(--text-secondary)]'}`}
                        >
                          {cmd.description}
                        </div>
                      )}
                    </div>
                  </li>
                )
              })}
            </React.Fragment>
          ))}
        </ul>

        {/* Footer hint */}
        <div className="flex items-center gap-3 px-4 py-2 border-t border-[var(--border-color)] text-xs text-[var(--text-secondary)]">
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-color)]">
              ↑↓
            </kbd>{' '}
            navigate
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-color)]">
              ↵
            </kbd>{' '}
            select
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-color)]">
              Esc
            </kbd>{' '}
            close
          </span>
        </div>
      </div>
    </div>
  )
}
