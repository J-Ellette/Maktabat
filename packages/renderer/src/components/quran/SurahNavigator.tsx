import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useIpc } from '../../hooks/useIpc'

export interface SurahInfo {
  id: number
  number: number
  arabic_name: string
  transliterated_name: string
  english_name: string
  revelation_type: 'meccan' | 'medinan'
  verse_count: number
}

// Hizb start data (60 hizbs × 4 rub' = 240 sections; each row is the start of a hizb)
// Source: Standard Madinah Mushaf (King Fahd Complex) hizb divisions
const HIZB_DATA: Array<{ hizb: number; juz: number; surah: number; ayah: number }> = [
  { hizb: 1, juz: 1, surah: 1, ayah: 1 },
  { hizb: 2, juz: 1, surah: 2, ayah: 26 },
  { hizb: 3, juz: 2, surah: 2, ayah: 50 },
  { hizb: 4, juz: 2, surah: 2, ayah: 77 },
  { hizb: 5, juz: 3, surah: 2, ayah: 142 },
  { hizb: 6, juz: 3, surah: 2, ayah: 177 },
  { hizb: 7, juz: 4, surah: 2, ayah: 203 },
  { hizb: 8, juz: 4, surah: 2, ayah: 232 },
  { hizb: 9, juz: 5, surah: 2, ayah: 253 },
  { hizb: 10, juz: 5, surah: 3, ayah: 14 },
  { hizb: 11, juz: 6, surah: 3, ayah: 92 },
  { hizb: 12, juz: 6, surah: 3, ayah: 152 },
  { hizb: 13, juz: 7, surah: 4, ayah: 1 },
  { hizb: 14, juz: 7, surah: 4, ayah: 24 },
  { hizb: 15, juz: 8, surah: 4, ayah: 57 },
  { hizb: 16, juz: 8, surah: 4, ayah: 88 },
  { hizb: 17, juz: 9, surah: 4, ayah: 148 },
  { hizb: 18, juz: 9, surah: 5, ayah: 3 },
  { hizb: 19, juz: 10, surah: 5, ayah: 52 },
  { hizb: 20, juz: 10, surah: 5, ayah: 82 },
  { hizb: 21, juz: 11, surah: 6, ayah: 20 },
  { hizb: 22, juz: 11, surah: 6, ayah: 111 },
  { hizb: 23, juz: 12, surah: 6, ayah: 151 },
  { hizb: 24, juz: 12, surah: 7, ayah: 38 },
  { hizb: 25, juz: 13, surah: 7, ayah: 87 },
  { hizb: 26, juz: 13, surah: 7, ayah: 170 },
  { hizb: 27, juz: 14, surah: 8, ayah: 41 },
  { hizb: 28, juz: 14, surah: 9, ayah: 33 },
  { hizb: 29, juz: 15, surah: 9, ayah: 93 },
  { hizb: 30, juz: 15, surah: 10, ayah: 26 },
  { hizb: 31, juz: 16, surah: 11, ayah: 6 },
  { hizb: 32, juz: 16, surah: 11, ayah: 84 },
  { hizb: 33, juz: 17, surah: 12, ayah: 53 },
  { hizb: 34, juz: 17, surah: 13, ayah: 18 },
  { hizb: 35, juz: 18, surah: 15, ayah: 1 },
  { hizb: 36, juz: 18, surah: 16, ayah: 51 },
  { hizb: 37, juz: 19, surah: 17, ayah: 1 },
  { hizb: 38, juz: 19, surah: 18, ayah: 16 },
  { hizb: 39, juz: 20, surah: 19, ayah: 1 },
  { hizb: 40, juz: 20, surah: 20, ayah: 82 },
  { hizb: 41, juz: 21, surah: 21, ayah: 51 },
  { hizb: 42, juz: 21, surah: 22, ayah: 19 },
  { hizb: 43, juz: 22, surah: 23, ayah: 75 },
  { hizb: 44, juz: 22, surah: 25, ayah: 21 },
  { hizb: 45, juz: 23, surah: 27, ayah: 1 },
  { hizb: 46, juz: 23, surah: 27, ayah: 56 },
  { hizb: 47, juz: 24, surah: 29, ayah: 46 },
  { hizb: 48, juz: 24, surah: 31, ayah: 22 },
  { hizb: 49, juz: 25, surah: 33, ayah: 31 },
  { hizb: 50, juz: 25, surah: 34, ayah: 24 },
  { hizb: 51, juz: 26, surah: 36, ayah: 28 },
  { hizb: 52, juz: 26, surah: 38, ayah: 1 },
  { hizb: 53, juz: 27, surah: 39, ayah: 32 },
  { hizb: 54, juz: 27, surah: 41, ayah: 47 },
  { hizb: 55, juz: 28, surah: 44, ayah: 1 },
  { hizb: 56, juz: 28, surah: 46, ayah: 1 },
  { hizb: 57, juz: 29, surah: 51, ayah: 31 },
  { hizb: 58, juz: 29, surah: 57, ayah: 1 },
  { hizb: 59, juz: 30, surah: 67, ayah: 1 },
  { hizb: 60, juz: 30, surah: 78, ayah: 1 },
]

// Juz' start data (which surah:ayah each juz' begins at)
const JUZ_DATA: Array<{ juz: number; surah: number; ayah: number; label: string }> = [
  { juz: 1, surah: 1, ayah: 1, label: "Juz' 1 — Al-Fatiha 1:1" },
  { juz: 2, surah: 2, ayah: 142, label: "Juz' 2 — Al-Baqarah 2:142" },
  { juz: 3, surah: 2, ayah: 253, label: "Juz' 3 — Al-Baqarah 2:253" },
  { juz: 4, surah: 3, ayah: 92, label: "Juz' 4 — Ali 'Imran 3:92" },
  { juz: 5, surah: 4, ayah: 24, label: "Juz' 5 — An-Nisa 4:24" },
  { juz: 6, surah: 4, ayah: 148, label: "Juz' 6 — An-Nisa 4:148" },
  { juz: 7, surah: 5, ayah: 82, label: "Juz' 7 — Al-Ma'idah 5:82" },
  { juz: 8, surah: 6, ayah: 111, label: "Juz' 8 — Al-An'am 6:111" },
  { juz: 9, surah: 7, ayah: 87, label: "Juz' 9 — Al-A'raf 7:87" },
  { juz: 10, surah: 8, ayah: 41, label: "Juz' 10 — Al-Anfal 8:41" },
  { juz: 11, surah: 9, ayah: 93, label: "Juz' 11 — At-Tawbah 9:93" },
  { juz: 12, surah: 11, ayah: 6, label: "Juz' 12 — Hud 11:6" },
  { juz: 13, surah: 12, ayah: 53, label: "Juz' 13 — Yusuf 12:53" },
  { juz: 14, surah: 15, ayah: 1, label: "Juz' 14 — Al-Hijr 15:1" },
  { juz: 15, surah: 17, ayah: 1, label: "Juz' 15 — Al-Isra 17:1" },
  { juz: 16, surah: 18, ayah: 75, label: "Juz' 16 — Al-Kahf 18:75" },
  { juz: 17, surah: 21, ayah: 1, label: "Juz' 17 — Al-Anbiya 21:1" },
  { juz: 18, surah: 23, ayah: 1, label: "Juz' 18 — Al-Mu'minun 23:1" },
  { juz: 19, surah: 25, ayah: 21, label: "Juz' 19 — Al-Furqan 25:21" },
  { juz: 20, surah: 27, ayah: 56, label: "Juz' 20 — An-Naml 27:56" },
  { juz: 21, surah: 29, ayah: 46, label: "Juz' 21 — Al-Ankabut 29:46" },
  { juz: 22, surah: 33, ayah: 31, label: "Juz' 22 — Al-Ahzab 33:31" },
  { juz: 23, surah: 36, ayah: 28, label: "Juz' 23 — Ya-Sin 36:28" },
  { juz: 24, surah: 39, ayah: 32, label: "Juz' 24 — Az-Zumar 39:32" },
  { juz: 25, surah: 41, ayah: 47, label: "Juz' 25 — Fussilat 41:47" },
  { juz: 26, surah: 46, ayah: 1, label: "Juz' 26 — Al-Ahqaf 46:1" },
  { juz: 27, surah: 51, ayah: 31, label: "Juz' 27 — Adh-Dhariyat 51:31" },
  { juz: 28, surah: 58, ayah: 1, label: "Juz' 28 — Al-Mujadila 58:1" },
  { juz: 29, surah: 67, ayah: 1, label: "Juz' 29 — Al-Mulk 67:1" },
  { juz: 30, surah: 78, ayah: 1, label: "Juz' 30 — An-Naba 78:1" },
]

type FilterType = 'all' | 'meccan' | 'medinan'
type NavTab = 'surahs' | 'juz' | 'hizb'

interface SurahCardProps {
  surah: SurahInfo
  isActive: boolean
  onClick: () => void
}

function SurahCard({ surah, isActive, onClick }: SurahCardProps): React.ReactElement {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors
        ${
          isActive
            ? 'bg-[var(--ae-gold-100)] border border-[var(--ae-gold-400)]'
            : 'hover:bg-[var(--bg-secondary)] border border-transparent'
        }
      `}
    >
      {/* Surah number badge */}
      <div
        className={`
          flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold
          ${
            isActive
              ? 'bg-[var(--ae-gold-500)] text-white'
              : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
          }
        `}
      >
        {surah.number}
      </div>

      {/* Names */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className="text-sm font-medium text-[var(--text-primary)] truncate">
            {surah.transliterated_name}
          </span>
          <span
            dir="rtl"
            className="text-base font-arabic-display text-[var(--ae-gold-600)] flex-shrink-0"
            style={{ fontFamily: "'Amiri', serif" }}
          >
            {surah.arabic_name}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-[var(--text-secondary)]">{surah.english_name}</span>
          <span className="text-xs text-[var(--text-secondary)]">·</span>
          <span
            className={`text-xs ${surah.revelation_type === 'meccan' ? 'text-[var(--ae-green-600)]' : 'text-[var(--tech-blue-500)]'}`}
          >
            {surah.revelation_type === 'meccan' ? 'Meccan' : 'Medinan'}
          </span>
          <span className="text-xs text-[var(--text-secondary)]">·</span>
          <span className="text-xs text-[var(--text-secondary)]">{surah.verse_count} verses</span>
        </div>
      </div>
    </button>
  )
}

interface SurahNavigatorProps {
  /** Currently active surah number, if any */
  activeSurahNumber?: number
  /** Called when user selects a surah */
  onSelectSurah?: (surahNumber: number) => void
}

/**
 * Full Surah Navigator panel: browse all 114 surahs, filter by
 * Meccan/Medinan, search, and jump by Juz' or Hizb.
 */
export default function SurahNavigator({
  activeSurahNumber,
  onSelectSurah,
}: SurahNavigatorProps): React.ReactElement {
  const navigate = useNavigate()
  const ipc = useIpc()

  const [surahs, setSurahs] = useState<SurahInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [navTab, setNavTab] = useState<NavTab>('surahs')

  // Ref for the scrollable content container (needed by useVirtualizer)
  const scrollParentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadSurahs() {
      setLoading(true)
      setError(null)
      try {
        if (ipc) {
          const data = await ipc.invoke('library:get-surahs')
          setSurahs(data as SurahInfo[])
        } else {
          // No Electron bridge — show placeholder data in browser dev mode
          setSurahs([])
          setError('Library not available (running outside Electron)')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load surahs')
      } finally {
        setLoading(false)
      }
    }
    void loadSurahs()
  }, [ipc])

  const filteredSurahs = useMemo(() => {
    return surahs.filter((s) => {
      const matchesFilter =
        filter === 'all' ||
        (filter === 'meccan' && s.revelation_type === 'meccan') ||
        (filter === 'medinan' && s.revelation_type === 'medinan')

      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        s.transliterated_name.toLowerCase().includes(q) ||
        s.english_name.toLowerCase().includes(q) ||
        s.arabic_name.includes(q) ||
        String(s.number).includes(q)

      return matchesFilter && matchesSearch
    })
  }, [surahs, filter, search])

  const surahVirtualizer = useVirtualizer({
    count: filteredSurahs.length,
    getScrollElement: () => scrollParentRef.current,
    estimateSize: () => 72, // estimated height per SurahCard (px)
    overscan: 5,
  })

  function handleSelectSurah(surahNumber: number) {
    if (onSelectSurah) {
      onSelectSurah(surahNumber)
    } else {
      void navigate(`/quran/${surahNumber}`)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-[var(--border-color)]">
        <h2
          className="text-lg font-semibold text-[var(--text-primary)] mb-3"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Quran Navigator
        </h2>

        {/* Search */}
        <div className="relative mb-3">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="7" cy="7" r="4" />
            <path d="M10.5 10.5L14 14" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search surah name or number…"
            className="
              w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-[var(--border-color)]
              bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]
              focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]
            "
          />
        </div>

        {/* Filter chips */}
        <div className="flex gap-1.5">
          {(['all', 'meccan', 'medinan'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                px-2.5 py-1 rounded-full text-xs capitalize transition-colors
                ${
                  filter === f
                    ? 'bg-[var(--accent-primary)] text-white'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--border-color)]'
                }
              `}
            >
              {f === 'all' ? 'All' : f === 'meccan' ? 'Meccan' : 'Medinan'}
            </button>
          ))}
        </div>
      </div>

      {/* Tab navigation: Surahs | Juz' | Hizb */}
      <div className="flex border-b border-[var(--border-color)]">
        {(['surahs', 'juz', 'hizb'] as NavTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setNavTab(tab)}
            className={`
              flex-1 py-2 text-sm font-medium transition-colors capitalize
              ${
                navTab === tab
                  ? 'text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }
            `}
          >
            {tab === 'surahs' ? 'Surahs' : tab === 'juz' ? "Juz'" : 'Hizb'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto" ref={scrollParentRef}>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-4 text-sm text-[var(--ae-red-500)]">{error}</div>
        ) : navTab === 'surahs' ? (
          /* Virtualized surah list */
          filteredSurahs.length === 0 ? (
            <p className="p-4 text-sm text-[var(--text-secondary)] text-center">
              No surahs match your search.
            </p>
          ) : (
            <div
              className="p-2 relative"
              style={{ height: `${surahVirtualizer.getTotalSize()}px` }}
            >
              {surahVirtualizer.getVirtualItems().map((virtualItem) => {
                const surah = filteredSurahs[virtualItem.index]
                return (
                  <div
                    key={virtualItem.key}
                    data-index={virtualItem.index}
                    ref={surahVirtualizer.measureElement}
                    className="absolute top-0 left-0 w-full py-0.5"
                    style={{ transform: `translateY(${virtualItem.start}px)` }}
                  >
                    <SurahCard
                      surah={surah}
                      isActive={activeSurahNumber === surah.number}
                      onClick={() => handleSelectSurah(surah.number)}
                    />
                  </div>
                )
              })}
            </div>
          )
        ) : navTab === 'juz' ? (
          /* Juz' list (30 items — no virtualization needed) */
          <div className="p-2 space-y-1">
            {JUZ_DATA.map((juz) => (
              <button
                key={juz.juz}
                onClick={() => handleSelectSurah(juz.surah)}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[var(--ae-black-100)] flex items-center justify-center text-sm font-semibold text-[var(--ae-black-700)]">
                  {juz.juz}
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    Juz&apos; {juz.juz}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Starting: Surah {juz.surah}, Ayah {juz.ayah}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* Hizb list (60 hizbs — each hizb comprises 4 rub') */
          <div className="p-2 space-y-1">
            {HIZB_DATA.map((hizb) => {
              const hizbInJuz = hizb.hizb % 2 === 0 ? 2 : 1
              return (
                <button
                  key={hizb.hizb}
                  onClick={() => void navigate(`/quran/${hizb.surah}/${hizb.ayah}`)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  {/* Hizb number badge */}
                  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[var(--ae-gold-100)] flex items-center justify-center text-sm font-semibold text-[var(--ae-gold-700)]">
                    {hizb.hizb}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        Hizb {hizb.hizb}
                      </p>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
                        Juz&apos; {hizb.juz}, Hizb {hizbInJuz}/2
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      Surah {hizb.surah}, Ayah {hizb.ayah}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Stats footer */}
      {navTab === 'surahs' && !loading && !error && (
        <div className="px-4 py-2 border-t border-[var(--border-color)] text-xs text-[var(--text-secondary)]">
          {filteredSurahs.length} of {surahs.length} surahs
          {surahs.length === 0 && (
            <span className="ml-1 text-[var(--ae-gold-600)]">
              — Add library database to see content
            </span>
          )}
        </div>
      )}
    </div>
  )
}
