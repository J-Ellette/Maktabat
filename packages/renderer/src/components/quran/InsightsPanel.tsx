import React, { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface InsightEntry {
  slug: string
  title_english: string
  title_arabic: string | null
  type: 'person' | 'place' | 'event' | 'concept'
  summary: string
  icon: string
}

// ─── Static verse → factbook slug map ────────────────────────────────────────

const VERSE_INSIGHTS: Record<string, string[]> = {
  '2:255': ['tawbah'],
  '1:1': ['mecca'],
  '1:2': ['tawbah'],
  '2:127': ['ibrahim', 'mecca'],
  '2:258': ['ibrahim'],
  '3:96': ['mecca'],
  '21:51': ['ibrahim'],
  '21:52': ['ibrahim'],
  '28:29': ['musa'],
  '28:30': ['musa'],
  '2:222': ['tawbah'],
  '39:53': ['tawbah'],
  '9:60': ['zakat'],
  '2:43': ['zakat'],
  '3:17': ['tawbah'],
  '8:9': ['badr'],
}

// ─── Minimal factbook entry metadata (mirrors DEMO_ENTRIES in FactbookPanel) ─

const INSIGHT_ENTRIES: InsightEntry[] = [
  {
    slug: 'ibrahim',
    title_english: 'Ibrahim (Abraham)',
    title_arabic: 'إبراهيم',
    type: 'person',
    summary:
      'The patriarch Prophet Ibrahim (Abraham), the father of monotheism, mentioned 69 times in the Quran.',
    icon: '👤',
  },
  {
    slug: 'musa',
    title_english: 'Musa (Moses)',
    title_arabic: 'موسى',
    type: 'person',
    summary:
      'Prophet Musa, the most frequently mentioned prophet in the Quran (136 times), who led the Children of Israel out of Egypt.',
    icon: '👤',
  },
  {
    slug: 'mecca',
    title_english: 'Mecca (Makkah al-Mukarramah)',
    title_arabic: 'مكة المكرمة',
    type: 'place',
    summary:
      "The holiest city in Islam, birthplace of the Prophet Muhammad ﷺ and site of the Masjid al-Haram and the Ka'bah.",
    icon: '📍',
  },
  {
    slug: 'tawbah',
    title_english: 'Tawbah (Repentance)',
    title_arabic: 'التوبة',
    type: 'concept',
    summary:
      'The Islamic concept of sincere repentance and turning back to Allah, a central theme throughout the Quran.',
    icon: '💡',
  },
  {
    slug: 'zakat',
    title_english: 'Zakat (Obligatory Charity)',
    title_arabic: 'الزكاة',
    type: 'concept',
    summary:
      'The third pillar of Islam — mandatory annual almsgiving of 2.5% on qualifying wealth held for one lunar year.',
    icon: '💡',
  },
  {
    slug: 'badr',
    title_english: 'Battle of Badr',
    title_arabic: 'بدر',
    type: 'event',
    summary:
      'The first major military engagement between the Muslims of Medina and the Quraysh of Mecca, in 2 AH (624 CE). A decisive Muslim victory.',
    icon: '📅',
  },
]

const ENTRY_BY_SLUG = new Map<string, InsightEntry>(INSIGHT_ENTRIES.map((e) => [e.slug, e]))

// ─── InsightsPanel ────────────────────────────────────────────────────────────

interface InsightsPanelProps {
  surahNumber: number
  ayahNumber: number
  onViewEntry: (slug: string) => void
}

export default function InsightsPanel({
  surahNumber,
  ayahNumber,
  onViewEntry,
}: InsightsPanelProps): React.ReactElement | null {
  const [expanded, setExpanded] = useState(false)

  const key = `${surahNumber}:${ayahNumber}`
  const slugs = VERSE_INSIGHTS[key]
  if (!slugs || slugs.length === 0) return null

  const entries = slugs
    .map((slug) => ENTRY_BY_SLUG.get(slug))
    .filter((e): e is InsightEntry => e !== undefined)
    .slice(0, 3)

  if (entries.length === 0) return null

  return (
    <div
      className="mt-3 rounded-lg border overflow-hidden"
      style={{
        borderColor: 'color-mix(in srgb, var(--ae-gold-400, #f59e0b) 35%, transparent)',
        backgroundColor: 'color-mix(in srgb, var(--ae-gold-100, #fef3c7) 25%, var(--bg-primary))',
      }}
    >
      {/* Header / toggle */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 text-left"
        aria-expanded={expanded}
      >
        <span
          className="text-xs font-semibold flex items-center gap-1.5"
          style={{ color: 'var(--ae-gold-700, #b45309)' }}
        >
          💡 Insights
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--ae-gold-400, #f59e0b) 30%, transparent)',
              color: 'var(--ae-gold-700, #b45309)',
            }}
          >
            {entries.length}
          </span>
        </span>
        <span
          className="text-xs transition-transform duration-200"
          style={{
            color: 'var(--ae-gold-600, #d97706)',
            display: 'inline-block',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          ▾
        </span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div
          className="px-3 pb-3 space-y-2 border-t"
          style={{
            borderColor: 'color-mix(in srgb, var(--ae-gold-400, #f59e0b) 25%, transparent)',
          }}
        >
          {entries.map((entry) => (
            <div key={entry.slug} className="flex items-start gap-2 pt-2">
              <span className="text-lg flex-shrink-0 mt-0.5">{entry.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {entry.title_english}
                  {entry.title_arabic && (
                    <span
                      className="ml-2 font-arabic font-normal"
                      dir="rtl"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {entry.title_arabic}
                    </span>
                  )}
                </div>
                <p
                  className="text-xs mt-0.5 line-clamp-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {entry.summary}
                </p>
                <button
                  type="button"
                  onClick={() => onViewEntry(entry.slug)}
                  className="text-xs mt-1 hover:underline"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  View full entry →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
