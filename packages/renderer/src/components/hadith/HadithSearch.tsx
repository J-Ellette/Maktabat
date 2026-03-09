import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIpc } from '../../hooks/useIpc'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SearchResult {
  id: number
  hadith_number: string
  collection_key: string
  collection_name_english: string
  excerpt: string
}

interface Collection {
  id: number
  key: string
  name_english: string
  tradition: string
}

// ─── HadithSearch ─────────────────────────────────────────────────────────────

interface HadithSearchProps {
  initialQuery?: string
}

export default function HadithSearch({ initialQuery = '' }: HadithSearchProps): React.ReactElement {
  const ipc = useIpc()
  const navigate = useNavigate()

  const [query, setQuery] = useState(initialQuery)
  const [narratorQuery, setNarratorQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [selectedCollections, setSelectedCollections] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [activeTab, setActiveTab] = useState<'text' | 'narrator'>('text')

  // Load collections for filter
  useEffect(() => {
    if (!ipc) return
    async function load() {
      try {
        const cols = (await ipc!.invoke('library:get-hadith-collections')) as Collection[]
        setCollections(cols ?? [])
      } catch {
        setCollections([])
      }
    }
    void load()
  }, [ipc])

  async function doSearch() {
    if (!ipc) return
    const q = activeTab === 'text' ? query.trim() : narratorQuery.trim()
    if (!q) return

    setLoading(true)
    setSearched(true)
    try {
      let rows: SearchResult[]
      if (activeTab === 'narrator') {
        rows = (await ipc.invoke('library:search-hadiths', q, null, null, 40, 0)) as SearchResult[]
      } else {
        const collKey = selectedCollections.size === 1 ? [...selectedCollections][0] : null
        rows = (await ipc.invoke(
          'library:search-hadiths',
          q,
          collKey ?? null,
          null,
          40,
          0
        )) as SearchResult[]
      }

      let filtered = rows ?? []
      if (selectedCollections.size > 0) {
        filtered = filtered.filter((r) => selectedCollections.has(r.collection_key))
      }
      setResults(filtered)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  function toggleCollection(key: string) {
    setSelectedCollections((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search header */}
      <div
        className="rounded-xl border p-4"
        style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}
      >
        {/* Tabs */}
        <div className="flex gap-1 mb-3">
          {(['text', 'narrator'] as const).map((tab) => (
            <button
              type="button"
              key={tab}
              className="px-3 py-1 rounded text-xs font-medium capitalize transition-colors"
              style={{
                backgroundColor:
                  activeTab === tab
                    ? 'color-mix(in srgb, var(--accent-primary) 20%, transparent)'
                    : 'transparent',
                color: activeTab === tab ? 'var(--accent-primary)' : 'var(--text-muted)',
                border: `1px solid ${activeTab === tab ? 'var(--accent-primary)' : 'transparent'}`,
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'text' ? 'Text Search' : 'Narrator Search'}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none transition-colors"
            style={{
              borderColor: 'var(--border-subtle)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
            }}
            placeholder={
              activeTab === 'text' ? 'Search Arabic or English text…' : 'Search by narrator name…'
            }
            value={activeTab === 'text' ? query : narratorQuery}
            onChange={(e) =>
              activeTab === 'text' ? setQuery(e.target.value) : setNarratorQuery(e.target.value)
            }
            onKeyDown={(e) => e.key === 'Enter' && void doSearch()}
          />
          <button
            type="button"
            className="rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--ae-black-900, #111)',
            }}
            onClick={() => void doSearch()}
          >
            Search
          </button>
        </div>

        {/* Filters */}
        {collections.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Filter by Collection
            </p>
            <div className="flex flex-wrap gap-1.5">
              {collections.map((col) => (
                <button
                  type="button"
                  key={col.key}
                  className="rounded-full px-2.5 py-0.5 text-xs border transition-colors"
                  style={{
                    backgroundColor: selectedCollections.has(col.key)
                      ? 'color-mix(in srgb, var(--accent-primary) 20%, transparent)'
                      : 'transparent',
                    borderColor: selectedCollections.has(col.key)
                      ? 'var(--accent-primary)'
                      : 'var(--border-subtle)',
                    color: selectedCollections.has(col.key)
                      ? 'var(--accent-primary)'
                      : 'var(--text-muted)',
                  }}
                  onClick={() => toggleCollection(col.key)}
                >
                  {col.name_english}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Grade filtering is not supported in text search (requires backend join) */}
      </div>

      {/* Results */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div
            className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--accent-primary)' }}
          />
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
          <p className="text-sm">No hadiths found matching your search.</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {results.length} result{results.length !== 1 ? 's' : ''}
          </p>
          {results.map((r) => (
            <button
              type="button"
              key={`${r.collection_key}-${r.id}`}
              className="text-left rounded-lg border px-4 py-3 transition-colors hover:border-[var(--accent-primary)]"
              style={{
                borderColor: 'var(--border-subtle)',
                backgroundColor: 'var(--bg-surface)',
              }}
              onClick={() => void navigate(`/hadith/${r.collection_key}/${r.id}`)}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold" style={{ color: 'var(--accent-primary)' }}>
                  {r.collection_name_english || r.collection_key}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  #{r.hadith_number}
                </span>
              </div>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--text-primary)' }}
                dangerouslySetInnerHTML={{ __html: r.excerpt }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
