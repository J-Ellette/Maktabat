import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIpc } from '../../hooks/useIpc'

// ─── Types ────────────────────────────────────────────────────────────────────

type HighlightColor = 'gold' | 'green' | 'red' | 'blue' | 'yellow' | 'orange' | 'fuchsia' | 'slate'

interface HighlightRow {
  id: number
  resource_key: string
  content_ref: string
  color: HighlightColor
  created_at: string
}

// ─── Color config ─────────────────────────────────────────────────────────────

const COLOR_META: Record<HighlightColor, { label: string; cssVar: string; bgVar: string }> = {
  gold: { label: 'Gold', cssVar: 'var(--ae-gold-400, #fbbf24)', bgVar: 'rgba(251,191,36,0.25)' },
  green: { label: 'Green', cssVar: 'var(--ae-green-400, #4ade80)', bgVar: 'rgba(74,222,128,0.25)' },
  red: { label: 'Red', cssVar: 'var(--ae-red-400, #fb7185)', bgVar: 'rgba(251,113,133,0.25)' },
  blue: { label: 'Blue', cssVar: 'var(--tech-blue-400, #60a5fa)', bgVar: 'rgba(96,165,250,0.25)' },
  yellow: { label: 'Yellow', cssVar: 'var(--camel-yellow-400, #fde047)', bgVar: 'rgba(253,224,71,0.25)' },
  orange: { label: 'Orange', cssVar: 'var(--desert-orange-400, #fb923c)', bgVar: 'rgba(251,146,60,0.25)' },
  fuchsia: { label: 'Fuchsia', cssVar: 'var(--fuchsia-400, #e879f9)', bgVar: 'rgba(232,121,249,0.25)' },
  slate: { label: 'Slate', cssVar: 'var(--ae-black-300, #cbd5e1)', bgVar: 'rgba(148,163,184,0.25)' },
}

function resourceLabel(resourceKey: string): string {
  if (resourceKey.startsWith('quran:')) return `Quran — Surah ${resourceKey.replace('quran:', '')}`
  if (resourceKey.startsWith('hadith:')) return `Hadith — ${resourceKey.replace('hadith:', '')}`
  if (resourceKey.startsWith('tafsir:')) return `Tafsir — ${resourceKey.replace('tafsir:', '')}`
  if (resourceKey.startsWith('text:')) return resourceKey.replace('text:', '') || 'General'
  return resourceKey
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

function exportHighlightsAsText(highlights: HighlightRow[]): void {
  const lines = highlights.map((h) => {
    const source = resourceLabel(h.resource_key)
    const date = formatDate(h.created_at)
    return `[${COLOR_META[h.color]?.label ?? h.color}] ${source} — ${h.content_ref}\n(${date})\n`
  })
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'maktabat-highlights.txt'
  a.click()
  URL.revokeObjectURL(url)
}

// ─── HighlightCard ────────────────────────────────────────────────────────────

function HighlightCard({
  highlight,
  onDelete,
}: {
  highlight: HighlightRow
  onDelete: (id: number) => void
}): React.ReactElement {
  const navigate = useNavigate()
  const colorMeta = COLOR_META[highlight.color] ?? COLOR_META.slate

  function handleNavigate() {
    const rk = highlight.resource_key
    if (rk.startsWith('quran:')) {
      void navigate(`/quran/${rk.replace('quran:', '')}`)
    } else if (rk.startsWith('hadith:')) {
      void navigate(`/hadith/${rk.replace('hadith:', '')}`)
    }
  }

  return (
    <div
      className="group rounded-lg border p-3 transition-shadow hover:shadow-sm"
      style={{
        borderColor: 'var(--border-subtle)',
        backgroundColor: colorMeta.bgVar,
        borderLeft: `3px solid ${colorMeta.cssVar}`,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
            {resourceLabel(highlight.resource_key)}
          </p>
          <p
            className="text-sm mt-0.5 line-clamp-3"
            style={{ color: 'var(--text-secondary)' }}
          >
            {highlight.content_ref}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {formatDate(highlight.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {(highlight.resource_key.startsWith('quran:') ||
            highlight.resource_key.startsWith('hadith:')) && (
            <button
              title="Go to source"
              onClick={handleNavigate}
              className="p-1 rounded hover:bg-[var(--bg-secondary)] text-xs"
              style={{ color: 'var(--text-secondary)' }}
            >
              ↗
            </button>
          )}
          <button
            title="Delete highlight"
            onClick={() => onDelete(highlight.id)}
            className="p-1 rounded hover:bg-[var(--ae-red-100)] text-xs"
            style={{ color: 'var(--ae-red-500, #f43f5e)' }}
          >
            ✕
          </button>
        </div>
      </div>
      {/* Color badge */}
      <div className="flex items-center gap-1 mt-2">
        <span
          className="inline-block w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: colorMeta.cssVar }}
        />
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {colorMeta.label}
        </span>
      </div>
    </div>
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export default function HighlightsPanel(): React.ReactElement {
  const ipc = useIpc()
  const [highlights, setHighlights] = useState<HighlightRow[]>([])
  const [loading, setLoading] = useState(true)
  const [activeColor, setActiveColor] = useState<HighlightColor | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const loadHighlights = useCallback(async () => {
    if (!ipc) { setLoading(false); return }
    setLoading(true)
    try {
      const data = await ipc.invoke('user:get-all-highlights')
      setHighlights(data as HighlightRow[])
    } catch {
      setHighlights([])
    } finally {
      setLoading(false)
    }
  }, [ipc])

  useEffect(() => {
    void loadHighlights()
  }, [loadHighlights])

  async function handleDelete(id: number) {
    if (!ipc) return
    try {
      await ipc.invoke('user:delete-highlight', id)
      setHighlights((prev) => prev.filter((h) => h.id !== id))
    } catch {
      // ignore
    }
  }

  const filtered = highlights.filter((h) => {
    const matchColor = activeColor === 'all' || h.color === activeColor
    const matchSearch =
      !searchQuery ||
      h.content_ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.resource_key.toLowerCase().includes(searchQuery.toLowerCase())
    return matchColor && matchSearch
  })

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <div>
          <h1 className="text-base font-semibold">Highlights</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {highlights.length} highlight{highlights.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          title="Export highlights"
          onClick={() => exportHighlightsAsText(filtered)}
          disabled={filtered.length === 0}
          className="
            flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border
            hover:bg-[var(--bg-secondary)] disabled:opacity-40 disabled:cursor-not-allowed
            transition-colors
          "
          style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
        >
          ↓ Export
        </button>
      </div>

      {/* Search */}
      <div className="px-4 pt-3 pb-2">
        <input
          type="search"
          placeholder="Search highlights…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="
            w-full px-3 py-1.5 text-sm rounded-lg border
            bg-[var(--bg-secondary)] border-[var(--border-color)]
            placeholder-[var(--text-muted)] text-[var(--text-primary)]
            focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]
          "
        />
      </div>

      {/* Color filter */}
      <div className="flex items-center gap-1.5 px-4 pb-3 flex-wrap">
        <button
          onClick={() => setActiveColor('all')}
          className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${activeColor === 'all' ? 'bg-[var(--accent-primary)] text-white border-transparent' : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'}`}
        >
          All
        </button>
        {(Object.keys(COLOR_META) as HighlightColor[]).map((color) => (
          <button
            key={color}
            title={COLOR_META[color].label}
            onClick={() => setActiveColor(color === activeColor ? 'all' : color)}
            className={`w-5 h-5 rounded-full border-2 transition-all ${activeColor === color ? 'scale-125 border-[var(--text-primary)]' : 'border-transparent hover:scale-110'}`}
            style={{ backgroundColor: COLOR_META[color].cssVar }}
          />
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🖊️</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              {highlights.length === 0
                ? 'No highlights yet'
                : 'No highlights match your filter'}
            </p>
            {highlights.length === 0 && (
              <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                Select text in any panel and choose a color to highlight it.
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((h) => (
              <HighlightCard key={h.id} highlight={h} onDelete={(id) => void handleDelete(id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
