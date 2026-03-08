import React, { useState, useRef, useCallback } from 'react'
import WordPopover, { type WordMorphology } from './WordPopover'
import VerseContextMenu from './VerseContextMenu'
import { useIpc } from '../../hooks/useIpc'

export type HighlightColor =
  | 'gold'
  | 'green'
  | 'red'
  | 'blue'
  | 'yellow'
  | 'orange'
  | 'fuchsia'
  | 'slate'

export interface ArabicVerseProps {
  surahNumber: number
  ayahNumber: number
  arabicText: string
  arabicSimple: string
  bismillahPre?: boolean
  morphology?: WordMorphology[]
  translationText?: string
  highlight?: HighlightColor | null
  tajweedEnabled?: boolean
  showVerseNumber?: boolean
  viewMode?: 'verse-by-verse' | 'continuous' | 'page'
  onAddNote?: (surah: number, ayah: number) => void
  onViewTafsir?: (surah: number, ayah: number) => void
  onViewHadith?: (surah: number, ayah: number) => void
}

/** Map highlight colors to CSS background values */
const HIGHLIGHT_BG: Record<HighlightColor, string> = {
  gold: 'rgba(251,191,36,0.3)',
  green: 'rgba(74,222,128,0.3)',
  red: 'rgba(251,113,133,0.3)',
  blue: 'rgba(96,165,250,0.3)',
  yellow: 'rgba(253,224,71,0.3)',
  orange: 'rgba(251,146,60,0.3)',
  fuchsia: 'rgba(232,121,249,0.3)',
  slate: 'rgba(148,163,184,0.3)',
}

/**
 * Renders a single Quran verse in Arabic with word-by-word interaction,
 * tajweed overlay support, highlight, and right-click context menu.
 */
export default function ArabicVerse({
  surahNumber,
  ayahNumber,
  arabicText,
  bismillahPre = false,
  morphology = [],
  translationText,
  highlight = null,
  tajweedEnabled = false,
  showVerseNumber = true,
  viewMode = 'verse-by-verse',
  onAddNote,
  onViewTafsir,
  onViewHadith,
}: ArabicVerseProps): React.ReactElement {
  const ipc = useIpc()

  // Word popover state
  const [activeWord, setActiveWord] = useState<WordMorphology | null>(null)
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)

  const handleWordMouseEnter = useCallback((word: WordMorphology, e: React.MouseEvent) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const containerRect = containerRef.current?.getBoundingClientRect()
    if (!containerRect) return
    hoverTimerRef.current = setTimeout(() => {
      setPopoverPos({
        top: rect.bottom - containerRect.top + 4,
        left: Math.max(0, rect.left - containerRect.left - 80),
      })
      setActiveWord(word)
    }, 300)
  }, [])

  const handleWordMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
    // Small delay so user can move cursor into popover
    hoverTimerRef.current = setTimeout(() => setActiveWord(null), 200)
  }, [])

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }, [])

  // Copy to clipboard
  function handleCopy(mode: 'arabic' | 'translation' | 'both') {
    let text = ''
    if (mode === 'arabic') text = arabicText
    else if (mode === 'translation') text = translationText ?? ''
    else text = [arabicText, translationText].filter(Boolean).join('\n')
    void navigator.clipboard.writeText(text)
  }

  // Save highlight via IPC
  async function handleHighlight(color: HighlightColor) {
    if (!ipc) return
    const resourceKey = `quran:${surahNumber}`
    const contentRef = `${surahNumber}:${ayahNumber}`
    await ipc.invoke('user:save-highlight', resourceKey, contentRef, color)
  }

  // Share via Web Share API
  function handleShare() {
    const verseRef = `Quran ${surahNumber}:${ayahNumber}`
    const text = [arabicText, translationText].filter(Boolean).join('\n')
    const nav = navigator as Navigator & {
      share?: (data: { title: string; text: string }) => Promise<void>
    }
    if (nav.share) {
      void nav.share({ title: verseRef, text })
    } else {
      void navigator.clipboard.writeText(`${verseRef}\n${text}`)
    }
  }

  // Split Arabic text into words for interactive rendering
  const words = arabicText.split(/\s+/).filter(Boolean)

  const verseEndMarker = `\u06DD${String(ayahNumber).replace(/\d/g, (d) =>
    String.fromCharCode(0x0660 + parseInt(d))
  )}`

  const highlightStyle: React.CSSProperties = highlight
    ? { backgroundColor: HIGHLIGHT_BG[highlight], borderRadius: '4px', padding: '2px 0' }
    : {}

  const isVerseByVerse = viewMode === 'verse-by-verse'

  return (
    <div
      ref={containerRef}
      className={`relative group ${isVerseByVerse ? 'py-4' : 'inline'}`}
      onContextMenu={handleContextMenu}
    >
      {/* Bismillah header (for surahs that have it, except Al-Fatiha & At-Tawbah) */}
      {bismillahPre && (
        <div
          dir="rtl"
          className="text-center text-2xl font-arabic-display mb-4 text-[var(--ae-gold-600)]"
          style={{ fontFamily: "'KFGQPC Uthmanic Hafs', 'Amiri', serif" }}
        >
          بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ
        </div>
      )}

      {/* Arabic text */}
      <div
        dir="rtl"
        lang="ar"
        className={`
          leading-[2.5] tracking-wide select-text
          ${isVerseByVerse ? 'text-3xl text-right' : 'inline text-2xl'}
        `}
        style={{
          fontFamily: "'KFGQPC Uthmanic Hafs', 'Amiri', serif",
          fontFeatureSettings: '"liga" 1, "calt" 1, "kern" 1',
          ...highlightStyle,
        }}
      >
        {morphology.length > 0
          ? /* Word-by-word interactive mode */
            morphology.map((word) => (
              <span
                key={word.wordPosition}
                className={`
                  inline cursor-pointer rounded
                  hover:bg-[var(--ae-gold-100)] hover:text-[var(--ae-gold-800)]
                  transition-colors px-0.5
                  ${tajweedEnabled ? 'tajweed-word' : ''}
                `}
                data-position={word.wordPosition}
                onMouseEnter={(e) => handleWordMouseEnter(word, e)}
                onMouseLeave={handleWordMouseLeave}
              >
                {word.surfaceForm}{' '}
              </span>
            ))
          : /* Plain text fallback (no morphology data) */
            words.map((word, i) => (
              <span key={i} className="inline">
                {word}{' '}
              </span>
            ))}

        {/* Verse end marker */}
        {showVerseNumber && (
          <span
            className="inline-block text-[var(--ae-gold-500)] mx-1"
            aria-label={`Verse ${ayahNumber}`}
          >
            {verseEndMarker}
          </span>
        )}
      </div>

      {/* Word morphology popover */}
      {activeWord && (
        <div
          className="absolute z-40 pointer-events-none"
          style={{ top: popoverPos.top, left: popoverPos.left }}
          onMouseEnter={() => {
            if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
          }}
          onMouseLeave={handleWordMouseLeave}
        >
          <WordPopover
            word={activeWord}
            onOpenWordStudy={(w) => {
              setActiveWord(null)
              onViewTafsir?.(surahNumber, ayahNumber)
              // TODO: open dedicated Word Study panel
              void w
            }}
          />
        </div>
      )}

      {/* Right-click context menu */}
      {contextMenu && (
        <VerseContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          surahNumber={surahNumber}
          ayahNumber={ayahNumber}
          arabicText={arabicText}
          translationText={translationText}
          onClose={() => setContextMenu(null)}
          onCopy={handleCopy}
          onHighlight={(color) => void handleHighlight(color)}
          onAddNote={() => onAddNote?.(surahNumber, ayahNumber)}
          onAddToKhutbah={() => {
            // TODO: integrate with Khutbah Builder
          }}
          onViewTafsir={() => onViewTafsir?.(surahNumber, ayahNumber)}
          onViewHadith={() => onViewHadith?.(surahNumber, ayahNumber)}
          onShare={handleShare}
          onPlayRecitation={() => {
            // TODO: Audio integration
          }}
        />
      )}
    </div>
  )
}
