import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useIpc } from '../../hooks/useIpc'

// ─── Types ────────────────────────────────────────────────────────────────────

type HighlightColor = 'gold' | 'green' | 'red' | 'blue' | 'yellow' | 'orange' | 'fuchsia' | 'slate'

const HIGHLIGHT_COLORS: { key: HighlightColor; label: string; cssVar: string }[] = [
  { key: 'gold', label: 'Gold', cssVar: 'var(--ae-gold-400, #fbbf24)' },
  { key: 'green', label: 'Green', cssVar: 'var(--ae-green-400, #4ade80)' },
  { key: 'red', label: 'Red', cssVar: 'var(--ae-red-400, #fb7185)' },
  { key: 'blue', label: 'Blue', cssVar: 'var(--tech-blue-400, #60a5fa)' },
  { key: 'yellow', label: 'Yellow', cssVar: 'var(--camel-yellow-400, #fde047)' },
  { key: 'orange', label: 'Orange', cssVar: 'var(--desert-orange-400, #fb923c)' },
  { key: 'fuchsia', label: 'Fuchsia', cssVar: 'var(--fuchsia-400, #e879f9)' },
  { key: 'slate', label: 'Slate', cssVar: 'var(--ae-black-300, #cbd5e1)' },
]

interface ToolbarPosition {
  x: number
  y: number
}

/**
 * Global floating highlight toolbar.
 * Appears near any text selection to allow quick color-coded highlighting.
 * The toolbar saves highlights via IPC with a generic resource key derived
 * from the current page URL, so all panels are supported.
 */
export default function HighlightToolbar(): React.ReactElement | null {
  const ipc = useIpc()
  const [position, setPosition] = useState<ToolbarPosition | null>(null)
  const [selectedText, setSelectedText] = useState('')
  const toolbarRef = useRef<HTMLDivElement>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hideToolbar = useCallback(() => {
    setPosition(null)
    setSelectedText('')
  }, [])

  useEffect(() => {
    function handleSelectionChange() {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)

      const selection = window.getSelection()
      if (!selection || selection.isCollapsed || selection.toString().trim().length < 3) {
        hideTimerRef.current = setTimeout(hideToolbar, 300)
        return
      }

      const text = selection.toString().trim()
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()

      if (rect.width === 0 && rect.height === 0) {
        hideTimerRef.current = setTimeout(hideToolbar, 300)
        return
      }

      // Position toolbar above the selection, centered
      const toolbarWidth = 220
      const x = Math.max(8, Math.min(rect.left + rect.width / 2 - toolbarWidth / 2, window.innerWidth - toolbarWidth - 8))
      const y = rect.top - 48

      setSelectedText(text)
      setPosition({ x, y: Math.max(8, y) })
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    document.addEventListener('mouseup', handleSelectionChange)

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
      document.removeEventListener('mouseup', handleSelectionChange)
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    }
  }, [hideToolbar])

  // Close on outside click
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        hideToolbar()
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [hideToolbar])

  async function handleHighlight(color: HighlightColor) {
    if (!ipc || !selectedText) return

    // Derive a generic resource key from the current hash route
    const hash = window.location.hash.replace('#', '') || '/'
    const resourceKey = `text:${hash}`
    const contentRef = selectedText.slice(0, 200)

    try {
      await ipc.invoke('user:save-highlight', resourceKey, contentRef, color)
    } catch {
      // Silently ignore — user may not have a DB yet
    }

    hideToolbar()
    window.getSelection()?.removeAllRanges()
  }

  if (!position) return null

  return (
    <div
      ref={toolbarRef}
      role="toolbar"
      aria-label="Highlight selection"
      className="
        fixed z-[100] flex items-center gap-1 px-2 py-1.5 rounded-full shadow-xl
        border border-[var(--border-color)] bg-[var(--bg-primary)]
        animate-in fade-in slide-in-from-top-1 duration-150
      "
      style={{ left: position.x, top: position.y }}
      onMouseDown={(e) => e.preventDefault()} // Prevent deselection
    >
      {/* Highlight label */}
      <span className="text-xs text-[var(--text-muted)] mr-1 select-none">Highlight</span>

      {/* Color buttons */}
      {HIGHLIGHT_COLORS.map((c) => (
        <button
          key={c.key}
          title={`Highlight ${c.label}`}
          aria-label={`Highlight ${c.label}`}
          className="
            w-5 h-5 rounded-full border-2 border-transparent
            hover:border-[var(--text-primary)] hover:scale-110
            transition-all duration-100 focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]
          "
          style={{ backgroundColor: c.cssVar }}
          onClick={() => void handleHighlight(c.key)}
        />
      ))}

      {/* Divider */}
      <div className="w-px h-4 bg-[var(--border-color)] mx-1" />

      {/* Note shortcut */}
      <button
        title="Add note (N)"
        aria-label="Add note"
        className="text-xs px-1.5 py-0.5 rounded text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors select-none"
        onClick={hideToolbar}
      >
        ✏️
      </button>
    </div>
  )
}
