import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useIpc } from '../../hooks/useIpc'
import SmartSearch from './SmartSearch'
import AiAssistant from './AiAssistant'

// ─── Types ────────────────────────────────────────────────────────────────────

type ResultType = 'ayah' | 'translation' | 'hadith'

interface SearchResult {
  id: number
  type: ResultType
  resourceKey: string
  excerpt: string
  relevance: number
  metadata: Record<string, unknown>
  expanded?: boolean
}

// ─── Resource type labels & colors ───────────────────────────────────────────

const RESOURCE_TYPE_META: Record<
  ResultType,
  { label: string; color: string; bgColor: string; navPrefix: string }
> = {
  ayah: {
    label: 'Quran',
    color: 'var(--ae-gold-700, #b45309)',
    bgColor: 'color-mix(in srgb, var(--ae-gold-500, #f59e0b) 15%, transparent)',
    navPrefix: '/quran',
  },
  translation: {
    label: 'Translation',
    color: 'var(--ae-green-700, #15803d)',
    bgColor: 'color-mix(in srgb, var(--ae-green-500, #22c55e) 15%, transparent)',
    navPrefix: '/quran',
  },
  hadith: {
    label: 'Hadith',
    color: 'var(--tech-blue-700, #1d4ed8)',
    bgColor: 'color-mix(in srgb, var(--tech-blue-500, #3b82f6) 15%, transparent)',
    navPrefix: '/hadith',
  },
}

function buildNavPath(result: SearchResult): string {
  const meta = result.metadata
  if (result.type === 'ayah') {
    return `/quran/${String(meta.surahId ?? '')}/${String(meta.ayahNumber ?? '')}`
  }
  if (result.type === 'translation') {
    // resourceKey = "translation:key:ayahId" — parse surah/ayah from metadata if available
    // metadata contains ayahId; navigate to the ayah via generic Quran route until we can
    // resolve surah number (would require an extra IPC call). Fall back to /quran.
    const ayahId = meta.ayahId
    return ayahId ? `/quran` : '/quran'
  }
  if (result.type === 'hadith') {
    return `/hadith/${String(meta.collectionKey ?? '')}/${String(meta.hadithNumber ?? '')}`
  }
  return '/'
}

// ─── Result card ─────────────────────────────────────────────────────────────

function ResultCard({ result }: { result: SearchResult }): React.ReactElement {
  const navigate = useNavigate()
  const typeMeta = RESOURCE_TYPE_META[result.type]
  const navPath = buildNavPath(result)

  // Build a descriptive title from metadata
  let title = ''
  const meta = result.metadata
  if (result.type === 'ayah') {
    title = `Surah ${String(meta.surahId ?? '')} : Ayah ${String(meta.ayahNumber ?? '')}`
  } else if (result.type === 'translation') {
    const translatorRaw = meta.translator
    const translator = typeof translatorRaw === 'string' ? translatorRaw : ''
    title = translator ? `${translator} — Surah translation` : 'Translation'
  } else if (result.type === 'hadith') {
    const collName = meta.collectionNameEnglish
    const hadithNum = meta.hadithNumber
    const collDisplay = typeof collName === 'string' ? collName : String(meta.collectionKey ?? '')
    title = `${collDisplay} #${String(hadithNum ?? '')}`
  }

  // Highlight matched terms inside excerpt
  function highlightExcerpt(html: string): string {
    // FTS5 already wraps matches in <mark>; restyle the opening tag only
    return html.replace(/<mark>/g, '<mark class="search-highlight">')
  }

  return (
    <button
      type="button"
      className="w-full text-left rounded-xl border transition-all hover:border-[var(--accent-primary)] hover:shadow-sm"
      style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}
      onClick={() => void navigate(navPath)}
    >
      <div className="px-4 py-3">
        {/* Header row */}
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
            style={{ color: typeMeta.color, backgroundColor: typeMeta.bgColor }}
          >
            {typeMeta.label}
          </span>
          <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
            {title}
          </span>
        </div>
        {/* Excerpt */}
        <p
          className="text-sm leading-relaxed line-clamp-3"
          style={{ color: 'var(--text-secondary)' }}
          // FTS5 snippet already has <mark> tags; we restyle them via CSS
          dangerouslySetInnerHTML={{ __html: highlightExcerpt(result.excerpt) }}
        />
        {/* Resource key hint */}
        <p className="text-[10px] mt-1.5 font-mono truncate" style={{ color: 'var(--text-muted)' }}>
          {result.resourceKey}
        </p>
      </div>
    </button>
  )
}

// ─── Result group ─────────────────────────────────────────────────────────────

function ResultGroup({
  type,
  results,
}: {
  type: ResultType
  results: SearchResult[]
}): React.ReactElement {
  const [expanded, setExpanded] = useState(true)
  const typeMeta = RESOURCE_TYPE_META[type]
  const visible = expanded ? results : results.slice(0, 3)

  return (
    <section>
      <button
        type="button"
        className="flex items-center gap-2 w-full text-left mb-2"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
      >
        <span
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: typeMeta.color }}
        >
          {typeMeta.label}
        </span>
        <span
          className="text-xs px-1.5 py-0.5 rounded-full"
          style={{
            backgroundColor: typeMeta.bgColor,
            color: typeMeta.color,
          }}
        >
          {results.length}
        </span>
        <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>
          {expanded ? '▲' : '▼'}
        </span>
      </button>
      <div className="flex flex-col gap-2">
        {visible.map((r) => (
          <ResultCard key={`${r.type}-${r.id}`} result={r} />
        ))}
      </div>
      {!expanded && results.length > 3 && (
        <button
          type="button"
          className="mt-2 text-xs underline"
          style={{ color: 'var(--accent-primary)' }}
          onClick={() => setExpanded(true)}
        >
          Show {results.length - 3} more {typeMeta.label} results
        </button>
      )}
    </section>
  )
}

// ─── Filters sidebar ──────────────────────────────────────────────────────────

const ALL_TYPES: ResultType[] = ['ayah', 'translation', 'hadith']

function FiltersSidebar({
  enabledTypes,
  onToggleType,
  expandMorphology,
  onToggleExpand,
}: {
  enabledTypes: Set<ResultType>
  onToggleType: (type: ResultType) => void
  expandMorphology: boolean
  onToggleExpand: () => void
}): React.ReactElement {
  return (
    <aside
      className="w-48 flex-shrink-0 rounded-xl border p-4 self-start"
      style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}
    >
      <p
        className="text-xs font-bold uppercase tracking-wider mb-3"
        style={{ color: 'var(--text-muted)' }}
      >
        Resource Types
      </p>
      <div className="flex flex-col gap-2">
        {ALL_TYPES.map((type) => {
          const meta = RESOURCE_TYPE_META[type]
          const on = enabledTypes.has(type)
          return (
            <label key={type} className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="rounded"
                checked={on}
                onChange={() => onToggleType(type)}
                aria-label={`Filter by ${meta.label}`}
              />
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                {meta.label}
              </span>
            </label>
          )
        })}
      </div>

      <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <p
          className="text-xs font-bold uppercase tracking-wider mb-2"
          style={{ color: 'var(--text-muted)' }}
        >
          Search Options
        </p>
        <label className="flex items-start gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            className="rounded mt-0.5"
            checked={expandMorphology}
            onChange={onToggleExpand}
            aria-label="Toggle morphological expansion"
          />
          <span className="text-sm leading-snug" style={{ color: 'var(--text-primary)' }}>
            Morphological expansion
          </span>
        </label>
      </div>
    </aside>
  )
}

// ─── Full-text search tab ─────────────────────────────────────────────────────

function FullTextSearch({ initialQuery }: { initialQuery: string }): React.ReactElement {
  const ipc = useIpc()
  const [query, setQuery] = useState(initialQuery)
  const [inputValue, setInputValue] = useState(initialQuery)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [enabledTypes, setEnabledTypes] = useState<Set<ResultType>>(new Set(ALL_TYPES))
  const [expandMorphology, setExpandMorphology] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  // Run search whenever query or enabled types change
  const runSearch = useCallback(
    async (q: string, types: Set<ResultType>, expand: boolean) => {
      if (!ipc || !q.trim()) return
      setLoading(true)
      setSearched(true)
      try {
        const typeArray = [...types]
        const rows = (await ipc.invoke(
          'library:search',
          q,
          60,
          0,
          typeArray,
          expand
        )) as SearchResult[]
        setResults(rows ?? [])
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    },
    [ipc]
  )

  // Trigger search when query, types, or expansion setting changes
  useEffect(() => {
    if (query.trim()) {
      void runSearch(query, enabledTypes, expandMorphology)
    }
  }, [query, enabledTypes, expandMorphology, runSearch])

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    const trimmed = inputValue.trim()
    if (trimmed) setQuery(trimmed)
  }

  function toggleType(type: ResultType) {
    setEnabledTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type)) {
        // Keep at least 1
        if (next.size > 1) next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }

  // Group results by type
  const grouped = ALL_TYPES.reduce<Record<ResultType, SearchResult[]>>(
    (acc, t) => {
      acc[t] = results.filter((r) => r.type === t)
      return acc
    },
    { ayah: [], translation: [], hadith: [] }
  )

  const hasResults = results.length > 0
  const groupsWithResults = ALL_TYPES.filter((t) => grouped[t].length > 0)

  return (
    <div className="flex gap-6">
      {/* Filters */}
      <FiltersSidebar
        enabledTypes={enabledTypes}
        onToggleType={toggleType}
        expandMorphology={expandMorphology}
        onToggleExpand={() => setExpandMorphology((e) => !e)}
      />

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Search input */}
        <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="var(--text-muted)"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <circle cx="7" cy="7" r="4" />
              <path d="M10.5 10.5L14 14" />
            </svg>
            <input
              ref={inputRef}
              type="search"
              dir="auto"
              className="w-full rounded-xl border pl-9 pr-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--accent-primary)]"
              style={{
                borderColor: 'var(--border-subtle)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
              }}
              placeholder="Search in Arabic, English, or transliteration…"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <button
            type="submit"
            className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--ae-black-900, #111)',
            }}
          >
            Search
          </button>
        </form>

        {/* ARIA live region for search status announcements */}
        <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {loading
            ? 'Searching...'
            : searched && !hasResults
              ? 'No results found'
              : hasResults
                ? `Found ${results.length} result${results.length !== 1 ? 's' : ''}`
                : ''}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-7 h-7 rounded-full border-2 border-[var(--accent-primary)] border-t-transparent animate-spin" />
          </div>
        )}

        {/* Empty / no results */}
        {!loading && searched && !hasResults && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              No results found
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Try different keywords, check your spelling, or broaden your search
            </p>
          </div>
        )}

        {/* Pre-search state */}
        {!loading && !searched && (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">📖</p>
            <p className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>
              Search your entire library
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Searches Quranic verses, translations, and hadith collections
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {['prayer', 'patience', 'mercy', 'بسم الله', 'صبر', 'رحمة'].map((hint) => (
                <button
                  type="button"
                  key={hint}
                  className="rounded-full border px-3 py-1 text-xs transition-colors hover:border-[var(--accent-primary)]"
                  style={{
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    direction: /[\u0600-\u06ff]/.test(hint) ? 'rtl' : 'ltr',
                  }}
                  onClick={() => {
                    setInputValue(hint)
                    setQuery(hint)
                  }}
                >
                  {hint}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && hasResults && (
          <>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
              {results.length} result{results.length !== 1 ? 's' : ''} for{' '}
              <strong style={{ color: 'var(--text-primary)' }}>&ldquo;{query}&rdquo;</strong>
            </p>
            {expandMorphology && results.some((r) => r.expanded) && (
              <p className="text-[10px] mb-4 italic" style={{ color: 'var(--text-muted)' }}>
                (morphological expansion active)
              </p>
            )}
            {(!expandMorphology || !results.some((r) => r.expanded)) && <div className="mb-4" />}
            <div className="flex flex-col gap-6">
              {groupsWithResults.map((type) => (
                <ResultGroup key={type} type={type} results={grouped[type]} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Main SearchPanel ─────────────────────────────────────────────────────────

type SearchTab = 'fulltext' | 'smart' | 'ai'

export default function SearchPanel(): React.ReactElement {
  const [searchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') ?? ''
  const [activeTab, setActiveTab] = useState<SearchTab>('fulltext')

  const tabs: { id: SearchTab; label: string; shortLabel: string; premium?: boolean }[] = [
    { id: 'fulltext', label: 'Full-Text Search', shortLabel: 'Search' },
    { id: 'smart', label: 'Smart Search', shortLabel: 'Smart', premium: true },
    { id: 'ai', label: 'AI Study Assistant', shortLabel: 'AI Assistant', premium: true },
  ]

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Page header */}
      <div
        className="px-6 pt-5 pb-0 border-b flex-shrink-0"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <h1 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Search Library
        </h1>
        {/* Tab bar */}
        <div className="flex gap-1" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className="relative px-4 py-2 text-sm font-medium transition-colors rounded-t-lg"
              style={{
                color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-muted)',
                borderBottom:
                  activeTab === tab.id
                    ? '2px solid var(--accent-primary)'
                    : '2px solid transparent',
              }}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {tab.premium && (
                <span
                  className="ml-1.5 text-[9px] font-bold uppercase px-1 py-0.5 rounded"
                  style={{
                    backgroundColor:
                      'color-mix(in srgb, var(--ae-gold-500, #f59e0b) 20%, transparent)',
                    color: 'var(--ae-gold-700, #b45309)',
                  }}
                >
                  Premium
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {activeTab === 'fulltext' && <FullTextSearch initialQuery={initialQuery} />}
        {activeTab === 'smart' && <SmartSearch />}
        {activeTab === 'ai' && <AiAssistant />}
      </div>

      {/* Global search highlight styles */}
      <style>{`
        .search-highlight {
          background-color: color-mix(in srgb, var(--ae-gold-500, #f59e0b) 35%, transparent);
          color: var(--text-primary);
          border-radius: 2px;
          padding: 0 1px;
        }
      `}</style>
    </div>
  )
}
