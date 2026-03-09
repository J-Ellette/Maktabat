import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useIpc } from '../../hooks/useIpc'
import { analyzeVerseIrab, ROLE_COLORS } from '@arabic-nlp/irab'
import type { IrabAnalysis } from '@arabic-nlp/irab'
import type { AyahBundle } from '@shared/types/ipc'

// ─── Grammar reference mock data ──────────────────────────────────────────────

const GRAMMAR_RULES = [
  {
    title: 'Nominal Sentence (الجملة الاسمية)',
    desc: 'A sentence consisting of a topic (مبتدأ, nominative) and a predicate (خبر), without an explicit verb.',
  },
  {
    title: 'Verbal Sentence (الجملة الفعلية)',
    desc: 'A sentence beginning with a verb (فعل), followed by the doer (فاعل, nominative) and optionally an object (مفعول به, accusative).',
  },
  {
    title: 'Nominative Case (الرفع)',
    desc: 'Marked by ضَمَّة (u-vowel). Used for subjects, topics, and predicates of nominal sentences.',
  },
  {
    title: 'Accusative Case (النصب)',
    desc: 'Marked by فَتْحَة (a-vowel). Used for direct objects, complements, and adverbials.',
  },
  {
    title: 'Genitive Case (الجر)',
    desc: 'Marked by كَسْرَة (i-vowel). Used after prepositions and in construct phrases (إضافة).',
  },
  {
    title: 'Construct Phrase (الإضافة)',
    desc: 'Two nouns in sequence where the first (مضاف) is indefinite and the second (مضاف إليه) is in the genitive case.',
  },
]

// ─── Role explanation card ─────────────────────────────────────────────────────

interface WordNode {
  surfaceForm: string
  pos: string
  caseMarker: string | null
  wordPosition: number
  irab: IrabAnalysis
}

function ExplanationCard({ node, onClose }: { node: WordNode; onClose: () => void }) {
  return (
    <div className="absolute z-50 top-full mt-2 left-1/2 -translate-x-1/2 w-72 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] shadow-xl p-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div
          className="text-3xl"
          dir="rtl"
          style={{ fontFamily: "'KFGQPC Uthmanic Hafs', 'Amiri', serif" }}
        >
          {node.surfaceForm}
        </div>
        <button
          onClick={onClose}
          className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mt-1"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: node.irab.color }}
          />
          <div>
            <span className="text-sm font-semibold text-[var(--text-primary)]">{node.irab.roleLabel}</span>
            <span
              className="ml-2 text-sm text-[var(--text-secondary)]"
              dir="rtl"
              style={{ fontFamily: "'IBM Plex Arabic', 'Amiri', serif" }}
            >
              {node.irab.roleLabelArabic}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-secondary)] w-14 flex-shrink-0">Case:</span>
          <span className="text-xs text-[var(--text-primary)]">
            {node.irab.caseLabel}{' '}
            <span
              dir="rtl"
              style={{ fontFamily: "'IBM Plex Arabic', 'Amiri', serif" }}
              className="text-[var(--text-secondary)]"
            >
              ({node.irab.caseLabelArabic})
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-secondary)] w-14 flex-shrink-0">POS:</span>
          <span className="text-xs text-[var(--text-primary)]">{node.pos}</span>
        </div>

        <p className="text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-color)] pt-2 mt-2">
          {node.irab.explanation}
        </p>
      </div>
    </div>
  )
}

// ─── Parse tree word chip ──────────────────────────────────────────────────────

function WordChip({
  node,
  isActive,
  onClick,
}: {
  node: WordNode
  isActive: boolean
  onClick: (e: React.MouseEvent) => void
}) {
  return (
    <div className="relative flex-shrink-0">
      <button
        onClick={onClick}
        className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border-2 transition-all cursor-pointer select-none
          ${isActive ? 'shadow-lg scale-105' : 'hover:scale-102 hover:shadow-md'}`}
        style={{
          borderColor: isActive ? node.irab.color : 'var(--border-color)',
          backgroundColor: isActive ? `${node.irab.color}20` : 'var(--bg-primary)',
        }}
      >
        {/* Arabic word */}
        <span
          className="text-xl leading-tight text-[var(--text-primary)]"
          dir="rtl"
          style={{ fontFamily: "'KFGQPC Uthmanic Hafs', 'Amiri', serif" }}
        >
          {node.surfaceForm}
        </span>
        {/* Grammatical role */}
        <span
          className="text-xs font-medium px-1.5 py-0.5 rounded-full"
          style={{
            backgroundColor: `${node.irab.color}25`,
            color: node.irab.color,
          }}
        >
          {node.irab.roleLabelArabic}
        </span>
      </button>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function IrabViewer(): React.ReactElement {
  const { surah: surahParam, ayah: ayahParam } = useParams<{ surah: string; ayah: string }>()
  const navigate = useNavigate()
  const ipc = useIpc()

  const surahNumber = parseInt(surahParam ?? '1', 10)
  const ayahNumber = parseInt(ayahParam ?? '1', 10)

  const [bundle, setBundle] = useState<AyahBundle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeWordIdx, setActiveWordIdx] = useState<number | null>(null)

  const fetchAyah = useCallback(async () => {
    if (!ipc) return
    setLoading(true)
    setError(null)
    try {
      const bundles = (await ipc.invoke('library:get-ayahs-by-surah', surahNumber)) as AyahBundle[]
      const found = bundles.find((b) => b.ayah.ayahNumber === ayahNumber)
      if (found) {
        setBundle(found)
      } else {
        setError(`Ayah ${surahNumber}:${ayahNumber} not found.`)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load ayah')
    } finally {
      setLoading(false)
    }
  }, [ipc, surahNumber, ayahNumber])

  useEffect(() => {
    void fetchAyah()
  }, [fetchAyah])

  // Build word nodes with i'rab analysis
  const wordNodes: WordNode[] = React.useMemo(() => {
    if (!bundle) return []
    const morph = bundle.morphology
    const irabResults = analyzeVerseIrab(
      morph.map((x) => ({ pos: x.pos, caseMarker: x.caseMarker }))
    )
    return morph.map((m, i) => ({
      surfaceForm: m.surfaceForm,
      pos: m.pos,
      caseMarker: m.caseMarker,
      wordPosition: m.wordPosition,
      irab: irabResults[i] ?? irabResults[0],
    }))
  }, [bundle])

  const activeWord = activeWordIdx !== null ? (wordNodes[activeWordIdx] ?? null) : null

  // Legend
  const legendItems = [
    { label: 'Subject / Topic', labelAr: 'فاعل / مبتدأ', color: ROLE_COLORS.subject },
    { label: 'Predicate', labelAr: 'خبر', color: ROLE_COLORS.predicate },
    { label: 'Object', labelAr: 'مفعول به', color: ROLE_COLORS.object },
    { label: 'Prep. Phrase', labelAr: 'شبه جملة', color: ROLE_COLORS['prep-phrase'] },
    { label: 'Conjunction', labelAr: 'حرف عطف', color: ROLE_COLORS.conjunction },
    { label: 'Verb', labelAr: 'فعل', color: ROLE_COLORS.verb },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-[var(--text-secondary)]">
        <div className="text-4xl">⚠️</div>
        <p>{error}</p>
        <button
          onClick={() => void navigate(-1)}
          className="px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-sm"
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="flex h-full overflow-hidden bg-[var(--bg-secondary)]">
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top nav */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-primary)] flex-shrink-0">
          <button
            onClick={() => void navigate(-1)}
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1"
          >
            ← Back
          </button>
          <div className="w-px h-4 bg-[var(--border-color)]" />
          <h1 className="text-sm font-semibold text-[var(--text-primary)]">
            I'rab Viewer — {surahNumber}:{ayahNumber}
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <Link
              to={`/word-study?surah=${surahNumber}&ayah=${ayahNumber}`}
              className="text-sm text-[var(--accent-primary)] hover:underline"
            >
              Word Study
            </Link>
            <div className="w-px h-4 bg-[var(--border-color)]" />
            <button
              onClick={() => void navigate(`/quran/${surahNumber}/${ayahNumber}`)}
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Open in Reader ↗
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Arabic verse */}
          {bundle && (
            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-5">
              <div
                className="text-3xl leading-[2.2] text-right text-[var(--text-primary)]"
                dir="rtl"
                style={{ fontFamily: "'KFGQPC Uthmanic Hafs', 'Amiri', serif" }}
              >
                {bundle.ayah.arabicText}
              </div>
              {bundle.translations[0] && (
                <p className="mt-3 text-sm text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-color)] pt-3">
                  {bundle.translations[0].text}
                </p>
              )}
            </div>
          )}

          {/* Color legend */}
          <div className="flex flex-wrap gap-3">
            {legendItems.map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-[var(--text-secondary)]">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Parse tree */}
          {wordNodes.length === 0 ? (
            <div className="text-center py-8 text-[var(--text-secondary)]">
              <p>No morphology data available for this verse.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-6">
              <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-5">
                Word-by-Word Parse
              </h2>
              {/* Word chips, displayed RTL */}
              <div
                className="flex flex-wrap gap-3 justify-end"
                dir="rtl"
                onClick={() => setActiveWordIdx(null)}
              >
                {wordNodes.map((node, i) => (
                  <div key={node.wordPosition} className="relative">
                    <WordChip
                      node={node}
                      isActive={activeWordIdx === i}
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveWordIdx(activeWordIdx === i ? null : i)
                      }}
                    />
                    {activeWordIdx === i && activeWord && (
                      <ExplanationCard
                        node={activeWord}
                        onClose={() => setActiveWordIdx(null)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick study links */}
          {wordNodes.length > 0 && (
            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4">
              <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
                Study Words
              </h2>
              <div className="flex flex-wrap gap-2" dir="rtl">
                {wordNodes.map((node) => (
                  <Link
                    key={node.wordPosition}
                    to={`/word-study?word=${encodeURIComponent(node.surfaceForm)}&pos=${encodeURIComponent(node.pos)}&surah=${surahNumber}&ayah=${ayahNumber}`}
                    className="px-3 py-1 rounded-lg border border-[var(--border-color)] text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                    style={{ fontFamily: "'KFGQPC Uthmanic Hafs', 'Amiri', serif" }}
                  >
                    {node.surfaceForm}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grammar reference sidebar */}
      <div className="w-72 flex-shrink-0 border-l border-[var(--border-color)] bg-[var(--bg-primary)] overflow-y-auto">
        <div className="px-4 py-3 border-b border-[var(--border-color)]">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Grammar Reference</h2>
        </div>
        <div className="p-4 space-y-4">
          {GRAMMAR_RULES.map((rule) => (
            <div key={rule.title} className="border-b border-[var(--border-color)] last:border-0 pb-4 last:pb-0">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">{rule.title}</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{rule.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
