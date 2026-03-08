import React from 'react'

export interface Translation {
  translationKey: string
  text: string
  translator: string
  language: string
}

export type TranslationMode = 'single' | 'parallel' | 'interlinear' | 'comparison'

interface TranslationViewProps {
  translations: Translation[]
  /** Keys of currently selected translations to display */
  selectedKeys: string[]
  mode: TranslationMode
  /** Arabic words for interlinear mode */
  arabicWords?: string[]
  ayahNumber: number
}

/** Single translation below Arabic verse */
function SingleTranslation({ translation }: { translation: Translation }): React.ReactElement {
  return (
    <div className="mt-2 pt-2 border-t border-[var(--border-color)]">
      <p className="text-base leading-relaxed text-[var(--text-primary)]">{translation.text}</p>
      <p className="mt-1 text-xs text-[var(--text-secondary)]">{translation.translator}</p>
    </div>
  )
}

/** Multiple translations stacked side by side */
function ParallelTranslations({
  translations,
}: {
  translations: Translation[]
}): React.ReactElement {
  return (
    <div
      className={`mt-3 grid gap-3 border-t border-[var(--border-color)] pt-3`}
      style={{
        gridTemplateColumns: `repeat(${Math.min(translations.length, 2)}, 1fr)`,
      }}
    >
      {translations.map((t) => (
        <div key={t.translationKey} className="text-sm">
          <p className="leading-relaxed text-[var(--text-primary)]">{t.text}</p>
          <p className="mt-1 text-xs text-[var(--text-secondary)] italic">{t.translator}</p>
        </div>
      ))}
    </div>
  )
}

/** Translation comparison: shows where translators differ */
function ComparisonView({ translations }: { translations: Translation[] }): React.ReactElement {
  return (
    <div className="mt-3 border-t border-[var(--border-color)] pt-3 space-y-3">
      {translations.map((t) => (
        <div key={t.translationKey} className="flex gap-2 text-sm">
          <span className="flex-shrink-0 text-xs text-[var(--text-secondary)] w-24 pt-0.5">
            {t.translator}
          </span>
          <p className="leading-relaxed text-[var(--text-primary)]">{t.text}</p>
        </div>
      ))}
    </div>
  )
}

/** Interlinear mode: Arabic word + English gloss below each word */
function InterlinearView({
  arabicWords,
  translation,
}: {
  arabicWords: string[]
  translation: Translation | undefined
}): React.ReactElement {
  // Split translation into approximate per-word glosses
  // (Real interlinear needs word-aligned data; this is a simplified version)
  const glossWords = translation?.text.split(/\s+/) ?? []

  return (
    <div className="mt-3 pt-3 border-t border-[var(--border-color)] overflow-x-auto">
      <div dir="rtl" className="flex flex-wrap gap-x-4 gap-y-3">
        {arabicWords.map((word, i) => (
          <div key={i} className="flex flex-col items-center">
            <span
              className="text-xl font-arabic-display text-[var(--text-primary)]"
              style={{ fontFamily: "'KFGQPC Uthmanic Hafs', 'Amiri', serif" }}
            >
              {word}
            </span>
            <span dir="ltr" className="text-xs text-[var(--text-secondary)] mt-1 whitespace-nowrap">
              {glossWords[i] ?? ''}
            </span>
          </div>
        ))}
      </div>
      {translation && (
        <p className="mt-3 text-xs text-[var(--text-secondary)] italic">
          Full translation: {translation.translator}
        </p>
      )}
    </div>
  )
}

/**
 * Renders Quran verse translations in one of four modes:
 * single, parallel, comparison, or interlinear.
 */
export default function TranslationView({
  translations,
  selectedKeys,
  mode,
  arabicWords = [],
}: TranslationViewProps): React.ReactElement | null {
  const selected = translations.filter((t) => selectedKeys.includes(t.translationKey))
  if (selected.length === 0) return null

  if (mode === 'single') {
    return <SingleTranslation translation={selected[0]} />
  }

  if (mode === 'parallel') {
    return <ParallelTranslations translations={selected.slice(0, 4)} />
  }

  if (mode === 'comparison') {
    return <ComparisonView translations={selected} />
  }

  if (mode === 'interlinear') {
    return <InterlinearView arabicWords={arabicWords} translation={selected[0]} />
  }

  return null
}

/** Selector for choosing active translations */
interface TranslationSelectorProps {
  available: Translation[]
  selected: string[]
  onToggle: (key: string) => void
  maxSelectable?: number
}

export function TranslationSelector({
  available,
  selected,
  onToggle,
  maxSelectable = 4,
}: TranslationSelectorProps): React.ReactElement {
  return (
    <div className="flex flex-wrap gap-1.5">
      {available.map((t) => {
        const isSelected = selected.includes(t.translationKey)
        const isDisabled = !isSelected && selected.length >= maxSelectable
        return (
          <button
            key={t.translationKey}
            disabled={isDisabled}
            title={isDisabled ? `Max ${maxSelectable} translations` : t.translator}
            onClick={() => onToggle(t.translationKey)}
            className={`
              px-2 py-1 rounded text-xs border transition-colors
              ${
                isSelected
                  ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                  : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--text-primary)]'
              }
              ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {t.translator}
          </button>
        )
      })}
    </div>
  )
}
