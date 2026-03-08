import React from 'react'

export interface WordMorphology {
  wordPosition: number
  surfaceForm: string
  rootLetters: string | null
  rootMeaningEnglish: string | null
  pattern: string | null
  pos: string
  caseMarker: string | null
}

/** Maps part-of-speech codes to human-readable labels */
function posLabel(pos: string): string {
  const map: Record<string, string> = {
    N: 'Noun',
    PN: 'Proper noun',
    V: 'Verb',
    PRON: 'Pronoun',
    P: 'Preposition',
    CONJ: 'Conjunction',
    DET: 'Determiner',
    ADJ: 'Adjective',
    ADV: 'Adverb',
    INTJ: 'Interjection',
    RES: 'Restriction particle',
    EMPH: 'Emphatic particle',
    IMPV: 'Imperative verb',
    T: 'Time adverb',
    LOC: 'Location adverb',
    INL: 'Quranic initials',
    PREV: 'Preventive particle',
    NEG: 'Negative particle',
    COND: 'Conditional',
    FUT: 'Future particle',
    PART: 'Particle',
  }
  return map[pos] ?? pos
}

interface WordPopoverProps {
  word: WordMorphology | null
  onOpenWordStudy?: (word: WordMorphology) => void
  style?: React.CSSProperties
}

/**
 * Popover card shown when hovering an Arabic word in the Quran viewer.
 * Displays morphological analysis data.
 */
export default function WordPopover({
  word,
  onOpenWordStudy,
  style,
}: WordPopoverProps): React.ReactElement | null {
  if (!word) return null

  return (
    <div
      role="tooltip"
      className="
        absolute z-50 w-64 rounded-lg shadow-xl border border-[var(--border-color)]
        bg-[var(--bg-primary)] text-[var(--text-primary)]
        p-4 pointer-events-auto
      "
      style={style}
    >
      {/* Arabic word */}
      <div
        dir="rtl"
        className="text-3xl font-arabic-display text-center text-[var(--accent-primary)] mb-2"
        style={{ fontFamily: "'KFGQPC Uthmanic Hafs', 'Amiri', serif" }}
      >
        {word.surfaceForm}
      </div>

      {/* Root */}
      {word.rootLetters && (
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="text-[var(--text-secondary)]">Root</span>
          <span
            dir="rtl"
            className="font-arabic-body font-semibold text-[var(--ae-gold-600)]"
            style={{ fontFamily: "'IBM Plex Arabic', 'Amiri', serif" }}
          >
            {word.rootLetters}
          </span>
        </div>
      )}

      {/* Meaning */}
      {word.rootMeaningEnglish && (
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="text-[var(--text-secondary)]">Meaning</span>
          <span className="text-[var(--text-primary)] text-right max-w-[150px]">
            {word.rootMeaningEnglish}
          </span>
        </div>
      )}

      {/* Part of speech */}
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="text-[var(--text-secondary)]">Part of speech</span>
        <span className="text-[var(--text-primary)]">{posLabel(word.pos)}</span>
      </div>

      {/* Case marker */}
      {word.caseMarker && (
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="text-[var(--text-secondary)]">Case</span>
          <span className="text-[var(--text-primary)]">{word.caseMarker}</span>
        </div>
      )}

      {/* Verb pattern */}
      {word.pattern && (
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="text-[var(--text-secondary)]">Pattern</span>
          <span
            dir="rtl"
            className="font-arabic-body"
            style={{ fontFamily: "'IBM Plex Arabic', 'Amiri', serif" }}
          >
            {word.pattern}
          </span>
        </div>
      )}

      {/* Divider */}
      <div className="my-2 border-t border-[var(--border-color)]" />

      {/* Open Word Study button */}
      <button
        onClick={() => word && onOpenWordStudy?.(word)}
        className="
          w-full py-1.5 text-xs rounded border border-[var(--accent-primary)]
          text-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-white
          transition-colors
        "
      >
        Open full word study →
      </button>
    </div>
  )
}
