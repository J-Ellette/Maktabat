import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useIpc } from '../../hooks/useIpc'
import CollectionTree from './CollectionTree'
import HadithViewer from './HadithViewer'
import HadithSearch from './HadithSearch'

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

// ─── HadithBrowser ────────────────────────────────────────────────────────────

export default function HadithBrowser(): React.ReactElement {
  const { collection: collectionParam, number: numberParam } = useParams<{
    collection?: string
    number?: string
  }>()
  const navigate = useNavigate()
  const ipc = useIpc()

  // numberParam can be a numeric DB id or a hadith number string
  const hadithIdFromParam = numberParam !== undefined ? parseInt(numberParam, 10) : undefined
  const hadithIdIsValid = hadithIdFromParam !== undefined && !Number.isNaN(hadithIdFromParam)

  const [showSearch, setShowSearch] = useState(false)
  const [selectedCollectionKey, setSelectedCollectionKey] = useState<string | undefined>(
    collectionParam
  )
  const [selectedBookId, setSelectedBookId] = useState<number | undefined>()
  const [selectedChapterId, setSelectedChapterId] = useState<number | undefined>()
  const [bookHadiths, setBookHadiths] = useState<HadithRow[]>([])
  const [activeHadithId, setActiveHadithId] = useState<number | undefined>(
    hadithIdIsValid ? hadithIdFromParam : undefined
  )

  // Sync params → state on URL changes
  useEffect(() => {
    if (collectionParam) setSelectedCollectionKey(collectionParam)
    if (hadithIdIsValid && hadithIdFromParam !== activeHadithId) {
      setActiveHadithId(hadithIdFromParam)
    }
  }, [collectionParam, hadithIdIsValid, hadithIdFromParam, activeHadithId])

  // Load hadiths list when a book is selected (for prev/next siblings)
  useEffect(() => {
    if (!ipc || selectedBookId === undefined) {
      setBookHadiths([])
      return
    }
    async function load() {
      try {
        const rows =
          selectedChapterId !== undefined
            ? ((await ipc!.invoke(
                'library:get-hadiths-by-chapter',
                selectedChapterId
              )) as HadithRow[])
            : ((await ipc!.invoke('library:get-hadiths-by-book', selectedBookId)) as HadithRow[])
        setBookHadiths(rows ?? [])
        // Auto-select first hadith if none selected
        if (!activeHadithId && rows && rows.length > 0) {
          setActiveHadithId(rows[0].id)
          void navigate(`/hadith/${rows[0].collection_key}/${rows[0].id}`)
        }
      } catch {
        setBookHadiths([])
      }
    }
    void load()
  }, [ipc, selectedBookId, selectedChapterId, activeHadithId, navigate])

  const siblingsIds = bookHadiths.map((h) => h.id)

  function handleSelectBook(bookId: number, colKey: string) {
    setSelectedBookId(bookId)
    setSelectedChapterId(undefined)
    setSelectedCollectionKey(colKey)
    setBookHadiths([])
  }

  function handleSelectChapter(chapterId: number, bookId: number, colKey: string) {
    setSelectedChapterId(chapterId)
    setSelectedBookId(bookId)
    setSelectedCollectionKey(colKey)
    setBookHadiths([])
  }

  function handleSelectCollection(key: string) {
    setSelectedCollectionKey(key)
    setSelectedBookId(undefined)
    setSelectedChapterId(undefined)
    setBookHadiths([])
    setActiveHadithId(undefined)
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      {/* ── Toolbar ── */}
      <div
        className="flex items-center gap-3 px-4 py-2 border-b flex-shrink-0"
        style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}
      >
        <Link
          to="/"
          className="text-xs hover:underline flex-shrink-0"
          style={{ color: 'var(--text-muted)' }}
        >
          ← Home
        </Link>

        <div
          className="h-4 w-px flex-shrink-0"
          style={{ backgroundColor: 'var(--border-subtle)' }}
        />

        <h1
          className="text-sm font-semibold flex-shrink-0"
          style={{ color: 'var(--text-primary)' }}
        >
          Hadith
        </h1>

        {selectedCollectionKey && (
          <>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              /
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {selectedCollectionKey}
            </span>
          </>
        )}

        <div className="flex-1" />

        {/* Search toggle */}
        <button
          type="button"
          className="rounded-lg px-3 py-1.5 text-xs border transition-colors flex items-center gap-1.5"
          style={{
            borderColor: showSearch ? 'var(--accent-primary)' : 'var(--border-subtle)',
            color: showSearch ? 'var(--accent-primary)' : 'var(--text-muted)',
            backgroundColor: showSearch
              ? 'color-mix(in srgb, var(--accent-primary) 10%, transparent)'
              : 'transparent',
          }}
          onClick={() => setShowSearch((v) => !v)}
        >
          🔍 Search
        </button>
      </div>

      {/* ── Main layout ── */}
      {showSearch ? (
        /* Full-width search panel */
        <div className="flex-1 overflow-y-auto p-4">
          <HadithSearch />
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* ── Left: Collection tree ── */}
          <div
            className="w-[280px] flex-shrink-0 overflow-y-auto border-r py-2"
            style={{
              borderColor: 'var(--border-subtle)',
              backgroundColor: 'var(--bg-surface)',
            }}
          >
            <CollectionTree
              selectedCollectionKey={selectedCollectionKey}
              selectedBookId={selectedBookId}
              selectedChapterId={selectedChapterId}
              onSelectCollection={handleSelectCollection}
              onSelectBook={handleSelectBook}
              onSelectChapter={handleSelectChapter}
            />
          </div>

          {/* ── Right: Hadith list + viewer ── */}
          <div className="flex flex-1 overflow-hidden">
            {/* Hadith list for selected book/chapter */}
            {bookHadiths.length > 0 && (
              <div
                className="w-[220px] flex-shrink-0 overflow-y-auto border-r py-2"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                {bookHadiths.map((h) => (
                  <button
                    type="button"
                    key={h.id}
                    className="w-full text-left px-3 py-2 rounded transition-colors"
                    style={{
                      backgroundColor:
                        activeHadithId === h.id
                          ? 'color-mix(in srgb, var(--accent-primary) 12%, transparent)'
                          : 'transparent',
                    }}
                    onClick={() => {
                      setActiveHadithId(h.id)
                      void navigate(`/hadith/${h.collection_key}/${h.id}`)
                    }}
                  >
                    <span className="text-xs font-mono" style={{ color: 'var(--accent-primary)' }}>
                      #{h.hadith_number}
                    </span>
                    <p
                      dir="rtl"
                      className="text-xs mt-0.5 line-clamp-2 text-right"
                      style={{
                        fontFamily: 'var(--font-arabic, serif)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {h.arabic_text.substring(0, 80)}…
                    </p>
                  </button>
                ))}
              </div>
            )}

            {/* Viewer */}
            <div className="flex-1 overflow-y-auto p-5">
              {activeHadithId !== undefined ? (
                <HadithViewer
                  hadithId={activeHadithId}
                  siblingsIds={siblingsIds.length > 1 ? siblingsIds : undefined}
                />
              ) : hadithIdIsValid && collectionParam ? (
                <HadithViewer collectionKey={collectionParam} hadithNumber={numberParam} />
              ) : (
                <div
                  className="flex flex-col items-center justify-center h-full gap-4 text-center"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <div className="text-4xl">📖</div>
                  <div>
                    <p
                      className="text-base font-medium mb-1"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Hadith Library
                    </p>
                    <p className="text-sm">
                      Select a collection, book, or chapter from the tree on the left.
                    </p>
                    <p className="text-sm">
                      Or use{' '}
                      <button
                        type="button"
                        className="underline"
                        style={{ color: 'var(--accent-primary)' }}
                        onClick={() => setShowSearch(true)}
                      >
                        search
                      </button>{' '}
                      to find a specific hadith.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
