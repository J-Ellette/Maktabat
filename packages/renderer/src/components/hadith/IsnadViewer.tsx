import React, { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface IsnadEntry {
  id: number
  position: number
  name_arabic: string
  name_english: string
  birth_year: number | null
  death_year: number | null
  reliability: string
}

// ─── Reliability metadata ─────────────────────────────────────────────────────

interface ReliabilityMeta {
  label: string
  arabicLabel: string
  color: string
  bg: string
  border: string
  isWeak: boolean
}

function getReliabilityMeta(reliability: string): ReliabilityMeta {
  switch (reliability) {
    case 'thiqah':
      return {
        label: 'Thiqah',
        arabicLabel: 'ثقة',
        color: 'var(--ae-green-600, #16a34a)',
        bg: 'color-mix(in srgb, var(--ae-green-600, #16a34a) 12%, transparent)',
        border: 'color-mix(in srgb, var(--ae-green-600, #16a34a) 40%, transparent)',
        isWeak: false,
      }
    case 'sadooq':
      return {
        label: 'Sadooq',
        arabicLabel: 'صدوق',
        color: 'var(--ae-gold-500, #eab308)',
        bg: 'color-mix(in srgb, var(--ae-gold-500, #eab308) 12%, transparent)',
        border: 'color-mix(in srgb, var(--ae-gold-500, #eab308) 40%, transparent)',
        isWeak: false,
      }
    case 'daif':
      return {
        label: "Da'if",
        arabicLabel: 'ضعيف',
        color: 'var(--ae-red-400, #f87171)',
        bg: 'color-mix(in srgb, var(--ae-red-400, #f87171) 12%, transparent)',
        border: 'color-mix(in srgb, var(--ae-red-400, #f87171) 40%, transparent)',
        isWeak: true,
      }
    default:
      return {
        label: 'Unknown',
        arabicLabel: 'مجهول',
        color: 'var(--text-muted, #6b7280)',
        bg: 'color-mix(in srgb, var(--text-muted, #6b7280) 12%, transparent)',
        border: 'color-mix(in srgb, var(--text-muted, #6b7280) 40%, transparent)',
        isWeak: false,
      }
  }
}

// ─── Narrator node ────────────────────────────────────────────────────────────

interface NarratorNodeProps {
  narrator: IsnadEntry
  index: number
}

function NarratorNode({ narrator, index }: NarratorNodeProps): React.ReactElement {
  const [expanded, setExpanded] = useState(false)
  const meta = getReliabilityMeta(narrator.reliability)

  const dateStr =
    narrator.birth_year !== null || narrator.death_year !== null
      ? [
          narrator.birth_year !== null ? `b. ${narrator.birth_year} AH` : null,
          narrator.death_year !== null ? `d. ${narrator.death_year} AH` : null,
        ]
          .filter(Boolean)
          .join(' — ')
      : null

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        className="flex flex-col items-center gap-1 rounded-lg p-2 border transition-all max-w-[120px]"
        style={{
          backgroundColor: meta.bg,
          borderColor: expanded ? meta.color : meta.border,
          minWidth: 90,
        }}
        onClick={() => setExpanded((v) => !v)}
        title="Click for details"
      >
        {/* Position number */}
        <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
          #{index + 1}
        </span>

        {/* Arabic name */}
        <span
          dir="rtl"
          className="text-sm font-semibold text-center leading-tight"
          style={{ fontFamily: 'var(--font-arabic, serif)', color: 'var(--text-primary)' }}
        >
          {narrator.name_arabic || narrator.name_english}
        </span>

        {/* Reliability badge */}
        <span
          className="text-[10px] font-medium rounded px-1.5 py-0.5 border"
          style={{ color: meta.color, borderColor: 'currentColor' }}
        >
          {meta.arabicLabel}
        </span>

        {/* Weak warning */}
        {meta.isWeak && (
          <span className="text-[10px]" title="Weak narrator">
            ⚠️
          </span>
        )}
      </button>

      {/* Expanded bio tooltip */}
      {expanded && (
        <div
          className="mt-2 rounded-lg border p-3 text-xs max-w-[200px] shadow-lg z-10"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
            color: 'var(--text-primary)',
          }}
        >
          <p className="font-semibold mb-1">{narrator.name_english}</p>
          {narrator.name_arabic && (
            <p
              dir="rtl"
              className="mb-1 text-sm"
              style={{ fontFamily: 'var(--font-arabic, serif)' }}
            >
              {narrator.name_arabic}
            </p>
          )}
          {dateStr && <p style={{ color: 'var(--text-muted)' }}>{dateStr}</p>}
          <p className="mt-1">
            Reliability:{' '}
            <span style={{ color: meta.color }}>
              {meta.label} ({meta.arabicLabel})
            </span>
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Prophet node ─────────────────────────────────────────────────────────────

function ProphetNode(): React.ReactElement {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="flex flex-col items-center justify-center rounded-full w-16 h-16 border-2 text-center"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--accent-primary, #eab308) 15%, transparent)',
          borderColor: 'var(--accent-primary, #eab308)',
        }}
      >
        <span
          dir="rtl"
          className="text-sm font-bold"
          style={{ fontFamily: 'var(--font-arabic, serif)', color: 'var(--accent-primary)' }}
        >
          النبي ﷺ
        </span>
      </div>
      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
        Prophet ﷺ
      </span>
    </div>
  )
}

// ─── Arrow connector ──────────────────────────────────────────────────────────

function Arrow(): React.ReactElement {
  return (
    <div
      className="flex items-center self-start mt-6 px-1 flex-shrink-0"
      style={{ color: 'var(--text-muted)' }}
    >
      <span className="text-lg">→</span>
    </div>
  )
}

// ─── IsnadViewer ──────────────────────────────────────────────────────────────

interface IsnadViewerProps {
  narrators: IsnadEntry[]
}

export default function IsnadViewer({ narrators }: IsnadViewerProps): React.ReactElement {
  const hasWeak = narrators.some((n) => n.reliability === 'daif')

  if (narrators.length === 0) {
    return (
      <div
        className="rounded-lg border p-4 text-center text-sm"
        style={{
          borderColor: 'var(--border-subtle)',
          color: 'var(--text-muted)',
        }}
      >
        No chain of narration (isnad) available for this hadith.
      </div>
    )
  }

  return (
    <div
      className="rounded-lg border p-4"
      style={{
        borderColor: 'var(--border-subtle)',
        backgroundColor: 'var(--bg-surface)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Chain of Narration (Isnad)
        </h3>
        {hasWeak && (
          <span
            className="text-xs flex items-center gap-1 rounded px-2 py-0.5 border"
            style={{
              color: 'var(--ae-red-400, #f87171)',
              borderColor: 'currentColor',
              backgroundColor: 'color-mix(in srgb, var(--ae-red-400) 10%, transparent)',
            }}
          >
            ⚠️ Contains weak narrator(s)
          </span>
        )}
      </div>

      {/* Horizontal scroll for the chain */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-start gap-0 min-w-max">
          {narrators.map((narrator, index) => (
            <React.Fragment key={narrator.id}>
              <NarratorNode narrator={narrator} index={index} />
              <Arrow />
            </React.Fragment>
          ))}
          <ProphetNode />
        </div>
      </div>

      <p className="text-[10px] mt-3" style={{ color: 'var(--text-muted)' }}>
        Click any narrator to view details. Chain reads left → right toward the Prophet ﷺ.
      </p>
    </div>
  )
}
