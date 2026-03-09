import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIpc } from '../../hooks/useIpc'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Collection {
  id: number
  key: string
  name_arabic: string
  name_english: string
  tradition: string
  tier: string
  compiler: string
  century: number
}

interface Book {
  id: number
  collection_id: number
  book_number: number
  name_arabic: string
  name_english: string
}

interface Chapter {
  id: number
  book_id: number
  chapter_number: number
  name_arabic: string
  name_english: string
}

// ─── Badge helpers ────────────────────────────────────────────────────────────

function TraditionBadge({ tradition }: { tradition: string }): React.ReactElement {
  const map: Record<string, { label: string; color: string }> = {
    sunni: { label: 'Sunni', color: 'var(--ae-green-600, #16a34a)' },
    shia: { label: "Shi'a", color: 'var(--tech-blue-600, #2563eb)' },
    ibadi: { label: 'Ibadi', color: 'var(--desert-orange-600, #d97706)' },
  }
  const meta = map[tradition.toLowerCase()] ?? { label: tradition, color: 'var(--text-muted)' }
  return (
    <span
      className="rounded px-1.5 py-0.5 text-[10px] font-semibold border"
      style={{
        color: meta.color,
        borderColor: 'currentColor',
        backgroundColor: 'color-mix(in srgb, currentColor 10%, transparent)',
      }}
    >
      {meta.label}
    </span>
  )
}

function TierBadge({ tier }: { tier: string }): React.ReactElement {
  const isPrimary = tier === 'primary'
  return (
    <span
      className="rounded px-1.5 py-0.5 text-[10px] font-medium border"
      style={{
        color: isPrimary ? 'var(--ae-gold-500, #eab308)' : 'var(--text-muted, #6b7280)',
        borderColor: 'currentColor',
        backgroundColor: 'color-mix(in srgb, currentColor 10%, transparent)',
      }}
    >
      {isPrimary ? 'Primary' : 'Secondary'}
    </span>
  )
}

// ─── CollectionTree ───────────────────────────────────────────────────────────

interface CollectionTreeProps {
  selectedCollectionKey?: string
  selectedBookId?: number
  selectedChapterId?: number
  onSelectCollection: (key: string) => void
  onSelectBook: (bookId: number, collectionKey: string) => void
  onSelectChapter: (chapterId: number, bookId: number, collectionKey: string) => void
}

export default function CollectionTree({
  selectedCollectionKey,
  selectedBookId,
  selectedChapterId,
  onSelectCollection,
  onSelectBook,
  onSelectChapter,
}: CollectionTreeProps): React.ReactElement {
  const ipc = useIpc()
  const navigate = useNavigate()

  const [collections, setCollections] = useState<Collection[]>([])
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set())
  const [books, setBooks] = useState<Record<string, Book[]>>({})
  const [expandedBooks, setExpandedBooks] = useState<Set<number>>(new Set())
  const [chapters, setChapters] = useState<Record<number, Chapter[]>>({})
  const [loading, setLoading] = useState(true)

  // Load all collections once
  useEffect(() => {
    if (!ipc) return
    async function load() {
      setLoading(true)
      try {
        const cols = (await ipc!.invoke('library:get-hadith-collections')) as Collection[]
        setCollections(cols ?? [])
      } catch {
        setCollections([])
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [ipc])

  // Auto-expand the selected collection's tree
  useEffect(() => {
    if (selectedCollectionKey) {
      setExpandedCollections((prev) => new Set([...prev, selectedCollectionKey]))
    }
  }, [selectedCollectionKey])

  async function toggleCollection(key: string) {
    const isExpanded = expandedCollections.has(key)
    if (isExpanded) {
      setExpandedCollections((prev) => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
    } else {
      setExpandedCollections((prev) => new Set([...prev, key]))
      if (!books[key] && ipc) {
        try {
          const bks = (await ipc.invoke('library:get-hadith-books', key)) as Book[]
          setBooks((prev) => ({ ...prev, [key]: bks ?? [] }))
        } catch {
          setBooks((prev) => ({ ...prev, [key]: [] }))
        }
      }
    }
  }

  async function toggleBook(bookId: number) {
    const isExpanded = expandedBooks.has(bookId)
    if (isExpanded) {
      setExpandedBooks((prev) => {
        const next = new Set(prev)
        next.delete(bookId)
        return next
      })
    } else {
      setExpandedBooks((prev) => new Set([...prev, bookId]))
      if (!chapters[bookId] && ipc) {
        try {
          const chs = (await ipc.invoke('library:get-hadith-chapters', bookId)) as Chapter[]
          setChapters((prev) => ({ ...prev, [bookId]: chs ?? [] }))
        } catch {
          setChapters((prev) => ({ ...prev, [bookId]: [] }))
        }
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div
          className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--accent-primary)' }}
        />
      </div>
    )
  }

  if (collections.length === 0) {
    return (
      <div className="px-4 py-6 text-center" style={{ color: 'var(--text-muted)' }}>
        <p className="text-sm">No hadith collections installed.</p>
      </div>
    )
  }

  return (
    <div className="select-none">
      {collections.map((col) => {
        const isColExpanded = expandedCollections.has(col.key)
        const isColSelected = selectedCollectionKey === col.key
        const colBooks = books[col.key] ?? []

        return (
          <div key={col.key}>
            {/* Collection row */}
            <button
              type="button"
              className="w-full text-left px-3 py-2 flex items-start gap-2 rounded-md transition-colors"
              style={{
                backgroundColor: isColSelected
                  ? 'color-mix(in srgb, var(--accent-primary) 15%, transparent)'
                  : undefined,
              }}
              onClick={() => {
                void toggleCollection(col.key)
                onSelectCollection(col.key)
                void navigate(`/hadith/${col.key}`)
              }}
            >
              <span
                className="mt-0.5 text-[10px] w-3 flex-shrink-0 transition-transform"
                style={{
                  color: 'var(--text-muted)',
                  transform: isColExpanded ? 'rotate(90deg)' : 'rotate(0)',
                  display: 'inline-block',
                }}
              >
                ▶
              </span>
              <div className="flex-1 min-w-0">
                <div
                  className="text-sm font-semibold truncate"
                  dir="rtl"
                  style={{
                    fontFamily: 'var(--font-arabic, serif)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {col.name_arabic}
                </div>
                <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                  {col.name_english}
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  <TraditionBadge tradition={col.tradition} />
                  <TierBadge tier={col.tier} />
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {col.century}th c.
                  </span>
                </div>
                {isColExpanded && (
                  <div
                    className="text-[10px] mt-0.5 truncate"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {col.compiler}
                  </div>
                )}
              </div>
            </button>

            {/* Books */}
            {isColExpanded && (
              <div className="ml-4 border-l" style={{ borderColor: 'var(--border-subtle)' }}>
                {colBooks.length === 0 && (
                  <p className="px-3 py-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                    No books found
                  </p>
                )}
                {colBooks.map((book) => {
                  const isBookExpanded = expandedBooks.has(book.id)
                  const isBookSelected = selectedBookId === book.id
                  const bookChapters = chapters[book.id] ?? []

                  return (
                    <div key={book.id}>
                      <button
                        type="button"
                        className="w-full text-left px-3 py-1.5 flex items-start gap-1.5 rounded transition-colors"
                        style={{
                          backgroundColor: isBookSelected
                            ? 'color-mix(in srgb, var(--accent-primary) 10%, transparent)'
                            : undefined,
                        }}
                        onClick={() => {
                          void toggleBook(book.id)
                          onSelectBook(book.id, col.key)
                        }}
                      >
                        <span
                          className="mt-0.5 text-[9px] w-3 flex-shrink-0 transition-transform"
                          style={{
                            color: 'var(--text-muted)',
                            transform: isBookExpanded ? 'rotate(90deg)' : 'rotate(0)',
                            display: 'inline-block',
                          }}
                        >
                          ▶
                        </span>
                        <div className="flex-1 min-w-0">
                          <div
                            className="text-xs truncate"
                            dir="rtl"
                            style={{
                              fontFamily: 'var(--font-arabic, serif)',
                              color: 'var(--text-primary)',
                            }}
                          >
                            {book.name_arabic}
                          </div>
                          <div
                            className="text-[11px] truncate"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {book.name_english}
                          </div>
                        </div>
                      </button>

                      {/* Chapters */}
                      {isBookExpanded && (
                        <div
                          className="ml-4 border-l"
                          style={{ borderColor: 'var(--border-subtle)' }}
                        >
                          {bookChapters.length === 0 && (
                            <button
                              type="button"
                              className="w-full text-left px-3 py-1 text-xs"
                              style={{ color: 'var(--text-muted)' }}
                              onClick={() => onSelectBook(book.id, col.key)}
                            >
                              View hadiths →
                            </button>
                          )}
                          {bookChapters.map((ch) => {
                            const isChSelected = selectedChapterId === ch.id
                            return (
                              <button
                                type="button"
                                key={ch.id}
                                className="w-full text-left px-3 py-1 rounded transition-colors"
                                style={{
                                  backgroundColor: isChSelected
                                    ? 'color-mix(in srgb, var(--accent-primary) 8%, transparent)'
                                    : undefined,
                                }}
                                onClick={() => onSelectChapter(ch.id, book.id, col.key)}
                              >
                                <div
                                  className="text-[11px] truncate"
                                  dir="rtl"
                                  style={{
                                    fontFamily: 'var(--font-arabic, serif)',
                                    color: 'var(--text-primary)',
                                  }}
                                >
                                  {ch.name_arabic}
                                </div>
                                <div
                                  className="text-[10px] truncate"
                                  style={{ color: 'var(--text-muted)' }}
                                >
                                  {ch.name_english}
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
