import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SynthesisSection {
  type: 'quran' | 'hadith' | 'tafsir' | 'scholarly'
  label: string
  icon: string
  results: SynthesisResult[]
}

interface SynthesisResult {
  id: string
  title: string
  excerpt: string
  route: string
}

// ─── Premium gate ─────────────────────────────────────────────────────────────

function PremiumGate(): React.ReactElement {
  const navigate = useNavigate()
  return (
    <div
      className="rounded-xl border p-6 text-center"
      style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}
    >
      <p className="text-3xl mb-3">✨</p>
      <h2 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
        Smart Search — Premium Feature
      </h2>
      <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
        Ask natural language questions and get synthesized answers from your entire library — Quran,
        hadith, tafsir, and scholarly commentary.
      </p>
      <ul
        className="text-sm text-left inline-flex flex-col gap-1.5 mb-5"
        style={{ color: 'var(--text-secondary)' }}
      >
        {[
          'Natural language question input',
          'Query decomposed into sub-searches',
          'Direct Quran verses + related hadiths',
          'Tafsir commentary & scholarly opinions',
          'Synopsis view with footnotes',
          '"Dig deeper" links for every result',
        ].map((f) => (
          <li key={f} className="flex items-start gap-2">
            <span style={{ color: 'var(--ae-green-600, #16a34a)' }}>✓</span>
            {f}
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="rounded-xl px-6 py-2.5 text-sm font-semibold transition-colors"
        style={{
          backgroundColor: 'var(--ae-gold-500, #f59e0b)',
          color: 'var(--ae-black-900, #111)',
        }}
        onClick={() => void navigate('/settings/account')}
      >
        Upgrade to Premium
      </button>
    </div>
  )
}

// ─── Synthesis result card ────────────────────────────────────────────────────

function SynthesisCard({ result }: { result: SynthesisResult }): React.ReactElement {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      className="w-full text-left rounded-xl border px-4 py-3 transition-all hover:border-[var(--accent-primary)]"
      style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}
      onClick={() => void navigate(result.route)}
    >
      <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
        {result.title}
      </p>
      <p
        className="text-xs leading-relaxed line-clamp-2"
        style={{ color: 'var(--text-secondary)' }}
        dangerouslySetInnerHTML={{ __html: result.excerpt }}
      />
    </button>
  )
}

// ─── Demo synthesis sections ──────────────────────────────────────────────────

const DEMO_SECTIONS: SynthesisSection[] = [
  {
    type: 'quran',
    label: 'Quranic Verses',
    icon: '📖',
    results: [
      {
        id: 'q2:45',
        title: 'Al-Baqarah 2:45',
        excerpt:
          'And seek help through <mark>patience</mark> and prayer. Indeed, it is a burden except on the humbly submissive.',
        route: '/quran/2/45',
      },
      {
        id: 'q2:153',
        title: 'Al-Baqarah 2:153',
        excerpt:
          'O you who have believed, seek help through <mark>patience</mark> and prayer. Indeed, Allah is with the patient.',
        route: '/quran/2/153',
      },
    ],
  },
  {
    type: 'hadith',
    label: 'Hadith',
    icon: '📜',
    results: [
      {
        id: 'bk1',
        title: 'Sahih al-Bukhari #1',
        excerpt: 'Actions are judged by intentions…',
        route: '/hadith/bukhari/1',
      },
    ],
  },
  {
    type: 'tafsir',
    label: 'Tafsir Commentary',
    icon: '🔍',
    results: [
      {
        id: 'ik2:45',
        title: 'Ibn Kathir on 2:45',
        excerpt: 'Allah commands the believers to seek aid with <mark>patience</mark>…',
        route: '/tafsir/2/45',
      },
    ],
  },
]

// ─── SmartSearch ──────────────────────────────────────────────────────────────

export default function SmartSearch(): React.ReactElement {
  const [unlocked] = useState(false) // set to true when user has Premium
  const [question, setQuestion] = useState('')
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!unlocked) {
    return (
      <div className="max-w-lg mx-auto mt-8">
        <PremiumGate />
      </div>
    )
  }

  async function doSearch(e?: React.FormEvent) {
    e?.preventDefault()
    if (!question.trim()) return
    setLoading(true)
    setSearched(false)
    // TODO: invoke AI-powered search when backend available
    await new Promise((r) => setTimeout(r, 600))
    setLoading(false)
    setSearched(true)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Question input */}
      <form onSubmit={(e) => void doSearch(e)} className="flex gap-2">
        <input
          type="text"
          dir="auto"
          className="flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--accent-primary)]"
          style={{
            borderColor: 'var(--border-subtle)',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)',
          }}
          placeholder={'Ask a question, e.g. \u201cWhat does Islam say about patience?\u201d'}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button
          type="submit"
          className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors"
          style={{
            backgroundColor: 'var(--accent-primary)',
            color: 'var(--ae-black-900, #111)',
          }}
        >
          Ask
        </button>
      </form>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-7 h-7 rounded-full border-2 border-[var(--accent-primary)] border-t-transparent animate-spin" />
        </div>
      )}

      {/* Demo results */}
      {!loading && searched && (
        <>
          {/* Synopsis */}
          <div
            className="rounded-xl border px-5 py-4"
            style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}
          >
            <p
              className="text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: 'var(--text-muted)' }}
            >
              Synopsis
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              Islam places great emphasis on <strong>patience (sabr)</strong>. The Quran mentions
              patience in over 90 verses. It is considered one of the highest virtues…
            </p>
          </div>

          {/* Sections */}
          {DEMO_SECTIONS.map((section) => (
            <section key={section.type}>
              <div className="flex items-center gap-2 mb-2">
                <span>{section.icon}</span>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {section.label}
                </h3>
              </div>
              <div className="flex flex-col gap-2">
                {section.results.map((r) => (
                  <SynthesisCard key={r.id} result={r} />
                ))}
              </div>
            </section>
          ))}
        </>
      )}
    </div>
  )
}
