import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIpc } from '../../hooks/useIpc'
import GradeBadge from './GradeBadge'
import IsnadViewer, { type IsnadEntry } from './IsnadViewer'

// ─── Types ────────────────────────────────────────────────────────────────────

interface HadithRow {
  id: number
  collection_id: number
  book_id: number
  chapter_id: number | null
  hadith_number: string
  arabic_text: string
  english_text: string
  collection_key: string
  collection_name_english: string
}

interface HadithGradeRow {
  id: number
  hadith_id: number
  grade: string
  grader: string
  source: string | null
}

interface HadithBundle {
  hadith: HadithRow
  grades: HadithGradeRow[]
  isnad: IsnadEntry[]
}

interface CompanionHadith {
  id: number
  hadith_number: string
  collection_key: string
  collection_name_english: string
  excerpt: string
}

// ─── Loading spinner ──────────────────────────────────────────────────────────

function Spinner(): React.ReactElement {
  return (
    <div className="flex items-center justify-center py-12">
      <div
        className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: 'var(--accent-primary)' }}
      />
    </div>
  )
}

// ─── HadithViewer ─────────────────────────────────────────────────────────────

interface HadithViewerProps {
  /** Load by collection key + number */
  collectionKey?: string
  hadithNumber?: string
  /** Or load by DB id */
  hadithId?: number
  /** List of hadith IDs in the current book/chapter for prev/next navigation */
  siblingsIds?: number[]
}

export default function HadithViewer({
  collectionKey,
  hadithNumber,
  hadithId,
  siblingsIds,
}: HadithViewerProps): React.ReactElement {
  const ipc = useIpc()
  const navigate = useNavigate()

  const [bundle, setBundle] = useState<HadithBundle | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [companions, setCompanions] = useState<CompanionHadith[]>([])
  const [showIsnad, setShowIsnad] = useState(false)

  const loadHadith = useCallback(async () => {
    if (!ipc) return
    setLoading(true)
    setError(null)
    setBundle(null)
    setCompanions([])

    try {
      let result: HadithBundle | null = null
      if (hadithId !== undefined) {
        result = (await ipc.invoke('library:get-hadith-by-id', hadithId)) as HadithBundle | null
      } else if (collectionKey && hadithNumber) {
        const legacy = (await ipc.invoke('library:get-hadith', collectionKey, hadithNumber)) as {
          hadith: HadithRow
          grades: HadithGradeRow[]
        } | null
        if (legacy) {
          const isnad = (await ipc.invoke('library:get-isnad', legacy.hadith.id)) as IsnadEntry[]
          result = { hadith: legacy.hadith, grades: legacy.grades, isnad: isnad ?? [] }
        }
      }

      if (result) {
        setBundle(result)
        // Load companion hadiths via FTS on first 6 words
        const firstWords = result.hadith.english_text.split(' ').slice(0, 6).join(' ')
        if (firstWords.length > 5) {
          try {
            const comps = (await ipc.invoke(
              'library:search-hadiths',
              firstWords,
              null,
              null,
              6,
              0
            )) as CompanionHadith[]
            const currentId = result.hadith.id
            setCompanions((comps ?? []).filter((c) => c.id !== currentId).slice(0, 5))
          } catch {
            // companion search is best-effort
          }
        }
      } else {
        setError('Hadith not found.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load hadith.')
    } finally {
      setLoading(false)
    }
  }, [ipc, hadithId, collectionKey, hadithNumber])

  useEffect(() => {
    void loadHadith()
  }, [loadHadith])

  // Navigation
  // siblingsIds contains DB ids; the route /:collection/:number uses the DB id
  // as the numeric identifier (HadithBrowser resolves it via library:get-hadith-by-id)
  const currentIndex = bundle && siblingsIds ? siblingsIds.indexOf(bundle.hadith.id) : -1
  const prevId = currentIndex > 0 ? siblingsIds![currentIndex - 1] : undefined
  const nextId =
    siblingsIds && currentIndex >= 0 && currentIndex < siblingsIds.length - 1
      ? siblingsIds[currentIndex + 1]
      : undefined

  if (loading) return <Spinner />

  if (error) {
    return (
      <div
        className="rounded-lg border p-6 text-center"
        style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
      >
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  if (!bundle) {
    return (
      <div
        className="rounded-lg border p-8 text-center"
        style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
      >
        <p className="text-base font-medium mb-2">Select a hadith</p>
        <p className="text-sm">
          Browse the collection tree on the left, or use search to find a hadith.
        </p>
      </div>
    )
  }

  const { hadith, grades, isnad } = bundle

  return (
    <article className="flex flex-col gap-6">
      {/* Header */}
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <span
            className="text-xs font-medium rounded px-2 py-0.5 border"
            style={{
              color: 'var(--accent-primary)',
              borderColor: 'currentColor',
              backgroundColor: 'color-mix(in srgb, var(--accent-primary) 10%, transparent)',
            }}
          >
            {hadith.collection_name_english}
          </span>
          <span className="mx-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            Hadith #{hadith.hadith_number}
          </span>
        </div>

        {/* Prev / Next */}
        {siblingsIds && siblingsIds.length > 1 && (
          <div className="flex gap-2">
            <button
              type="button"
              disabled={prevId === undefined}
              className="rounded px-3 py-1 text-xs border transition-opacity disabled:opacity-30"
              style={{
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
              onClick={() =>
                prevId !== undefined && void navigate(`/hadith/${hadith.collection_key}/${prevId}`)
              }
            >
              ← Prev
            </button>
            <button
              type="button"
              disabled={nextId === undefined}
              className="rounded px-3 py-1 text-xs border transition-opacity disabled:opacity-30"
              style={{
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
              onClick={() =>
                nextId !== undefined && void navigate(`/hadith/${hadith.collection_key}/${nextId}`)
              }
            >
              Next →
            </button>
          </div>
        )}
      </header>

      {/* Arabic text */}
      <div
        className="rounded-xl border px-6 py-5"
        style={{
          borderColor: 'var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
        }}
      >
        <p
          dir="rtl"
          className="text-2xl leading-loose text-right"
          style={{
            fontFamily: 'var(--font-arabic, serif)',
            color: 'var(--text-primary)',
          }}
        >
          {hadith.arabic_text}
        </p>
      </div>

      {/* English translation */}
      <div
        className="rounded-xl border px-6 py-4"
        style={{
          borderColor: 'var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
        }}
      >
        <p className="text-base leading-relaxed" style={{ color: 'var(--text-primary)' }}>
          {hadith.english_text}
        </p>
      </div>

      {/* Grades */}
      {grades.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Authenticity Grades
          </h2>
          <div className="flex flex-col gap-2">
            {grades.map((g) => (
              <div
                key={g.id}
                className="flex items-center gap-3 rounded-lg border px-4 py-2"
                style={{
                  borderColor: 'var(--border-subtle)',
                  backgroundColor: 'var(--bg-surface)',
                }}
              >
                <GradeBadge grade={g.grade} verbose />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {g.grader}
                  </span>
                  {g.source && (
                    <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
                      {g.source}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Isnad toggle */}
      <section>
        <button
          type="button"
          className="flex items-center gap-2 text-sm font-semibold mb-3 transition-colors"
          style={{ color: 'var(--text-primary)' }}
          onClick={() => setShowIsnad((v) => !v)}
        >
          <span
            className="text-[10px] transition-transform inline-block"
            style={{ transform: showIsnad ? 'rotate(90deg)' : 'rotate(0)' }}
          >
            ▶
          </span>
          Chain of Narration (Isnad)
          <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>
            {isnad.length} narrator{isnad.length !== 1 ? 's' : ''}
          </span>
        </button>
        {showIsnad && <IsnadViewer narrators={isnad} />}
      </section>

      {/* Companion hadiths */}
      {companions.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Companion Hadiths
          </h2>
          <div className="flex flex-col gap-2">
            {companions.map((c) => (
              <button
                type="button"
                key={c.id}
                className="text-left rounded-lg border px-4 py-3 transition-colors hover:border-[var(--accent-primary)]"
                style={{
                  borderColor: 'var(--border-subtle)',
                  backgroundColor: 'var(--bg-surface)',
                }}
                onClick={() => void navigate(`/hadith/${c.collection_key}/${c.id}`)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium" style={{ color: 'var(--accent-primary)' }}>
                    {c.collection_name_english}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    #{c.hadith_number}
                  </span>
                </div>
                <p
                  className="text-xs"
                  style={{ color: 'var(--text-muted)' }}
                  dangerouslySetInnerHTML={{ __html: c.excerpt }}
                />
              </button>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
