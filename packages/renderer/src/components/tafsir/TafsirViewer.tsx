import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useIpc } from '../../hooks/useIpc'

// ─── Types ────────────────────────────────────────────────────────────────────

interface TafsirEntry {
  id: number
  ayah_id: number
  tafsir_key: string
  text: string
  language: string
  volume: number | null
  page: number | null
}

interface TafsirAnnotation {
  id: number
  tafsir_key: string
  ayah_id: number
  type: 'key_ruling' | 'ijaz' | 'disputed' | 'linguistic_note' | 'historical_context'
  label: string
  note: string
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

// ─── Static tafsir metadata ───────────────────────────────────────────────────

interface TafsirMeta {
  key: string
  titleArabic: string
  titleEnglish: string
  author: string
  authorDates: string
  tradition: string
  century: string
  language: string
  bio: string
}

const TAFSIR_REGISTRY: Record<string, TafsirMeta> = {
  'ibn-kathir': {
    key: 'ibn-kathir',
    titleArabic: 'تفسير القرآن العظيم',
    titleEnglish: 'Tafsir Ibn Kathir',
    author: 'Ismail ibn Umar ibn Kathir',
    authorDates: '701–774 AH / 1301–1373 CE',
    tradition: "Sunni (Shafi'i / Hanbali influenced)",
    century: '8th Century AH',
    language: 'English (condensed)',
    bio:
      'Imad al-Din Ismail ibn Umar ibn Kathir al-Qurashi al-Busrawi was a prominent historian, muhaddith, and mufassir. ' +
      'Born near Busra (modern Syria), he studied under the great scholars of Damascus including Ibn Taymiyyah and became one ' +
      "of the most celebrated scholars of the Shafi'i school. His tafsir, Tafsir al-Quran al-Azim, is renowned for its " +
      'emphasis on explaining the Quran through other Quranic verses, authentic hadith, and statements of the Companions. ' +
      'It remains the most widely read classical tafsir in the English-speaking Muslim world.',
  },
  'al-jalalayn': {
    key: 'al-jalalayn',
    titleArabic: 'تفسير الجلالين',
    titleEnglish: 'Tafsir al-Jalalayn',
    author: 'Jalaluddin al-Mahalli & Jalaluddin al-Suyuti',
    authorDates: '791–864 AH / 791–911 AH',
    tradition: "Sunni (Shafi'i)",
    century: '9th–10th Century AH',
    language: 'English',
    bio:
      'Tafsir al-Jalalayn ("Tafsir of the Two Jalals") is a concise and widely used Quranic commentary authored by two ' +
      'scholars: Jalaluddin al-Mahalli (d. 864 AH) and his student Jalaluddin al-Suyuti (d. 911 AH), who completed ' +
      "the work after his teacher's death. Known for its brevity and clarity, it provides word-for-word explanations " +
      'and is commonly used as a first tafsir for students of the Arabic Quran.',
  },
  'al-tabari': {
    key: 'al-tabari',
    titleArabic: 'جامع البيان في تأويل القرآن',
    titleEnglish: "Jami' al-Bayan (Tafsir al-Tabari)",
    author: 'Muhammad ibn Jarir al-Tabari',
    authorDates: '224–310 AH / 839–923 CE',
    tradition: 'Sunni',
    century: '3rd–4th Century AH',
    language: 'Arabic',
    bio:
      'Muhammad ibn Jarir al-Tabari was one of the most eminent scholars of early Islam — historian, jurist, and ' +
      "Quranic commentator. His encyclopedic tafsir, Jami' al-Bayan fi Ta'wil al-Quran, is the largest and most " +
      'comprehensive classical tafsir, spanning over 30 volumes. It preserves thousands of narrations from the ' +
      'Companions and Successors and is considered the foundation upon which later tafsirs were built.',
  },
}

// ─── Cross-reference parser ───────────────────────────────────────────────────

/**
 * Parses tafsir text and wraps Quranic verse references (e.g., "Quran 2:255",
 * "Q 4:69", "(2:255)") and hadith references (e.g., "Bukhari 1", "Muslim 1041")
 * into React elements with navigation links.
 */

/**
 * Combined cross-reference regex for Quran and Hadith refs.
 * Capture groups:
 *   [1,2]  — "Quran N:N" or "Q N:N"  → surah, ayah
 *   [3,4]  — "(N:N)" parenthetical     → surah, ayah
 *   [5,6]  — "Collection N"            → collection name, hadith number
 */
const CROSS_REF_PATTERN =
  /(?:Quran|Q)\s+(\d{1,3}):(\d{1,3})|\((\d{1,3}):(\d{1,3})\)|\b(Bukhari|Muslim|Tirmidhi|Abu Dawud|Nasa'i|Ibn Majah)\s+(\d+)/g

function parseCrossRefs(
  text: string,
  onNavigateVerse: (surah: number, ayah: number) => void,
  onNavigateHadith: (collection: string, number: string) => void
): React.ReactNode[] {
  const combinedPattern = new RegExp(CROSS_REF_PATTERN.source, CROSS_REF_PATTERN.flags)

  const nodes: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = combinedPattern.exec(text)) !== null) {
    // Push text before the match
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }

    const fullMatch = match[0]

    if (match[1] && match[2]) {
      // "Quran N:N" or "Q N:N"
      const surah = parseInt(match[1], 10)
      const ayah = parseInt(match[2], 10)
      nodes.push(
        <button
          key={`q-${match.index}`}
          onClick={() => onNavigateVerse(surah, ayah)}
          className="inline text-[var(--accent-primary)] hover:underline font-medium cursor-pointer"
          title={`Open Quran ${surah}:${ayah}`}
        >
          {fullMatch}
        </button>
      )
    } else if (match[3] && match[4]) {
      // "(N:N)"
      const surah = parseInt(match[3], 10)
      const ayah = parseInt(match[4], 10)
      nodes.push(
        <button
          key={`q-paren-${match.index}`}
          onClick={() => onNavigateVerse(surah, ayah)}
          className="inline text-[var(--accent-primary)] hover:underline font-medium cursor-pointer"
          title={`Open Quran ${surah}:${ayah}`}
        >
          {fullMatch}
        </button>
      )
    } else if (match[5] && match[6]) {
      // Hadith reference
      const collection = match[5].toLowerCase().replace(/[' ]/g, '-')
      const number = match[6]
      nodes.push(
        <button
          key={`h-${match.index}`}
          onClick={() => onNavigateHadith(collection, number)}
          className="inline text-[var(--tech-blue-600)] hover:underline font-medium cursor-pointer"
          title={`Open ${match[5]} ${number}`}
        >
          {fullMatch}
        </button>
      )
    }

    lastIndex = match.index + fullMatch.length
  }

  // Remaining text
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes
}

// ─── Author bio modal ─────────────────────────────────────────────────────────

function AuthorBioModal({
  meta,
  onClose,
}: {
  meta: TafsirMeta
  onClose: () => void
}): React.ReactElement {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Author biography"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
    >
      <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl shadow-2xl max-w-lg w-full mx-4 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2
              className="text-xl font-semibold text-[var(--text-primary)]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {meta.titleEnglish}
            </h2>
            <p
              dir="rtl"
              className="text-base text-[var(--ae-gold-600)] mt-0.5"
              style={{ fontFamily: "'Amiri', serif" }}
            >
              {meta.titleArabic}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors"
          >
            ✕
          </button>
        </div>

        <dl className="space-y-2 text-sm mb-4">
          <div className="flex gap-2">
            <dt className="font-semibold text-[var(--text-secondary)] w-24 flex-shrink-0">
              Author
            </dt>
            <dd className="text-[var(--text-primary)]">{meta.author}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-semibold text-[var(--text-secondary)] w-24 flex-shrink-0">Dates</dt>
            <dd className="text-[var(--text-primary)]">{meta.authorDates}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-semibold text-[var(--text-secondary)] w-24 flex-shrink-0">
              Century
            </dt>
            <dd className="text-[var(--text-primary)]">{meta.century}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-semibold text-[var(--text-secondary)] w-24 flex-shrink-0">
              Tradition
            </dt>
            <dd className="text-[var(--text-primary)]">{meta.tradition}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-semibold text-[var(--text-secondary)] w-24 flex-shrink-0">
              Language
            </dt>
            <dd className="text-[var(--text-primary)]">{meta.language}</dd>
          </div>
        </dl>

        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{meta.bio}</p>
      </div>
    </div>
  )
}

// ─── Tafsir selector ──────────────────────────────────────────────────────────

interface TafsirSelectorProps {
  availableKeys: string[]
  selectedKeys: string[]
  maxSelectable: number
  onToggle: (key: string) => void
}

function TafsirSelector({
  availableKeys,
  selectedKeys,
  maxSelectable,
  onToggle,
}: TafsirSelectorProps): React.ReactElement {
  if (availableKeys.length === 0) {
    return <span className="text-xs text-[var(--text-secondary)] italic">No tafsirs installed</span>
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {availableKeys.map((key) => {
        const meta = TAFSIR_REGISTRY[key]
        const label = meta ? meta.titleEnglish : key
        const isSelected = selectedKeys.includes(key)
        const isDisabled = !isSelected && selectedKeys.length >= maxSelectable

        return (
          <button
            key={key}
            onClick={() => !isDisabled && onToggle(key)}
            disabled={isDisabled}
            aria-pressed={isSelected}
            title={meta ? `${meta.titleEnglish} — ${meta.author}` : key}
            className={`
              px-2.5 py-1 text-xs rounded-full border transition-colors
              ${
                isSelected
                  ? 'bg-[var(--ae-gold-100)] text-[var(--ae-gold-800)] border-[var(--ae-gold-400)]'
                  : isDisabled
                    ? 'text-[var(--text-secondary)] border-[var(--border-color)] opacity-40 cursor-not-allowed'
                    : 'text-[var(--text-secondary)] border-[var(--border-color)] hover:bg-[var(--bg-secondary)]'
              }
            `}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

// ─── Ayah navigator ───────────────────────────────────────────────────────────

interface AyahNavProps {
  ayahNumber: number
  verseCount: number
  onNavigate: (ayah: number) => void
}

function AyahNav({ ayahNumber, verseCount, onNavigate }: AyahNavProps): React.ReactElement {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => ayahNumber > 1 && onNavigate(ayahNumber - 1)}
        disabled={ayahNumber <= 1}
        title="Previous verse"
        className="px-2 py-1 text-sm rounded border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] disabled:opacity-30 transition-colors text-[var(--text-secondary)]"
      >
        ‹
      </button>
      <span className="text-sm text-[var(--text-secondary)]">
        Verse <span className="font-semibold text-[var(--text-primary)]">{ayahNumber}</span> of{' '}
        {verseCount}
      </span>
      <button
        onClick={() => ayahNumber < verseCount && onNavigate(ayahNumber + 1)}
        disabled={ayahNumber >= verseCount}
        title="Next verse"
        className="px-2 py-1 text-sm rounded border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] disabled:opacity-30 transition-colors text-[var(--text-secondary)]"
      >
        ›
      </button>
    </div>
  )
}

// ─── Annotation callout ───────────────────────────────────────────────────────

const ANNOTATION_CONFIG: Record<
  TafsirAnnotation['type'],
  { label: string; icon: string; colorClass: string }
> = {
  key_ruling: {
    label: 'Key Ruling',
    icon: '⚖️',
    colorClass:
      'bg-[var(--ae-gold-50)] border-[var(--ae-gold-300)] text-[var(--ae-gold-800)]',
  },
  ijaz: {
    label: 'Linguistic Miracle',
    icon: '✨',
    colorClass:
      'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700',
  },
  disputed: {
    label: 'Disputed Point',
    icon: '⚠️',
    colorClass:
      'bg-orange-50 border-orange-300 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-700',
  },
  linguistic_note: {
    label: 'Linguistic Note',
    icon: '📝',
    colorClass:
      'bg-blue-50 border-blue-300 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700',
  },
  historical_context: {
    label: 'Historical Context',
    icon: '🕌',
    colorClass:
      'bg-slate-50 border-slate-300 text-slate-700 dark:bg-slate-800/40 dark:text-slate-300 dark:border-slate-600',
  },
}

function AnnotationCallout({
  annotation,
}: {
  annotation: TafsirAnnotation
}): React.ReactElement {
  const config = ANNOTATION_CONFIG[annotation.type]
  return (
    <div className={`mt-3 p-3 rounded-lg border text-sm ${config.colorClass}`}>
      <div className="flex items-center gap-1.5 font-semibold mb-1 text-xs uppercase tracking-wide">
        <span>{config.icon}</span>
        <span>{config.label}</span>
        {annotation.label && (
          <>
            <span className="opacity-40">·</span>
            <span className="normal-case tracking-normal">{annotation.label}</span>
          </>
        )}
      </div>
      <p className="leading-relaxed">{annotation.note}</p>
    </div>
  )
}

// ─── Single tafsir panel ──────────────────────────────────────────────────────

interface TafsirPanelProps {
  entry: TafsirEntry | null
  tafsirKey: string
  loading: boolean
  annotations: TafsirAnnotation[]
  onNavigateVerse: (surah: number, ayah: number) => void
  onNavigateHadith: (collection: string, number: string) => void
  onShowAuthorBio: (key: string) => void
}

function TafsirPanel({
  entry,
  tafsirKey,
  loading,
  annotations,
  onNavigateVerse,
  onNavigateHadith,
  onShowAuthorBio,
}: TafsirPanelProps): React.ReactElement {
  const meta = TAFSIR_REGISTRY[tafsirKey]

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <div>
          <h3
            className="text-sm font-semibold text-[var(--text-primary)]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {meta ? meta.titleEnglish : tafsirKey}
          </h3>
          {meta && <p className="text-xs text-[var(--text-secondary)]">{meta.author}</p>}
        </div>
        {meta && (
          <button
            onClick={() => onShowAuthorBio(tafsirKey)}
            title="About the author"
            className="text-xs text-[var(--accent-primary)] hover:underline px-2 py-1 rounded hover:bg-[var(--bg-primary)] transition-colors"
          >
            About ℹ
          </button>
        )}
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-24">
            <div className="w-6 h-6 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !entry ? (
          <div className="text-center py-12 text-[var(--text-secondary)]">
            <p className="text-3xl mb-3">📖</p>
            <p className="text-sm font-medium mb-1">No tafsir available</p>
            <p className="text-xs">
              {meta ? meta.titleEnglish : tafsirKey} has no entry for this verse.
            </p>
          </div>
        ) : (
          <>
            {/* Volume / page citation */}
            {(entry.volume !== null || entry.page !== null) && (
              <div className="mb-4 px-3 py-2 rounded-lg bg-[var(--ae-gold-50)] border border-[var(--ae-gold-200)] text-xs text-[var(--ae-gold-700)] flex items-center gap-2">
                <span>📚</span>
                <span>
                  {meta ? meta.titleEnglish : tafsirKey}
                  {entry.volume !== null && ` — Vol. ${entry.volume}`}
                  {entry.page !== null && `, p. ${entry.page}`}
                </span>
              </div>
            )}

            {/* Tafsir text with cross-references */}
            <div className="prose prose-sm max-w-none">
              <p className="text-sm leading-[1.9] text-[var(--text-primary)]">
                {parseCrossRefs(entry.text, onNavigateVerse, onNavigateHadith)}
              </p>
            </div>

            {/* Passage annotations (key rulings, ijaz, disputed, etc.) */}
            {annotations.length > 0 && (
              <div className="mt-4 space-y-0">
                <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                  Scholarly Annotations
                </p>
                {annotations.map((ann) => (
                  <AnnotationCallout key={ann.id} annotation={ann} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─── Main TafsirViewer ────────────────────────────────────────────────────────

/**
 * Tafsir Viewer — Phase 4
 * Route: /tafsir/:surah/:ayah
 *
 * Features:
 * - Synchronized with Quran verse (auto-navigates to selected ayah's tafsir)
 * - Tafsir selector: switch between installed tafsirs
 * - Multiple tafsirs side-by-side (up to 2)
 * - Volume/page citation for every entry
 * - Live cross-reference links (Quranic verses + Hadith)
 * - Author bio accessible from panel header
 * - Verse-by-verse navigation within the surah
 */
/** Approximate height of the sticky toolbar + Arabic verse banner in pixels. */
const TAFSIR_HEADER_HEIGHT = '200px'

export default function TafsirViewer(): React.ReactElement {
  const { surah: surahParam, ayah: ayahParam } = useParams<{ surah: string; ayah: string }>()
  const navigate = useNavigate()
  const ipc = useIpc()

  const surahNumber = surahParam ? parseInt(surahParam, 10) : 1
  const ayahNumber = ayahParam ? parseInt(ayahParam, 10) : 1

  const [surahMeta, setSurahMeta] = useState<SurahMeta | null>(null)
  const [availableTafsirKeys, setAvailableTafsirKeys] = useState<string[]>([])
  const [selectedKeys, setSelectedKeys] = useState<string[]>(['ibn-kathir'])
  const [entries, setEntries] = useState<Record<string, TafsirEntry | null>>({})
  const [annotations, setAnnotations] = useState<Record<string, TafsirAnnotation[]>>({})
  const [ayahArabic, setAyahArabic] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [authorBioKey, setAuthorBioKey] = useState<string | null>(null)

  // ── Load available tafsir keys + surah meta ──────────────────────────────
  useEffect(() => {
    if (!ipc) return

    async function loadMeta() {
      if (!ipc) return
      try {
        const [keys, surahs] = await Promise.all([
          ipc.invoke('library:get-tafsir-keys'),
          ipc.invoke('library:get-surahs'),
        ])
        const tafsirKeys = keys as string[]
        setAvailableTafsirKeys(tafsirKeys)
        // Default to first available key if 'ibn-kathir' not present
        if (tafsirKeys.length > 0 && !tafsirKeys.includes('ibn-kathir')) {
          setSelectedKeys([tafsirKeys[0]])
        }
        const allSurahs = surahs as SurahMeta[]
        setSurahMeta(allSurahs.find((s) => s.number === surahNumber) ?? null)
      } catch {
        // silently fail — may be running outside Electron
      }
    }

    void loadMeta()
  }, [ipc, surahNumber])

  // ── Load tafsir entries for current ayah ────────────────────────────────
  useEffect(() => {
    if (!ipc || selectedKeys.length === 0) return

    setLoading(true)

    async function loadTafsirs() {
      if (!ipc) return
      try {
        // First get the ayah ID for this surah/ayah
        const ayahData = (await ipc.invoke('library:get-ayah', surahNumber, ayahNumber)) as {
          ayah: { id: number; arabic_text: string }
          translations: unknown[]
        } | null

        if (!ayahData) {
          setEntries({})
          setAyahArabic(null)
          return
        }

        setAyahArabic(ayahData.ayah.arabic_text)

        // Fetch each selected tafsir and its annotations
        const results: Record<string, TafsirEntry | null> = {}
        const annotationResults: Record<string, TafsirAnnotation[]> = {}
        await Promise.all(
          selectedKeys.map(async (key) => {
            try {
              const [entry, anns] = await Promise.all([
                ipc.invoke('library:get-tafsir', ayahData.ayah.id, key),
                ipc
                  .invoke('library:get-tafsir-annotations', ayahData.ayah.id, key)
                  .catch(() => []),
              ])
              results[key] = (entry as TafsirEntry) ?? null
              annotationResults[key] = (anns as TafsirAnnotation[]) ?? []
            } catch {
              results[key] = null
              annotationResults[key] = []
            }
          })
        )

        setEntries(results)
        setAnnotations(annotationResults)
      } catch {
        setEntries({})
      } finally {
        setLoading(false)
      }
    }

    void loadTafsirs()
  }, [ipc, surahNumber, ayahNumber, selectedKeys])

  // ── Navigation handlers ──────────────────────────────────────────────────
  const handleNavigateAyah = useCallback(
    (newAyah: number) => {
      void navigate(`/tafsir/${surahNumber}/${newAyah}`)
    },
    [navigate, surahNumber]
  )

  const handleNavigateVerse = useCallback(
    (surah: number, ayah: number) => {
      void navigate(`/tafsir/${surah}/${ayah}`)
    },
    [navigate]
  )

  const handleNavigateHadith = useCallback(
    (collection: string, number: string) => {
      void navigate(`/hadith/${collection}/${number}`)
    },
    [navigate]
  )

  const toggleTafsirKey = useCallback((key: string) => {
    setSelectedKeys((prev) => {
      if (prev.includes(key)) {
        if (prev.length === 1) return prev // keep at least one
        return prev.filter((k) => k !== key)
      }
      if (prev.length >= 2) return [prev[1], key] // replace oldest when at max
      return [...prev, key]
    })
  }, [])

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="sticky top-0 z-30 bg-[var(--bg-primary)] border-b border-[var(--border-color)] px-4 py-2">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Back to Quran */}
          <Link
            to={`/quran/${surahNumber}/${ayahNumber}`}
            className="flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
          >
            ← Quran {surahNumber}:{ayahNumber}
          </Link>

          <div className="w-px h-4 bg-[var(--border-color)]" />

          {/* Surah info */}
          {surahMeta && (
            <span className="text-sm font-medium text-[var(--text-primary)]">
              <span
                dir="rtl"
                className="text-[var(--ae-gold-600)] mr-1"
                style={{ fontFamily: "'Amiri', serif" }}
              >
                {surahMeta.arabic_name}
              </span>
              {surahMeta.transliterated_name} ({surahNumber}:{ayahNumber})
            </span>
          )}

          <div className="flex-1" />

          {/* Ayah navigation */}
          {surahMeta && (
            <AyahNav
              ayahNumber={ayahNumber}
              verseCount={surahMeta.verse_count}
              onNavigate={handleNavigateAyah}
            />
          )}
        </div>

        {/* Tafsir selector */}
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[var(--border-color)]">
          <span className="text-xs text-[var(--text-secondary)] flex-shrink-0">Tafsir:</span>
          <TafsirSelector
            availableKeys={availableTafsirKeys}
            selectedKeys={selectedKeys}
            maxSelectable={2}
            onToggle={toggleTafsirKey}
          />
          {selectedKeys.length === 2 && (
            <span className="text-xs text-[var(--text-secondary)] italic">(side-by-side)</span>
          )}
        </div>
      </div>

      {/* Arabic verse banner */}
      {ayahArabic && (
        <div className="px-6 py-4 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] text-center">
          <p
            dir="rtl"
            className="text-2xl leading-loose text-[var(--text-primary)]"
            style={{ fontFamily: "'KFGQPC Uthmanic Hafs', 'Amiri', serif" }}
          >
            {ayahArabic}
          </p>
          <p className="text-xs text-[var(--ae-gold-600)] mt-1">
            {surahNumber}:{ayahNumber}
            {surahMeta ? ` — ${surahMeta.transliterated_name}` : ''}
          </p>
        </div>
      )}

      {/* Tafsir panels */}
      <div
        className={`flex-1 overflow-hidden ${selectedKeys.length > 1 ? 'flex divide-x divide-[var(--border-color)]' : ''}`}
      >
        {selectedKeys.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-[var(--text-secondary)]">
            <p className="text-sm">Select a tafsir above to begin reading.</p>
          </div>
        ) : (
          selectedKeys.map((key) => (
            <div
              key={key}
              className={`overflow-hidden ${selectedKeys.length > 1 ? 'flex-1' : 'h-full'}`}
              style={{
                height: selectedKeys.length > 1 ? `calc(100vh - ${TAFSIR_HEADER_HEIGHT})` : '100%',
              }}
            >
              <TafsirPanel
                entry={entries[key] ?? null}
                tafsirKey={key}
                loading={loading}
                annotations={annotations[key] ?? []}
                onNavigateVerse={handleNavigateVerse}
                onNavigateHadith={handleNavigateHadith}
                onShowAuthorBio={setAuthorBioKey}
              />
            </div>
          ))
        )}
      </div>

      {/* Author bio modal */}
      {authorBioKey && TAFSIR_REGISTRY[authorBioKey] && (
        <AuthorBioModal
          meta={TAFSIR_REGISTRY[authorBioKey]}
          onClose={() => setAuthorBioKey(null)}
        />
      )}
    </div>
  )
}
