import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/app-store'
import { useIpc } from '../../hooks/useIpc'

// ────────────────────────────────────────────────────────────────
// Static sample data (will come from IPC in Phase 3+)
// ────────────────────────────────────────────────────────────────
const VERSE_OF_DAY = {
  surah: 'Al-Baqarah',
  reference: '2:286',
  arabic: 'لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا',
  translation: 'Allah does not burden a soul beyond that it can bear.',
  tafsirSnippet:
    'Ibn Kathir explains: This verse provides immense comfort to every believer, for Allah — in His infinite mercy — does not place upon any soul a burden greater than it can carry.',
}

const HADITH_OF_DAY = {
  collection: 'Sahih al-Bukhari',
  reference: 'Book 1, Hadith 1',
  arabic: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
  translation: 'Actions are judged by intentions, and every person will have what they intended.',
  narrator: 'Umar ibn al-Khattab (رضي الله عنه)',
  grade: 'Sahih',
}

const DAILY_DHIKR = {
  arabic: 'سُبْحَانَ ٱللَّهِ وَبِحَمْدِهِ',
  transliteration: 'Subḥānallāhi wa biḥamdih',
  translation: 'Glory be to Allah and praise Him.',
  benefit:
    'Whoever says this 100 times in the morning and evening, no one will come on the Day of Resurrection with anything better, except one who said the same or more. (Muslim)',
}

const RECENT_RESOURCES = [
  { id: 'r1', title: 'Quran — Al-Fatiha', route: '/quran/1', icon: '📖' },
  { id: 'r2', title: 'Sahih al-Bukhari — Hadith 1', route: '/hadith/bukhari/1', icon: '📜' },
  { id: 'r3', title: 'Tafsir Ibn Kathir — Al-Fatiha', route: '/quran/1', icon: '🔎' },
]

const RECENT_NOTES = [
  {
    id: 'n1',
    body: "The opening surah is recited in every rak'ah of salah…",
    type: 'study',
    ref: 'Quran 1:1',
  },
  {
    id: 'n2',
    body: 'Actions are defined by their intentions — key principle in fiqh…',
    type: 'reflection',
    ref: 'Bukhari 1:1',
  },
]

// ────────────────────────────────────────────────────────────────
// Subcomponents
// ────────────────────────────────────────────────────────────────
function Card({
  title,
  children,
  className = '',
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-5 flex flex-col gap-3 ${className}`}
    >
      <h3 className="font-latin-display text-base font-semibold text-[var(--text-primary)]">
        {title}
      </h3>
      {children}
    </div>
  )
}

function VerseOfDayCard() {
  const navigate = useNavigate()
  const [showTafsir, setShowTafsir] = useState(false)

  return (
    <Card title="✨ Verse of the Day">
      <div className="text-center">
        <p className="quran-text text-xl leading-relaxed mb-3 text-[var(--text-primary)]">
          {VERSE_OF_DAY.arabic}
        </p>
        <p className="font-latin-body text-sm text-[var(--text-secondary)] italic mb-1">
          "{VERSE_OF_DAY.translation}"
        </p>
        <p className="text-xs text-[var(--accent-primary)] font-semibold">
          — {VERSE_OF_DAY.surah} ({VERSE_OF_DAY.reference})
        </p>
      </div>
      {showTafsir && (
        <div className="bg-[var(--bg-primary)] rounded-lg p-3 text-sm text-[var(--text-secondary)] border border-[var(--border-color)]">
          {VERSE_OF_DAY.tafsirSnippet}
        </div>
      )}
      <div className="flex gap-2">
        <button
          onClick={() => setShowTafsir((v) => !v)}
          className="flex-1 text-xs py-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] transition-colors"
        >
          {showTafsir ? 'Hide Tafsir' : 'Show Tafsir'}
        </button>
        <button
          onClick={() => void navigate('/quran/2/286')}
          className="flex-1 text-xs py-1.5 rounded-lg bg-[var(--accent-primary)] text-white hover:opacity-90 transition-opacity"
        >
          Open in Quran
        </button>
      </div>
    </Card>
  )
}

function HadithOfDayCard() {
  return (
    <Card title="📜 Hadith of the Day">
      <div className="text-center">
        <p
          className="font-arabic-body text-lg leading-relaxed mb-2 text-[var(--text-primary)]"
          dir="rtl"
        >
          {HADITH_OF_DAY.arabic}
        </p>
        <p className="font-latin-body text-sm text-[var(--text-secondary)] italic mb-1">
          "{HADITH_OF_DAY.translation}"
        </p>
        <p className="text-xs text-[var(--text-secondary)]">Narrated by {HADITH_OF_DAY.narrator}</p>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-[var(--text-secondary)]">
          {HADITH_OF_DAY.collection} — {HADITH_OF_DAY.reference}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-[var(--ae-green-100)] text-[var(--ae-green-700)] font-semibold">
          {HADITH_OF_DAY.grade}
        </span>
      </div>
    </Card>
  )
}

function DhikrCard() {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    void navigator.clipboard.writeText(
      `${DAILY_DHIKR.arabic}\n${DAILY_DHIKR.transliteration}\n${DAILY_DHIKR.translation}`
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card title="🤲 Daily Dhikr">
      <div className="text-center">
        <p className="quran-text text-2xl leading-relaxed text-[var(--accent-primary)] mb-2">
          {DAILY_DHIKR.arabic}
        </p>
        <p className="font-mono text-sm text-[var(--text-secondary)] italic mb-1">
          {DAILY_DHIKR.transliteration}
        </p>
        <p className="font-latin-body text-sm text-[var(--text-primary)] font-medium">
          {DAILY_DHIKR.translation}
        </p>
      </div>
      <p className="text-xs text-[var(--text-secondary)] bg-[var(--bg-primary)] rounded-lg p-2 border border-[var(--border-color)]">
        {DAILY_DHIKR.benefit}
      </p>
      <button
        onClick={handleCopy}
        className="w-full text-xs py-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] transition-colors"
      >
        {copied ? '✓ Copied!' : 'Copy dhikr'}
      </button>
    </Card>
  )
}

function ReadingPlanCard() {
  const navigate = useNavigate()
  const ipc = useIpc()
  const [planRows, setPlanRows] = useState<
    { plan_key: string; start_date: string; target_date: string; progress_data: string }[]
  >([])

  useEffect(() => {
    if (!ipc) return
    ipc
      .invoke('user:get-all-reading-plans')
      .then((rows) => {
        if (Array.isArray(rows)) {
          setPlanRows(rows as typeof planRows)
        }
      })
      .catch(() => {})
  }, [ipc])

  // Pick the first active plan to display
  const firstRow = planRows[0]

  if (!firstRow) {
    return (
      <Card title="📅 Reading Plans">
        <p className="text-sm text-[var(--text-secondary)]">No active reading plan.</p>
        <button
          onClick={() => void navigate('/reading-plans')}
          className="w-full text-xs py-1.5 rounded-lg bg-[var(--accent-primary)] text-white hover:opacity-90 transition-opacity"
        >
          Start a Plan
        </button>
      </Card>
    )
  }

  let progress: { completedDays: Record<string, boolean> } = { completedDays: {} }
  try {
    progress = JSON.parse(firstRow.progress_data) as typeof progress
  } catch {
    /* ignore */
  }

  const daysBetween = (a: string, b: string) =>
    Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000))
  const totalDays = daysBetween(firstRow.start_date, firstRow.target_date) + 1
  const completed = Object.values(progress.completedDays).filter(Boolean).length
  const pct = Math.round((completed / Math.max(1, totalDays)) * 100)
  const planName = (progress as Record<string, unknown>).planName as string | undefined
  const displayName = planName ?? firstRow.plan_key.replace(/-/g, ' ')
  const dayNum = Math.max(
    1,
    daysBetween(firstRow.start_date, new Date().toISOString().split('T')[0] ?? '') + 1
  )

  return (
    <Card title="📅 Reading Plan">
      <div>
        <div className="flex justify-between text-sm mb-1.5">
          <span className="font-medium text-[var(--text-primary)] capitalize">{displayName}</span>
          <span className="text-[var(--text-secondary)]">
            Day {dayNum} / {totalDays}
          </span>
        </div>
        <div className="h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden border border-[var(--border-color)]">
          <div
            className="h-full bg-[var(--accent-primary)] rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-[var(--text-secondary)] mt-1">{pct}% complete</p>
      </div>
      <button
        onClick={() => void navigate('/reading-plans')}
        className="w-full text-xs py-1.5 rounded-lg bg-[var(--accent-primary)] text-white hover:opacity-90 transition-opacity"
      >
        Continue Reading
      </button>
    </Card>
  )
}

function RecentResourcesCard() {
  const navigate = useNavigate()
  return (
    <Card title="🕐 Recent Resources">
      <ul className="flex flex-col gap-1.5">
        {RECENT_RESOURCES.map((r) => (
          <li key={r.id}>
            <button
              onClick={() => void navigate(r.route)}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--bg-primary)] transition-colors text-left"
            >
              <span className="text-base">{r.icon}</span>
              <span className="text-sm text-[var(--text-primary)] truncate">{r.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </Card>
  )
}

function RecentNotesCard() {
  const ipc = useIpc()
  const navigate = useNavigate()
  const [notes, setNotes] = useState<
    { id: number; resource_key: string; content_ref: string; type: string; body: string }[]
  >([])

  useEffect(() => {
    if (!ipc) return
    void (async () => {
      try {
        const data = await ipc.invoke('user:get-notes')
        const all = data as {
          id: number
          resource_key: string
          content_ref: string
          type: string
          body: string
        }[]
        setNotes(all.slice(0, 3))
      } catch {
        setNotes([])
      }
    })()
  }, [ipc])

  const displayNotes =
    notes.length > 0
      ? notes
      : RECENT_NOTES.map((n, i) => ({
          id: i,
          resource_key: n.ref,
          content_ref: n.ref,
          type: n.type,
          body: n.body,
        }))

  return (
    <Card title="📝 Recent Notes">
      <ul className="flex flex-col gap-2">
        {displayNotes.map((n) => (
          <li
            key={n.id}
            className="p-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)]"
          >
            <p className="text-xs text-[var(--text-secondary)] mb-0.5">{n.content_ref}</p>
            <p className="text-sm text-[var(--text-primary)] line-clamp-2">{n.body}</p>
          </li>
        ))}
      </ul>
      <button
        onClick={() => void navigate('/notes')}
        className="mt-2 text-xs text-[var(--accent-primary)] hover:underline"
      >
        View all notes →
      </button>
    </Card>
  )
}

// ────────────────────────────────────────────────────────────────
// "Everything" view
// ────────────────────────────────────────────────────────────────
function EverythingView() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-6 auto-rows-min">
      <VerseOfDayCard />
      <DhikrCard />
      <HadithOfDayCard />
      <ReadingPlanCard />
      <RecentResourcesCard />
      <RecentNotesCard />
    </div>
  )
}

// ────────────────────────────────────────────────────────────────
// "Reference" view
// ────────────────────────────────────────────────────────────────
function ReferenceView() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [refInput, setRefInput] = useState('')

  const quickLinks = [
    { label: 'Al-Fatiha (1:1–7)', route: '/quran/1', icon: '📖' },
    { label: 'Ayat al-Kursi (2:255)', route: '/quran/2/255', icon: '✨' },
    { label: 'Al-Ikhlas (112)', route: '/quran/112', icon: '📖' },
    { label: 'Sahih Bukhari', route: '/hadith/bukhari', icon: '📜' },
    { label: 'Sahih Muslim', route: '/hadith/muslim', icon: '📜' },
    { label: 'Reading Plans', route: '/reading-plans', icon: '📅' },
  ]

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      void navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  function handleRefNavigate(e: React.FormEvent) {
    e.preventDefault()
    const input = refInput.trim()
    if (!input) return
    const quranMatch = input.match(/^(\d+)(?::(\d+))?$/)
    if (quranMatch) {
      const surah = quranMatch[1]
      const ayah = quranMatch[2]
      void navigate(ayah ? `/quran/${surah}/${ayah}` : `/quran/${surah}`)
    } else {
      void navigate(`/search?q=${encodeURIComponent(input)}`)
    }
    setRefInput('')
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto">
      {/* Quick search */}
      <div>
        <h3 className="font-latin-display text-lg font-semibold text-[var(--text-primary)] mb-3">
          🔍 Search the Library
        </h3>
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Quran, Hadith, Tafsir…"
            className="flex-1 px-4 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-colors"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-[var(--accent-primary)] text-white hover:opacity-90 transition-opacity font-medium"
          >
            Search
          </button>
        </form>
      </div>

      {/* Quick navigate */}
      <div>
        <h3 className="font-latin-display text-lg font-semibold text-[var(--text-primary)] mb-3">
          📍 Navigate to Surah / Ayah
        </h3>
        <form onSubmit={handleRefNavigate} className="flex gap-2">
          <input
            type="text"
            value={refInput}
            onChange={(e) => setRefInput(e.target.value)}
            placeholder="e.g.  2:255  or  112"
            className="flex-1 px-4 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-primary)] font-mono text-sm transition-colors"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-[var(--accent-primary)] text-white hover:opacity-90 transition-opacity font-medium"
          >
            Go
          </button>
        </form>
        <p className="text-xs text-[var(--text-secondary)] mt-1.5">
          Enter a surah number (e.g. <code className="font-mono">112</code>) or surah:ayah (e.g.{' '}
          <code className="font-mono">2:255</code>)
        </p>
      </div>

      {/* Quick links */}
      <div>
        <h3 className="font-latin-display text-lg font-semibold text-[var(--text-primary)] mb-3">
          ⚡ Quick Open
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {quickLinks.map((link) => (
            <button
              key={link.route}
              onClick={() => void navigate(link.route)}
              className="flex items-center gap-2 p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)] hover:border-[var(--accent-primary)] transition-colors text-left"
            >
              <span className="text-lg">{link.icon}</span>
              <span className="text-sm font-medium text-[var(--text-primary)] leading-tight">
                {link.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────
// Dashboard root
// ────────────────────────────────────────────────────────────────
export default function Dashboard(): React.ReactElement {
  const dashboardView = useAppStore((s) => s.dashboardView)
  const setDashboardView = useAppStore((s) => s.setDashboardView)

  return (
    <div className="flex flex-col h-full">
      {/* View switcher header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[var(--border-color)] flex-shrink-0">
        <div>
          <h1 className="font-arabic-display text-2xl font-bold text-[var(--accent-primary)]">
            مكتبة
          </h1>
          <p className="font-latin-body text-sm text-[var(--text-secondary)]">
            Maktabat — Your Islamic Library
          </p>
        </div>
        <div className="flex rounded-lg border border-[var(--border-color)] overflow-hidden">
          <button
            onClick={() => setDashboardView('everything')}
            aria-pressed={dashboardView === 'everything'}
            className={`px-4 py-1.5 text-sm font-medium transition-colors ${
              dashboardView === 'everything'
                ? 'bg-[var(--accent-primary)] text-white'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            Everything
          </button>
          <button
            onClick={() => setDashboardView('reference')}
            aria-pressed={dashboardView === 'reference'}
            className={`px-4 py-1.5 text-sm font-medium transition-colors ${
              dashboardView === 'reference'
                ? 'bg-[var(--accent-primary)] text-white'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            Reference
          </button>
        </div>
      </div>

      {/* View content */}
      <div className="flex-1 overflow-y-auto">
        {dashboardView === 'everything' ? <EverythingView /> : <ReferenceView />}
      </div>
    </div>
  )
}
