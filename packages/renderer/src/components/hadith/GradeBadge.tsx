import React from 'react'

// ─── Grade metadata ───────────────────────────────────────────────────────────

interface GradeMeta {
  arabicLabel: string
  englishLabel: string
  color: string
  bg: string
  border: string
}

const GRADE_META: Record<string, GradeMeta> = {
  sahih: {
    arabicLabel: 'صحيح',
    englishLabel: 'Sahih',
    color: 'var(--ae-green-600, #16a34a)',
    bg: 'color-mix(in srgb, var(--ae-green-600, #16a34a) 12%, transparent)',
    border: 'color-mix(in srgb, var(--ae-green-600, #16a34a) 40%, transparent)',
  },
  hasan: {
    arabicLabel: 'حسن',
    englishLabel: 'Hasan',
    color: 'var(--ae-green-400, #4ade80)',
    bg: 'color-mix(in srgb, var(--ae-green-400, #4ade80) 12%, transparent)',
    border: 'color-mix(in srgb, var(--ae-green-400, #4ade80) 40%, transparent)',
  },
  'hasan-li-ghayrihi': {
    arabicLabel: 'حسن لغيره',
    englishLabel: 'Hasan li-ghayrihi',
    color: 'var(--ae-gold-500, #eab308)',
    bg: 'color-mix(in srgb, var(--ae-gold-500, #eab308) 12%, transparent)',
    border: 'color-mix(in srgb, var(--ae-gold-500, #eab308) 40%, transparent)',
  },
  daif: {
    arabicLabel: 'ضعيف',
    englishLabel: "Da'if",
    color: 'var(--ae-red-400, #f87171)',
    bg: 'color-mix(in srgb, var(--ae-red-400, #f87171) 12%, transparent)',
    border: 'color-mix(in srgb, var(--ae-red-400, #f87171) 40%, transparent)',
  },
  mawdu: {
    arabicLabel: 'موضوع',
    englishLabel: "Mawdu'",
    color: 'var(--ae-red-700, #b91c1c)',
    bg: 'color-mix(in srgb, var(--ae-red-700, #b91c1c) 12%, transparent)',
    border: 'color-mix(in srgb, var(--ae-red-700, #b91c1c) 40%, transparent)',
  },
}

const FALLBACK: GradeMeta = {
  arabicLabel: '',
  englishLabel: 'Unknown',
  color: 'var(--text-muted, #6b7280)',
  bg: 'color-mix(in srgb, var(--text-muted, #6b7280) 12%, transparent)',
  border: 'color-mix(in srgb, var(--text-muted, #6b7280) 40%, transparent)',
}

// ─── Component ────────────────────────────────────────────────────────────────

interface GradeBadgeProps {
  grade: string
  /** When true, shows both Arabic label and English label */
  verbose?: boolean
  className?: string
}

export default function GradeBadge({
  grade,
  verbose = false,
  className = '',
}: GradeBadgeProps): React.ReactElement {
  const meta = GRADE_META[grade] ?? FALLBACK

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold border ${className}`}
      style={{
        color: meta.color,
        backgroundColor: meta.bg,
        borderColor: meta.border,
      }}
    >
      {meta.arabicLabel && (
        <span dir="rtl" style={{ fontFamily: 'var(--font-arabic, serif)' }}>
          {meta.arabicLabel}
        </span>
      )}
      {(verbose || !meta.arabicLabel) && <span>{meta.englishLabel}</span>}
    </span>
  )
}
