import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useIpc } from '../../hooks/useIpc'
import ArabicVerse from './ArabicVerse'
import TranslationView, {
  TranslationSelector,
  type Translation,
  type TranslationMode,
} from './TranslationView'
import SurahNavigator from './SurahNavigator'
import { TAJWEED_RULES, TAJWEED_RULE_NAMES, TAJWEED_COLORS } from './TajweedColors'
import type { WordMorphology } from './WordPopover'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AyahRow {
  id: number
  surah_id: number
  ayah_number: number
  arabic_text: string
  arabic_simple: string
  bismillah_pre: number
  surah_number?: number
  surah_arabic_name?: string
  surah_english_name?: string
}

interface MorphologyRow {
  id: number
  ayah_id: number
  word_position: number
  surface_form: string
  root_letters?: string | null
  root_meaning_english?: string | null
  pattern?: string | null
  pos: string
  case_marker?: string | null
}

interface TranslationRow {
  id: number
  ayah_id: number
  translation_key: string
  text: string
  translator: string
  language: string
}

interface AyahBundle {
  ayah: AyahRow
  translations: TranslationRow[]
  morphology: MorphologyRow[]
}

interface SurahMeta {
  id: number
  number: number
  arabic_name: string
  transliterated_name: string
  english_name: string
  revelation_type: 'meccan' | 'medinan'
  verse_count: number
}

type ViewMode = 'verse-by-verse' | 'continuous' | 'page'

// ─── View mode button ─────────────────────────────────────────────────────────

function ViewModeButton({
  active,
  onClick,
  icon,
  title,
}: {
  active: boolean
  onClick: () => void
  icon: string
  title: string
}): React.ReactElement {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className={`
        px-2 py-1 text-xs rounded transition-colors
        ${
          active
            ? 'bg-[var(--accent-primary)] text-white'
            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
        }
      `}
    >
      {icon}
    </button>
  )
}

// ─── Surah header ─────────────────────────────────────────────────────────────

function SurahHeader({ meta }: { meta: SurahMeta }): React.ReactElement {
  return (
    <div className="text-center py-8 border-b border-[var(--border-color)] mb-6">
      {/* Arabic name */}
      <h1
        dir="rtl"
        className="text-4xl font-arabic-display text-[var(--ae-gold-600)] mb-2"
        style={{ fontFamily: "'Amiri', serif" }}
      >
        سورة {meta.arabic_name}
      </h1>
      {/* English info */}
      <p
        className="text-lg text-[var(--text-primary)]"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        {meta.transliterated_name} — {meta.english_name}
      </p>
      <p className="text-sm text-[var(--text-secondary)] mt-1">
        {meta.revelation_type === 'meccan' ? 'Meccan' : 'Medinan'} · {meta.verse_count} verses ·
        Surah {meta.number}
      </p>
      {/* Ornamental divider */}
      <div className="flex items-center justify-center gap-3 mt-4">
        <div className="h-px w-16 bg-[var(--ae-gold-300)]" />
        <span className="text-[var(--ae-gold-400)] text-xl">❁</span>
        <div className="h-px w-16 bg-[var(--ae-gold-300)]" />
      </div>
    </div>
  )
}

// ─── Tajweed legend panel ─────────────────────────────────────────────────────

function TajweedLegend(): React.ReactElement {
  return (
    <div className="p-4 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-sm">
      <h3 className="font-semibold text-[var(--text-primary)] mb-3">Tajweed Color Guide</h3>
      <div className="space-y-2">
        {TAJWEED_RULES.map((rule) => {
          const info = TAJWEED_RULE_NAMES[rule]
          return (
            <div key={rule} className="flex items-start gap-2">
              <div
                className="flex-shrink-0 w-3 h-3 rounded-full mt-0.5"
                style={{ backgroundColor: TAJWEED_COLORS[rule] }}
              />
              <div>
                <span className="font-medium text-[var(--text-primary)]">
                  {info.arabic} — {info.english}
                </span>
                <p className="text-xs text-[var(--text-secondary)]">{info.description}</p>
              </div>
            </div>
          )
        })}
      </div>
      <p className="mt-3 text-xs text-[var(--text-secondary)] italic">
        Full tajweed coloring requires pre-loaded morphological tajweed data.
      </p>
    </div>
  )
}

// ─── Reading toolbar ──────────────────────────────────────────────────────────

interface ReaderToolbarProps {
  surahMeta: SurahMeta | null
  viewMode: ViewMode
  onViewModeChange: (m: ViewMode) => void
  translationMode: TranslationMode
  onTranslationModeChange: (m: TranslationMode) => void
  tajweedEnabled: boolean
  onTajweedToggle: () => void
  showTranslation: boolean
  onShowTranslationToggle: () => void
  showSurahNav: boolean
  onShowSurahNavToggle: () => void
  prevSurah: number | null
  nextSurah: number | null
  onNavigateSurah: (n: number) => void
}

function ReaderToolbar({
  surahMeta,
  viewMode,
  onViewModeChange,
  translationMode,
  onTranslationModeChange,
  tajweedEnabled,
  onTajweedToggle,
  showTranslation,
  onShowTranslationToggle,
  showSurahNav,
  onShowSurahNavToggle,
  prevSurah,
  nextSurah,
  onNavigateSurah,
}: ReaderToolbarProps): React.ReactElement {
  const [showTajweedLegend, setShowTajweedLegend] = useState(false)

  return (
    <div className="sticky top-0 z-30 bg-[var(--bg-primary)] border-b border-[var(--border-color)] px-4 py-2">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Surah nav toggle */}
        <button
          onClick={onShowSurahNavToggle}
          aria-pressed={showSurahNav}
          title="Toggle Surah Navigator"
          className={`
            px-2 py-1 text-xs rounded transition-colors
            ${
              showSurahNav
                ? 'bg-[var(--ae-gold-100)] text-[var(--ae-gold-700)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
            }
          `}
        >
          ☰ Surahs
        </button>

        {/* Surah name */}
        {surahMeta && (
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {surahMeta.transliterated_name} ({surahMeta.number})
          </span>
        )}

        <div className="flex-1" />

        {/* View mode */}
        <div className="flex items-center rounded border border-[var(--border-color)] overflow-hidden">
          <ViewModeButton
            active={viewMode === 'verse-by-verse'}
            onClick={() => onViewModeChange('verse-by-verse')}
            icon="☰"
            title="Verse-by-verse study mode"
          />
          <ViewModeButton
            active={viewMode === 'continuous'}
            onClick={() => onViewModeChange('continuous')}
            icon="≡"
            title="Continuous mushaf-style"
          />
          <ViewModeButton
            active={viewMode === 'page'}
            onClick={() => onViewModeChange('page')}
            icon="□"
            title="Page view"
          />
        </div>

        {/* Translation toggle */}
        <button
          onClick={onShowTranslationToggle}
          aria-pressed={showTranslation}
          title="Toggle translation"
          className={`
            px-2.5 py-1 text-xs rounded border transition-colors
            ${
              showTranslation
                ? 'bg-[var(--tech-blue-100)] text-[var(--tech-blue-700)] border-[var(--tech-blue-300)]'
                : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
            }
          `}
        >
          🌐 Translation
        </button>

        {/* Translation mode — only shown when translation is visible */}
        {showTranslation && (
          <div className="flex items-center rounded border border-[var(--border-color)] overflow-hidden">
            {(['single', 'parallel', 'interlinear', 'comparison'] as TranslationMode[]).map((m) => (
              <button
                key={m}
                onClick={() => onTranslationModeChange(m)}
                aria-pressed={translationMode === m}
                title={`${m} mode`}
                className={`
                  px-2 py-1 text-xs capitalize transition-colors
                  ${
                    translationMode === m
                      ? 'bg-[var(--accent-primary)] text-white'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                  }
                `}
              >
                {m}
              </button>
            ))}
          </div>
        )}

        {/* Tajweed toggle */}
        <div className="relative">
          <button
            onClick={onTajweedToggle}
            aria-pressed={tajweedEnabled}
            title="Toggle tajweed overlay"
            className={`
              px-2.5 py-1 text-xs rounded border transition-colors
              ${
                tajweedEnabled
                  ? 'bg-[var(--ae-green-100)] text-[var(--ae-green-700)] border-[var(--ae-green-300)]'
                  : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
              }
            `}
          >
            🎨 Tajweed
          </button>
          {tajweedEnabled && (
            <button
              onClick={() => setShowTajweedLegend((v) => !v)}
              className="ml-0.5 text-xs text-[var(--ae-green-600)] hover:underline"
            >
              ?
            </button>
          )}
          {showTajweedLegend && (
            <div className="absolute right-0 top-8 w-80 z-50">
              <TajweedLegend />
            </div>
          )}
        </div>

        {/* Prev / Next surah */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => prevSurah !== null && onNavigateSurah(prevSurah)}
            disabled={prevSurah === null}
            title="Previous Surah"
            className="p-1 rounded hover:bg-[var(--bg-secondary)] disabled:opacity-30 text-[var(--text-secondary)] text-sm transition-colors"
          >
            ‹
          </button>
          <button
            onClick={() => nextSurah !== null && onNavigateSurah(nextSurah)}
            disabled={nextSurah === null}
            title="Next Surah"
            className="p-1 rounded hover:bg-[var(--bg-secondary)] disabled:opacity-30 text-[var(--text-secondary)] text-sm transition-colors"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main QuranReader ─────────────────────────────────────────────────────────

/**
 * The main Quran reading module.
 * Route: /quran (surah selector) | /quran/:surah | /quran/:surah/:ayah
 */
export default function QuranReader(): React.ReactElement {
  const { surah: surahParam, ayah: ayahParam } = useParams<{ surah?: string; ayah?: string }>()
  const navigate = useNavigate()
  const ipc = useIpc()

  const surahNumber = surahParam ? parseInt(surahParam, 10) : null
  const targetAyah = ayahParam ? parseInt(ayahParam, 10) : null

  const [bundles, setBundles] = useState<AyahBundle[]>([])
  const [surahMeta, setSurahMeta] = useState<SurahMeta | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('verse-by-verse')
  const [showTranslation, setShowTranslation] = useState(true)
  const [translationMode, setTranslationMode] = useState<TranslationMode>('single')
  const [tajweedEnabled, setTajweedEnabled] = useState(false)
  const [showSurahNav, setShowSurahNav] = useState(!surahNumber)
  const [selectedTranslationKeys, setSelectedTranslationKeys] = useState<string[]>([])

  const contentRef = useRef<HTMLDivElement>(null)

  // ── Load surah data ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!surahNumber) return

    setLoading(true)
    setError(null)
    setBundles([])
    setSurahMeta(null)

    async function load() {
      if (!ipc) {
        setError('Library not available (running outside Electron)')
        setLoading(false)
        return
      }

      try {
        const [bundleData, surahList] = await Promise.all([
          ipc.invoke('library:get-ayahs-by-surah', surahNumber),
          ipc.invoke('library:get-surahs'),
        ])

        const allSurahs = surahList as SurahMeta[]
        const meta = allSurahs.find((s) => s.number === surahNumber) ?? null
        setSurahMeta(meta)

        const data = bundleData as AyahBundle[]
        setBundles(data)

        // Set default translation selection from first bundle
        if (data.length > 0 && data[0].translations.length > 0) {
          const defaultKey = data[0].translations[0].translation_key
          setSelectedTranslationKeys([defaultKey])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load Quran data')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [surahNumber, ipc])

  // ── Scroll to target ayah ─────────────────────────────────────────────────
  useEffect(() => {
    if (!targetAyah || bundles.length === 0) return
    const el = document.getElementById(`ayah-${targetAyah}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [targetAyah, bundles])

  // ── Translation key toggle ─────────────────────────────────────────────────
  const toggleTranslationKey = useCallback((key: string) => {
    setSelectedTranslationKeys((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key)
      if (prev.length >= 4) return prev
      return [...prev, key]
    })
  }, [])

  // ── Navigation ─────────────────────────────────────────────────────────────
  const handleNavigateSurah = useCallback((n: number) => void navigate(`/quran/${n}`), [navigate])

  const handleAddNote = useCallback(
    (surah: number, ayah: number) => {
      void navigate(`/notes?ref=quran:${surah}:${ayah}`)
    },
    [navigate]
  )

  const handleViewTafsir = useCallback(
    (surah: number, ayah: number) => {
      // Navigate to tafsir for this verse
      void navigate(`/tafsir/${surah}/${ayah}`)
    },
    [navigate]
  )

  const handleViewHadith = useCallback(
    (surah: number, ayah: number) => {
      void navigate(`/hadith?quranRef=${surah}:${ayah}`)
    },
    [navigate]
  )

  // Collect all available translations from loaded data
  const availableTranslations: Translation[] =
    bundles.length > 0
      ? bundles[0].translations.map((t) => ({
          translationKey: t.translation_key,
          text: t.text,
          translator: t.translator,
          language: t.language,
        }))
      : []

  // Prev/next surah
  const prevSurah = surahNumber && surahNumber > 1 ? surahNumber - 1 : null
  const nextSurah = surahNumber && surahNumber < 114 ? surahNumber + 1 : null

  // ─────────────────────────────────────────────────────────────────────────

  // No surah selected — show navigator full-screen
  if (!surahNumber) {
    return <SurahNavigator />
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Surah navigator side panel */}
      {showSurahNav && (
        <div className="w-72 flex-shrink-0 border-r border-[var(--border-color)] overflow-hidden">
          <SurahNavigator activeSurahNumber={surahNumber} onSelectSurah={handleNavigateSurah} />
        </div>
      )}

      {/* Main reading area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Sticky reading toolbar */}
        <ReaderToolbar
          surahMeta={surahMeta}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          translationMode={translationMode}
          onTranslationModeChange={setTranslationMode}
          tajweedEnabled={tajweedEnabled}
          onTajweedToggle={() => setTajweedEnabled((v) => !v)}
          showTranslation={showTranslation}
          onShowTranslationToggle={() => setShowTranslation((v) => !v)}
          showSurahNav={showSurahNav}
          onShowSurahNavToggle={() => setShowSurahNav((v) => !v)}
          prevSurah={prevSurah}
          nextSurah={nextSurah}
          onNavigateSurah={handleNavigateSurah}
        />

        {/* Translation selector bar */}
        {showTranslation && availableTranslations.length > 0 && (
          <div className="px-4 py-2 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-[var(--text-secondary)]">Translations:</span>
              <TranslationSelector
                available={availableTranslations}
                selected={selectedTranslationKeys}
                onToggle={toggleTranslationKey}
                maxSelectable={translationMode === 'parallel' ? 4 : 1}
              />
            </div>
          </div>
        )}

        {/* Scrollable content */}
        <div ref={contentRef} className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-8 h-8 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-[var(--ae-red-500)] mb-2">{error}</p>
              <p className="text-sm text-[var(--text-secondary)]">
                Please ensure the library database is initialized and contains data.
              </p>
            </div>
          ) : bundles.length === 0 ? (
            <div className="p-8 text-center text-[var(--text-secondary)]">
              <p className="text-5xl mb-4">📖</p>
              <p
                className="text-lg font-semibold mb-2"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                No verses found for Surah {surahNumber}
              </p>
              <p className="text-sm">
                The library database may be empty. Run the seed script to load sample data.
              </p>
            </div>
          ) : (
            <div
              className={`
              max-w-3xl mx-auto px-6
              ${viewMode === 'continuous' ? 'py-8' : 'py-4'}
            `}
            >
              {/* Surah header */}
              {surahMeta && <SurahHeader meta={surahMeta} />}

              {/* Verses */}
              {viewMode === 'continuous' ? (
                /* Continuous (mushaf-style): Arabic flows as one block */
                <div>
                  <div
                    dir="rtl"
                    className="text-3xl leading-[3] text-right"
                    style={{ fontFamily: "'KFGQPC Uthmanic Hafs', 'Amiri', serif" }}
                  >
                    {bundles.map(({ ayah, morphology }, idx) => {
                      const morphWords: WordMorphology[] = morphology.map((m) => ({
                        wordPosition: m.word_position,
                        surfaceForm: m.surface_form,
                        rootLetters: m.root_letters ?? null,
                        rootMeaningEnglish: m.root_meaning_english ?? null,
                        pattern: m.pattern ?? null,
                        pos: m.pos,
                        caseMarker: m.case_marker ?? null,
                      }))
                      return (
                        <span key={ayah.id} id={`ayah-${ayah.ayah_number}`}>
                          <ArabicVerse
                            surahNumber={surahNumber}
                            ayahNumber={ayah.ayah_number}
                            arabicText={ayah.arabic_text}
                            arabicSimple={ayah.arabic_simple}
                            bismillahPre={idx === 0 && ayah.bismillah_pre === 1}
                            morphology={morphWords}
                            tajweedEnabled={tajweedEnabled}
                            viewMode="continuous"
                            showVerseNumber={true}
                            onAddNote={handleAddNote}
                            onViewTafsir={handleViewTafsir}
                            onViewHadith={handleViewHadith}
                          />
                        </span>
                      )
                    })}
                  </div>
                  {/* Translation block below continuous Arabic */}
                  {showTranslation && selectedTranslationKeys.length > 0 && (
                    <div className="mt-6 border-t border-[var(--border-color)] pt-4">
                      {bundles.map(({ ayah, translations }) => {
                        const trans: Translation[] = translations.map((t) => ({
                          translationKey: t.translation_key,
                          text: t.text,
                          translator: t.translator,
                          language: t.language,
                        }))
                        return (
                          <div key={ayah.id} className="mb-3">
                            <span className="text-xs font-semibold text-[var(--ae-gold-600)] mr-2">
                              {ayah.ayah_number}.
                            </span>
                            <TranslationView
                              translations={trans}
                              selectedKeys={selectedTranslationKeys}
                              mode="single"
                              ayahNumber={ayah.ayah_number}
                            />
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* Verse-by-verse (study mode) */
                <div className="space-y-8">
                  {bundles.map(({ ayah, translations, morphology }, idx) => {
                    const morphWords: WordMorphology[] = morphology.map((m) => ({
                      wordPosition: m.word_position,
                      surfaceForm: m.surface_form,
                      rootLetters: m.root_letters ?? null,
                      rootMeaningEnglish: m.root_meaning_english ?? null,
                      pattern: m.pattern ?? null,
                      pos: m.pos,
                      caseMarker: m.case_marker ?? null,
                    }))

                    const trans: Translation[] = translations.map((t) => ({
                      translationKey: t.translation_key,
                      text: t.text,
                      translator: t.translator,
                      language: t.language,
                    }))

                    const primaryTranslation = trans.find((t) =>
                      selectedTranslationKeys.includes(t.translationKey)
                    )

                    return (
                      <div
                        key={ayah.id}
                        id={`ayah-${ayah.ayah_number}`}
                        className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-5 shadow-sm hover:shadow-md transition-shadow"
                      >
                        {/* Arabic verse */}
                        <ArabicVerse
                          surahNumber={surahNumber}
                          ayahNumber={ayah.ayah_number}
                          arabicText={ayah.arabic_text}
                          arabicSimple={ayah.arabic_simple}
                          bismillahPre={idx === 0 && ayah.bismillah_pre === 1}
                          morphology={morphWords}
                          translationText={primaryTranslation?.text}
                          tajweedEnabled={tajweedEnabled}
                          viewMode="verse-by-verse"
                          onAddNote={handleAddNote}
                          onViewTafsir={handleViewTafsir}
                          onViewHadith={handleViewHadith}
                        />

                        {/* Translation(s) */}
                        {showTranslation && selectedTranslationKeys.length > 0 && (
                          <TranslationView
                            translations={trans}
                            selectedKeys={selectedTranslationKeys}
                            mode={translationMode}
                            arabicWords={ayah.arabic_simple.split(/\s+/).filter(Boolean)}
                            ayahNumber={ayah.ayah_number}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Surah footer */}
              {!loading && bundles.length > 0 && (
                <div className="py-10 text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="h-px w-16 bg-[var(--ae-gold-300)]" />
                    <span className="text-[var(--ae-gold-400)] text-xl">❁</span>
                    <div className="h-px w-16 bg-[var(--ae-gold-300)]" />
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">
                    End of Surah {surahMeta?.transliterated_name ?? surahNumber}
                  </p>
                  <div className="flex items-center justify-center gap-4 mt-4">
                    {prevSurah && (
                      <button
                        onClick={() => handleNavigateSurah(prevSurah)}
                        className="px-4 py-2 text-sm rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] transition-colors text-[var(--text-secondary)]"
                      >
                        ‹ Previous Surah
                      </button>
                    )}
                    {nextSurah && (
                      <button
                        onClick={() => handleNavigateSurah(nextSurah)}
                        className="px-4 py-2 text-sm rounded-lg border border-[var(--accent-primary)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-white transition-colors"
                      >
                        Next Surah ›
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
