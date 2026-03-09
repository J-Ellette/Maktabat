import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIpc } from '../../hooks/useIpc'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SynthesisSection {
  type: 'quran' | 'hadith' | 'tafsir' | 'scholarly'
  label: string
  icon: string
  results: SynthesisResult[]
}

interface SynthesisResult {
  id: string
  title: string
  excerpt: string
  route: string
}

interface LibraryHit {
  id: number
  type: 'ayah' | 'translation' | 'hadith'
  resourceKey: string
  excerpt: string
  relevance: number
  metadata: Record<string, unknown>
}

// ─── Stop-words for query decomposition ──────────────────────────────────────

const STOPWORDS = new Set([
  'what',
  'does',
  'islam',
  'about',
  'that',
  'this',
  'with',
  'from',
  'have',
  'they',
  'their',
  'there',
  'where',
  'when',
  'which',
  'would',
  'could',
  'should',
  'being',
  'been',
  'were',
  'then',
  'than',
  'also',
  'will',
  'into',
  'more',
  'some',
  'those',
  'these',
  'says',
  'said',
  'tell',
  'show',
  'give',
  'explain',
  'describe',
  'quran',
  'hadith',
  'surah',
  'verse',
  'chapter',
])

/**
 * Decompose a natural language question into FTS sub-queries.
 * Extracts key nouns/topics: words > 4 chars that aren't stopwords.
 * Returns up to 3 unique terms.
 */
function decomposeQuery(question: string): string[] {
  const words = question
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 4 && !STOPWORDS.has(w))

  // Deduplicate while preserving order
  const seen = new Set<string>()
  const unique: string[] = []
  for (const w of words) {
    if (!seen.has(w)) {
      seen.add(w)
      unique.push(w)
    }
  }
  return unique.slice(0, 3)
}

/**
 * Map library hits to SynthesisResult items.
 */
function hitToSynthesisResult(hit: LibraryHit): SynthesisResult {
  const meta = hit.metadata
  if (hit.type === 'ayah') {
    const surahId = meta.surahId ?? ''
    const ayahNum = meta.ayahNumber ?? ''
    return {
      id: `ayah-${hit.id}`,
      title: `Surah ${String(surahId)} : Ayah ${String(ayahNum)}`,
      excerpt: hit.excerpt,
      route: `/quran/${String(surahId)}/${String(ayahNum)}`,
    }
  }
  if (hit.type === 'translation') {
    const surahId = meta.surahId ?? ''
    const ayahNum = meta.ayahNumber ?? ''
    const translator = typeof meta.translator === 'string' ? meta.translator : ''
    return {
      id: `trans-${hit.id}`,
      title: translator ? `${translator} (Translation)` : 'Translation',
      excerpt: hit.excerpt,
      route: surahId ? `/quran/${String(surahId)}/${String(ayahNum)}` : '/quran',
    }
  }
  // hadith
  const collKey = String(meta.collectionKey ?? '')
  const hadithNum = String(meta.hadithNumber ?? '')
  const collName =
    typeof meta.collectionNameEnglish === 'string' ? meta.collectionNameEnglish : collKey
  return {
    id: `hadith-${hit.id}`,
    title: `${collName} #${hadithNum}`,
    excerpt: hit.excerpt,
    route: `/hadith/${collKey}/${hadithNum}`,
  }
}

// ─── Premium gate ─────────────────────────────────────────────────────────────

function PremiumGate(): React.ReactElement {
  const navigate = useNavigate()
  return (
    <div
      className="rounded-xl border p-6 text-center"
      style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}
    >
      <p className="text-3xl mb-3">✨</p>
      <h2 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
        Smart Search — Premium Feature
      </h2>
      <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
        Ask natural language questions and get synthesized answers from your entire library — Quran,
        hadith, tafsir, and scholarly commentary.
      </p>
      <ul
        className="text-sm text-left inline-flex flex-col gap-1.5 mb-5"
        style={{ color: 'var(--text-secondary)' }}
      >
        {[
          'Natural language question input',
          'Query decomposed into sub-searches',
          'Direct Quran verses + related hadiths',
          'Tafsir commentary & scholarly opinions',
          'Synopsis view with footnotes',
          '"Dig deeper" links for every result',
        ].map((f) => (
          <li key={f} className="flex items-start gap-2">
            <span style={{ color: 'var(--ae-green-600, #16a34a)' }}>✓</span>
            {f}
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="rounded-xl px-6 py-2.5 text-sm font-semibold transition-colors"
        style={{
          backgroundColor: 'var(--ae-gold-500, #f59e0b)',
          color: 'var(--ae-black-900, #111)',
        }}
        onClick={() => void navigate('/settings/account')}
      >
        Upgrade to Premium
      </button>
    </div>
  )
}

// ─── Synthesis result card ────────────────────────────────────────────────────

function SynthesisCard({ result }: { result: SynthesisResult }): React.ReactElement {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      className="w-full text-left rounded-xl border px-4 py-3 transition-all hover:border-[var(--accent-primary)]"
      style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}
      onClick={() => void navigate(result.route)}
    >
      <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
        {result.title}
      </p>
      <p
        className="text-xs leading-relaxed line-clamp-2"
        style={{ color: 'var(--text-secondary)' }}
        dangerouslySetInnerHTML={{ __html: result.excerpt }}
      />
    </button>
  )
}

// ─── SmartSearch ──────────────────────────────────────────────────────────────

export default function SmartSearch(): React.ReactElement {
  const ipc = useIpc()
  const [unlocked] = useState(true)
  const [question, setQuestion] = useState('')
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sections, setSections] = useState<SynthesisSection[]>([])
  const [summaryVisible, setSummaryVisible] = useState(false)
  const [summaryText, setSummaryText] = useState('')

  if (!unlocked) {
    return (
      <div className="max-w-lg mx-auto mt-8">
        <PremiumGate />
      </div>
    )
  }

  async function doSearch(e?: React.FormEvent) {
    e?.preventDefault()
    const q = question.trim()
    if (!q) return

    setLoading(true)
    setSearched(false)
    setSections([])
    setSummaryVisible(false)
    setSummaryText('')

    try {
      // Decompose the question into sub-queries
      const subQueries = decomposeQuery(q)
      // Fall back to the full question if no terms extracted
      const queries = subQueries.length > 0 ? subQueries : [q]

      // Run all sub-searches in parallel
      const allHits = await Promise.all(
        queries.map(async (sq) => {
          if (!ipc) return [] as LibraryHit[]
          try {
            return (await ipc.invoke('library:search', sq, 10, 0)) as LibraryHit[]
          } catch {
            return [] as LibraryHit[]
          }
        })
      )

      // Flatten and deduplicate by resourceKey
      const seen = new Set<string>()
      const merged: LibraryHit[] = []
      for (const batch of allHits) {
        for (const hit of batch) {
          if (!seen.has(hit.resourceKey)) {
            seen.add(hit.resourceKey)
            merged.push(hit)
          }
        }
      }

      // Build sections from real data
      const quranHits = merged.filter((h) => h.type === 'ayah' || h.type === 'translation')
      const hadithHits = merged.filter((h) => h.type === 'hadith')

      const newSections: SynthesisSection[] = []
      if (quranHits.length > 0) {
        newSections.push({
          type: 'quran',
          label: 'Quranic Verses',
          icon: '📖',
          results: quranHits.map(hitToSynthesisResult),
        })
      }
      if (hadithHits.length > 0) {
        newSections.push({
          type: 'hadith',
          label: 'Hadith',
          icon: '📜',
          results: hadithHits.map(hitToSynthesisResult),
        })
      }

      setSections(newSections)
    } finally {
      setLoading(false)
      setSearched(true)
    }
  }

  function handleSummarize() {
    // Build a 2-3 sentence summary from the first result of each section
    const lines: string[] = []
    for (const section of sections) {
      const first = section.results[0]
      if (first) {
        // Use DOMParser to safely extract plain text from the HTML excerpt
        const doc = new DOMParser().parseFromString(first.excerpt, 'text/html')
        const plain = doc.body.textContent ?? ''
        lines.push(`According to ${first.title}: ${plain}`)
      }
    }
    setSummaryText(lines.join(' '))
    setSummaryVisible(true)
  }

  const hasResults = sections.some((s) => s.results.length > 0)
  const noResults = searched && !loading && !hasResults

  return (
    <div className="flex flex-col gap-6">
      {/* Question input */}
      <div>
        <form onSubmit={(e) => void doSearch(e)} className="flex gap-2">
          <input
            type="text"
            dir="auto"
            className="flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--accent-primary)]"
            style={{
              borderColor: 'var(--border-subtle)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
            }}
            placeholder={'Ask a question, e.g. \u201cWhat does Islam say about patience?\u201d'}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button
            type="submit"
            className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--ae-black-900, #111)',
            }}
          >
            Ask
          </button>
        </form>
        <p className="text-xs mt-1.5 italic" style={{ color: 'var(--text-muted)' }}>
          (results from your library)
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-7 h-7 rounded-full border-2 border-[var(--accent-primary)] border-t-transparent animate-spin" />
        </div>
      )}

      {/* No results */}
      {noResults && (
        <div className="text-center py-12">
          <p className="text-3xl mb-3">🔍</p>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            No relevant passages found
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Try rephrasing your question or ensure relevant resources are installed
          </p>
        </div>
      )}

      {/* Results */}
      {!loading && hasResults && (
        <>
          {/* Synopsis */}
          <div
            className="rounded-xl border px-5 py-4"
            style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}
          >
            <p
              className="text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: 'var(--text-muted)' }}
            >
              Synopsis
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              Your library contains{' '}
              <strong>{sections.reduce((n, s) => n + s.results.length, 0)}</strong> relevant passage
              {sections.reduce((n, s) => n + s.results.length, 0) !== 1 ? 's' : ''} for this
              question. See the sections below for detailed results.
            </p>

            {/* Summarize button */}
            <button
              type="button"
              className="mt-3 flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-75"
              style={{ color: 'var(--accent-primary)' }}
              onClick={handleSummarize}
            >
              <span>🗜️</span>
              <span>Summarize</span>
            </button>

            {/* Summary (collapsible) */}
            {summaryVisible && summaryText && (
              <details open className="mt-3">
                <summary
                  className="text-xs font-semibold cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Summary
                </summary>
                <p
                  className="text-xs leading-relaxed mt-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {summaryText}
                </p>
              </details>
            )}
          </div>

          {/* Sections */}
          {sections.map((section) => (
            <section key={section.type}>
              <div className="flex items-center gap-2 mb-2">
                <span>{section.icon}</span>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {section.label}
                </h3>
              </div>
              <div className="flex flex-col gap-2">
                {section.results.map((r) => (
                  <SynthesisCard key={r.id} result={r} />
                ))}
              </div>
            </section>
          ))}
        </>
      )}
    </div>
  )
}
