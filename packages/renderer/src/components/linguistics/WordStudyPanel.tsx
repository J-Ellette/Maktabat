import React, { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useIpc } from '../../hooks/useIpc'
import { transliterate } from '@arabic-nlp/transliteration'
import type { WordOccurrenceRow } from '@shared/types/ipc'
import type { LibrarySearchResult } from '@shared/types/ipc'

// ─── Mock dictionary data ─────────────────────────────────────────────────────

const MOCK_DICTIONARY: Record<string, { mufradat: string; lisanArab: string; meaning: string }> = {
  default: {
    mufradat:
      'The root conveys a core semantic meaning related to its trilateral consonants. Al-Raghib al-Isfahani notes that the original sense involves a fundamental action or state.',
    lisanArab:
      'Ibn Manzur records multiple usages and derivatives in classical Arabic poetry and prose, tracing semantic development across pre-Islamic and Islamic literature.',
    meaning: 'The basic meaning encompasses both concrete and abstract applications in Quranic usage.',
  },
}

// ─── Mock semantic field data ─────────────────────────────────────────────────

const MOCK_SEMANTIC_FIELD: Record<string, { synonyms: string[]; antonyms: string[]; related: string[] }> = {
  default: {
    synonyms: ['مَثِيل', 'شَبِيه', 'نَظِير'],
    antonyms: ['ضِدّ', 'نَقِيض', 'مُقَابِل'],
    related: ['مُشْتَقّ', 'مُشَابِه', 'مُتَعَلِّق'],
  },
}

// ─── POS label map ────────────────────────────────────────────────────────────

function posLabel(pos: string): string {
  const map: Record<string, string> = {
    N: 'Noun', PN: 'Proper Noun', V: 'Verb', PRON: 'Pronoun',
    P: 'Preposition', CONJ: 'Conjunction', DET: 'Determiner',
    ADJ: 'Adjective', ADV: 'Adverb', INTJ: 'Interjection',
    PART: 'Particle', NEG: 'Negative Particle', FUT: 'Future Particle',
    IMPV: 'Imperative', INL: 'Quranic Initials',
  }
  return map[pos] ?? pos
}

// ─── Section card component ───────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          {title}
        </h2>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function WordStudyPanel(): React.ReactElement {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const ipc = useIpc()

  const word = searchParams.get('word') ?? ''
  const root = searchParams.get('root') ?? ''
  const pos = searchParams.get('pos') ?? ''
  const surah = searchParams.get('surah')
  const ayah = searchParams.get('ayah')

  const [occurrences, setOccurrences] = useState<WordOccurrenceRow[]>([])
  const [hadithResults, setHadithResults] = useState<LibrarySearchResult[]>([])
  const [loadingOcc, setLoadingOcc] = useState(false)
  const [loadingHadith, setLoadingHadith] = useState(false)
  const [activeTranslit, setActiveTranslit] = useState<'simple' | 'ala-lc' | 'buckwalter'>('ala-lc')

  // Transliterations
  const translitAlaLc = word ? transliterate(word, 'ala-lc') : ''
  const translitBuckwalter = word ? transliterate(word, 'buckwalter') : ''
  // Simple: strip special diacritics for readable ASCII version
  const translitSimple = word
    ? transliterate(word, 'ala-lc')
        .replace(/[āĀ]/g, 'a')
        .replace(/[ḥḤ]/g, 'h')
        .replace(/[ḍḌ]/g, 'd')
        .replace(/[ṭṬ]/g, 't')
        .replace(/[ẓẒ]/g, 'z')
        .replace(/[ṣṢ]/g, 's')
        .replace(/[ʿ]/g, "'")
        .replace(/[ʾ]/g, '')
    : ''

  const currentTranslit =
    activeTranslit === 'ala-lc' ? translitAlaLc :
    activeTranslit === 'buckwalter' ? translitBuckwalter :
    translitSimple

  const fetchOccurrences = useCallback(async () => {
    if (!root || !ipc) return
    setLoadingOcc(true)
    try {
      const rows = (await ipc.invoke('library:get-word-occurrences', root)) as WordOccurrenceRow[]
      setOccurrences(rows)
    } catch {
      setOccurrences([])
    } finally {
      setLoadingOcc(false)
    }
  }, [root, ipc])

  const fetchHadith = useCallback(async () => {
    if (!root || !ipc) return
    setLoadingHadith(true)
    try {
      const results = (await ipc.invoke('library:search', root, 5, 0, ['hadith'])) as LibrarySearchResult[]
      setHadithResults(results)
    } catch {
      setHadithResults([])
    } finally {
      setLoadingHadith(false)
    }
  }, [root, ipc])

  useEffect(() => {
    void fetchOccurrences()
    void fetchHadith()
  }, [fetchOccurrences, fetchHadith])

  const dictData = MOCK_DICTIONARY[root] ?? MOCK_DICTIONARY['default']!
  const semanticData = MOCK_SEMANTIC_FIELD[root] ?? MOCK_SEMANTIC_FIELD['default']!

  if (!word) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[var(--text-secondary)] gap-3">
        <div className="text-5xl">🔤</div>
        <p className="text-lg font-medium">No word selected</p>
        <p className="text-sm">Click on a word in the Quran reader to study it.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--bg-secondary)]">
      {/* Top nav bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-primary)] flex-shrink-0">
        <button
          onClick={() => void navigate(-1)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
        >
          ← Back
        </button>
        <div className="w-px h-4 bg-[var(--border-color)]" />
        {surah && ayah && (
          <>
            <Link
              to={`/irab/${surah}/${ayah}`}
              className="px-3 py-1.5 rounded-lg text-sm text-[var(--accent-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
            >
              I'rab Viewer
            </Link>
            <div className="w-px h-4 bg-[var(--border-color)]" />
          </>
        )}
        {root && (
          <Link
            to={`/conjugation?root=${encodeURIComponent(root)}`}
            className="px-3 py-1.5 rounded-lg text-sm text-[var(--accent-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
          >
            Conjugation Table
          </Link>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Hero: word display */}
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              {/* Arabic word */}
              <div
                className="text-6xl mb-2 text-[var(--text-primary)] leading-tight"
                dir="rtl"
                style={{ fontFamily: "'KFGQPC Uthmanic Hafs', 'Amiri', serif" }}
              >
                {word}
              </div>
              {/* Root */}
              {root && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Root</span>
                  <span
                    className="text-2xl text-[var(--accent-primary)] font-semibold"
                    dir="rtl"
                    style={{ fontFamily: "'IBM Plex Arabic', 'Amiri', serif" }}
                  >
                    {root}
                  </span>
                </div>
              )}
              {/* Transliteration selector + display */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex rounded-lg border border-[var(--border-color)] overflow-hidden text-xs">
                  {(['simple', 'ala-lc', 'buckwalter'] as const).map((sys) => (
                    <button
                      key={sys}
                      onClick={() => setActiveTranslit(sys)}
                      className={`px-2.5 py-1 transition-colors ${
                        activeTranslit === sys
                          ? 'bg-[var(--accent-primary)] text-white'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                      }`}
                    >
                      {sys === 'ala-lc' ? 'ALA-LC' : sys.charAt(0).toUpperCase() + sys.slice(1)}
                    </button>
                  ))}
                </div>
                <span className="text-sm text-[var(--text-secondary)] font-mono">{currentTranslit}</span>
              </div>
            </div>

            {/* Metadata chips */}
            <div className="flex flex-col gap-2 items-end shrink-0">
              {pos && (
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-medium">
                  {posLabel(pos)}
                </span>
              )}
              {surah && ayah && (
                <button
                  onClick={() => void navigate(`/quran/${surah}/${ayah}`)}
                  className="px-3 py-1 rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs hover:text-[var(--accent-primary)] transition-colors"
                >
                  {surah}:{ayah}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Occurrences in Quran */}
        <Section title={`Occurrences in Quran${occurrences.length ? ` (${occurrences.length})` : ''}`}>
          {loadingOcc ? (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : occurrences.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)] text-center py-2">
              {root ? 'No occurrences found in the database.' : 'Enter a root to search.'}
            </p>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {occurrences.map((occ, i) => (
                <button
                  key={i}
                  onClick={() => void navigate(`/quran/${occ.surah_number}/${occ.ayah_number}`)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors text-sm text-left group"
                >
                  <span
                    className="text-lg text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors"
                    dir="rtl"
                    style={{ fontFamily: "'KFGQPC Uthmanic Hafs', 'Amiri', serif" }}
                  >
                    {occ.surface_form}
                  </span>
                  <span className="text-[var(--text-secondary)] font-medium">
                    {occ.surah_number}:{occ.ayah_number}
                  </span>
                </button>
              ))}
            </div>
          )}
        </Section>

        {/* Occurrences in Hadith */}
        <Section title="Occurrences in Hadith">
          {loadingHadith ? (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : hadithResults.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)] text-center py-2">No hadith results found.</p>
          ) : (
            <div className="space-y-2">
              {hadithResults.slice(0, 5).map((r) => {
                const meta = r.metadata as { collectionKey?: string; hadithNumber?: string }
                return (
                  <button
                    key={r.id}
                    onClick={() =>
                      void navigate(
                        meta.collectionKey && meta.hadithNumber
                          ? `/hadith/${meta.collectionKey}/${meta.hadithNumber}`
                          : '/hadith'
                      )
                    }
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
                  >
                    <p
                      className="text-sm text-[var(--text-primary)] line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: r.excerpt }}
                    />
                    {meta.collectionKey && (
                      <span className="text-xs text-[var(--text-secondary)] mt-1 block">
                        {meta.collectionKey} #{meta.hadithNumber}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </Section>

        {/* Dictionary section */}
        <Section title="Dictionary">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 text-xs font-semibold">
                  المفردات — Al-Mufradat
                </span>
                <span className="text-xs text-[var(--text-secondary)]">al-Raghib al-Isfahani</span>
              </div>
              <p className="text-sm text-[var(--text-primary)] leading-relaxed">{dictData.mufradat}</p>
            </div>
            <div className="border-t border-[var(--border-color)] pt-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 text-xs font-semibold">
                  لسان العرب — Lisan al-Arab
                </span>
                <span className="text-xs text-[var(--text-secondary)]">Ibn Manzur</span>
              </div>
              <p className="text-sm text-[var(--text-primary)] leading-relaxed">{dictData.lisanArab}</p>
            </div>
          </div>
        </Section>

        {/* Semantic field */}
        <Section title="Semantic Field">
          <div className="space-y-3">
            {[
              { label: 'Synonyms', words: semanticData.synonyms, color: 'blue' },
              { label: 'Antonyms', words: semanticData.antonyms, color: 'red' },
              { label: 'Related', words: semanticData.related, color: 'amber' },
            ].map(({ label, words, color }) => (
              <div key={label}>
                <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">{label}</p>
                <div className="flex flex-wrap gap-2">
                  {words.map((w) => (
                    <button
                      key={w}
                      onClick={() =>
                        void navigate(`/word-study?word=${encodeURIComponent(w)}&root=${encodeURIComponent(w)}`)
                      }
                      className={`px-3 py-1 rounded-full text-sm border transition-colors hover:bg-${color}-50 dark:hover:bg-${color}-900/20`}
                      style={{ borderColor: 'var(--border-color)' }}
                      dir="rtl"
                    >
                      <span style={{ fontFamily: "'IBM Plex Arabic', 'Amiri', serif" }}>{w}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  )
}
