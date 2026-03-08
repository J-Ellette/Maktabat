import React, { useEffect, useRef } from 'react'
import type { HighlightColor } from './ArabicVerse'

export interface VerseContextMenuProps {
  x: number
  y: number
  surahNumber: number
  ayahNumber: number
  arabicText: string
  translationText?: string
  onClose: () => void
  onCopy: (mode: 'arabic' | 'translation' | 'both') => void
  onHighlight: (color: HighlightColor) => void
  onAddNote: () => void
  onAddToKhutbah: () => void
  onViewTafsir: () => void
  onViewHadith: () => void
  onShare: () => void
  onPlayRecitation: () => void
}

const HIGHLIGHT_COLORS: { key: HighlightColor; label: string; cssVar: string }[] = [
  { key: 'gold', label: 'Gold', cssVar: 'var(--ae-gold-400)' },
  { key: 'green', label: 'Green', cssVar: 'var(--ae-green-400)' },
  { key: 'red', label: 'Red', cssVar: 'var(--ae-red-400)' },
  { key: 'blue', label: 'Blue', cssVar: 'var(--tech-blue-400)' },
  { key: 'yellow', label: 'Yellow', cssVar: 'var(--camel-yellow-400)' },
  { key: 'orange', label: 'Orange', cssVar: 'var(--desert-orange-400)' },
  { key: 'fuchsia', label: 'Fuchsia', cssVar: 'var(--fuchsia-400)' },
  { key: 'slate', label: 'Slate', cssVar: 'var(--ae-black-300)' },
]

function MenuItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon?: string
  label: string
  onClick: () => void
  danger?: boolean
}): React.ReactElement {
  return (
    <button
      className={`
        w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left rounded
        transition-colors hover:bg-[var(--bg-secondary)]
        ${danger ? 'text-[var(--ae-red-500)]' : 'text-[var(--text-primary)]'}
      `}
      onClick={onClick}
    >
      {icon && <span className="w-4 text-center text-[var(--text-secondary)]">{icon}</span>}
      {label}
    </button>
  )
}

function Divider(): React.ReactElement {
  return <div className="my-1 h-px bg-[var(--border-color)]" />
}

/**
 * Right-click context menu for Quran verses.
 * Appears at click position and closes on outside click or Escape.
 */
export default function VerseContextMenu({
  x,
  y,
  arabicText,
  translationText,
  onClose,
  onCopy,
  onHighlight,
  onAddNote,
  onAddToKhutbah,
  onViewTafsir,
  onViewHadith,
  onShare,
  onPlayRecitation,
}: VerseContextMenuProps): React.ReactElement {
  const menuRef = useRef<HTMLDivElement>(null)

  // Close on outside click or Escape
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  // Adjust position to keep menu within viewport
  const menuWidth = 220
  const adjustedX = Math.min(x, window.innerWidth - menuWidth - 8)
  const adjustedY = Math.min(y, window.innerHeight - 380)

  return (
    <div
      ref={menuRef}
      role="menu"
      className="
        fixed z-50 w-56 rounded-lg shadow-xl border border-[var(--border-color)]
        bg-[var(--bg-primary)] py-1
      "
      style={{ left: adjustedX, top: adjustedY }}
    >
      {/* Copy options */}
      <MenuItem
        icon="📋"
        label="Copy Arabic"
        onClick={() => {
          onCopy('arabic')
          onClose()
        }}
      />
      {translationText && (
        <MenuItem
          icon="📋"
          label="Copy Translation"
          onClick={() => {
            onCopy('translation')
            onClose()
          }}
        />
      )}
      <MenuItem
        icon="📋"
        label="Copy Arabic + Translation"
        onClick={() => {
          onCopy('both')
          onClose()
        }}
      />

      <Divider />

      {/* Highlight */}
      <div className="px-3 py-1.5">
        <span className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">
          Highlight
        </span>
        <div className="flex gap-1.5 mt-1.5 flex-wrap">
          {HIGHLIGHT_COLORS.map((c) => (
            <button
              key={c.key}
              title={c.label}
              aria-label={`Highlight ${c.label}`}
              className="w-5 h-5 rounded-full border-2 border-transparent hover:border-[var(--text-primary)] transition-colors"
              style={{ backgroundColor: c.cssVar }}
              onClick={() => {
                onHighlight(c.key)
                onClose()
              }}
            />
          ))}
        </div>
      </div>

      <Divider />

      {/* Actions */}
      <MenuItem
        icon="✏️"
        label="Add Note"
        onClick={() => {
          onAddNote()
          onClose()
        }}
      />
      <MenuItem
        icon="🕌"
        label="Add to Khutbah"
        onClick={() => {
          onAddToKhutbah()
          onClose()
        }}
      />
      <MenuItem
        icon="📖"
        label="View in Tafsir"
        onClick={() => {
          onViewTafsir()
          onClose()
        }}
      />
      <MenuItem
        icon="📚"
        label="View related Hadith"
        onClick={() => {
          onViewHadith()
          onClose()
        }}
      />

      <Divider />

      <MenuItem
        icon="🔊"
        label="Play recitation from here"
        onClick={() => {
          onPlayRecitation()
          onClose()
        }}
      />
      {(navigator as Navigator & { share?: unknown }).share && (
        <MenuItem
          icon="↗️"
          label="Share verse"
          onClick={() => {
            onShare()
            onClose()
          }}
        />
      )}

      {/* Verse reference */}
      <div className="px-3 py-1.5 border-t border-[var(--border-color)] mt-1">
        <p className="text-xs text-[var(--text-secondary)] truncate" dir="rtl" title={arabicText}>
          {arabicText.length > 40 ? arabicText.slice(0, 40) + '…' : arabicText}
        </p>
      </div>
    </div>
  )
}
