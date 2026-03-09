import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useIpc } from '../../hooks/useIpc'

// ─── Types ────────────────────────────────────────────────────────────────────

interface FactbookEntry {
  id: number
  slug: string
  title_arabic: string | null
  title_english: string
  type: 'person' | 'place' | 'event' | 'concept' | 'surah' | 'collection'
  summary: string | null
  body: string | null
}

interface AyahRef {
  id: number
  entry_id: number
  ayah_id: number
  surah_number: number
  ayah_number: number
  arabic_text: string
}

// ─── Type metadata ─────────────────────────────────────────────────────────────

const TYPE_META: Record<string, { label: string; color: string; icon: string }> = {
  person: { label: 'Person', color: 'bg-blue-100 text-blue-800', icon: '👤' },
  place: { label: 'Place', color: 'bg-green-100 text-green-800', icon: '📍' },
  event: { label: 'Event', color: 'bg-yellow-100 text-yellow-800', icon: '📅' },
  concept: { label: 'Concept', color: 'bg-fuchsia-100 text-fuchsia-800', icon: '💡' },
  surah: { label: 'Surah', color: 'bg-green-100 text-green-800', icon: '📖' },
  collection: { label: 'Collection', color: 'bg-slate-100 text-slate-700', icon: '📚' },
}

// ─── Static demo entries ──────────────────────────────────────────────────────

const DEMO_ENTRIES: FactbookEntry[] = [
  {
    id: 1,
    slug: 'ibrahim',
    title_arabic: 'إبراهيم',
    title_english: 'Ibrahim (Abraham)',
    type: 'person',
    summary:
      'The patriarch Prophet Ibrahim (Abraham), the father of monotheism, mentioned 69 times in the Quran.',
    body: `Ibrahim (عليه السلام) is one of the greatest Prophets in Islam, known as Khalilullah — the Friend of Allah. He is the ancestor of both the Arab and Israelite nations through his sons Ismail and Ishaq respectively.\n\nAllah tested Ibrahim with numerous trials, the most famous being his willingness to sacrifice his son at Allah's command. This event is commemorated annually during Eid al-Adha.\n\nIbrahim, together with his son Ismail, rebuilt the Ka'bah in Mecca, establishing it as the focal point of Islamic worship. He is mentioned by name 69 times in the Quran, more than any other prophet besides Musa.\n\n**Key Quranic Themes:**\n- His rejection of idolatry (Surah al-Anbiya' 21:51-70)\n- His argument about God with Nimrod (2:258)\n- Building the Ka'bah (2:127)\n- The sacrifice (37:99-111)\n- His prayer for Mecca (14:35-41)`,
  },
  {
    id: 2,
    slug: 'musa',
    title_arabic: 'موسى',
    title_english: 'Musa (Moses)',
    type: 'person',
    summary:
      'Prophet Musa, the most frequently mentioned prophet in the Quran (136 times), who led the Children of Israel out of Egypt.',
    body: `Musa ibn Imran (عليه السلام) is the most frequently mentioned prophet in the Quran, appearing by name 136 times. He is one of the five greatest prophets (Ulul Azm).\n\nAllah spoke to Musa directly, earning him the title Kalimullah (the one Allah spoke to). He was sent to Pharaoh (Fir'awn) and the Children of Israel (Banu Isra'il).\n\n**Key Events:**\n- Birth and rescue from Pharaoh's persecution\n- Encounter with Allah at the burning bush (28:29-30)\n- The ten plagues of Egypt\n- The parting of the Red Sea\n- The revelation of the Torah at Mount Sinai\n- The golden calf incident`,
  },
  {
    id: 3,
    slug: 'mecca',
    title_arabic: 'مكة المكرمة',
    title_english: 'Mecca (Makkah al-Mukarramah)',
    type: 'place',
    summary:
      "The holiest city in Islam, birthplace of the Prophet Muhammad ﷺ and site of the Masjid al-Haram and the Ka'bah.",
    body: `Mecca (مكة المكرمة — The Honored Mecca) is the holiest city in Islam, located in the Hejaz region of modern-day Saudi Arabia.\n\nIt is the birthplace of the Prophet Muhammad ﷺ (570 CE) and the site of the first revelation of the Quran (610 CE). The city houses the Masjid al-Haram, the largest mosque in the world, at the center of which stands the Ka'bah — the cubic structure that Muslims face during prayer.\n\n**Significance:**\n- Qiblah: Direction of Muslim prayer worldwide\n- Hajj: One of the five pillars of Islam, annual pilgrimage\n- Umrah: Minor pilgrimage, performable year-round\n- Haram zone: Special sanctity and legal protections\n\n**Quranic References:**\nMecca is referred to in the Quran as "Bakkah" (3:96), "Umm al-Qura" (Mother of Cities, 6:92, 42:7), and "al-Balad al-Amin" (the Secure City, 95:3).`,
  },
  {
    id: 4,
    slug: 'tawbah',
    title_arabic: 'التوبة',
    title_english: 'Tawbah (Repentance)',
    type: 'concept',
    summary:
      'The Islamic concept of sincere repentance and turning back to Allah, a central theme throughout the Quran.',
    body: `Tawbah (التوبة) — repentance — is one of the most important concepts in Islam. It refers to the act of turning away from sin and returning to Allah with sincere remorse.\n\n**Conditions of Valid Tawbah (scholars' consensus):**\n1. Cessation of the sin immediately\n2. Genuine remorse for having committed it\n3. Firm resolve not to return to it\n4. If the sin involved another person's rights: restoring those rights\n\n**Key Quranic Verses:**\n- "Indeed, Allah loves those who constantly repent" (2:222)\n- "Say: O My servants who have transgressed against themselves, do not despair of Allah's mercy" (39:53)\n- Surah al-Tawbah (Chapter 9) — the only surah without Bismillah at its start\n\n**Allah's Names related to Tawbah:**\n- At-Tawwab (the Ever-Relenting, Most Acceptor of Repentance)\n- Al-Ghafur (the Most Forgiving)\n- Al-Ghaffar (the Repeatedly Forgiving)`,
  },
  {
    id: 5,
    slug: 'zakat',
    title_arabic: 'الزكاة',
    title_english: 'Zakat (Obligatory Charity)',
    type: 'concept',
    summary:
      'The third pillar of Islam — mandatory annual almsgiving of 2.5% on qualifying wealth held for one lunar year.',
    body: `Zakat (الزكاة) is the third of the Five Pillars of Islam and refers to the obligatory annual payment of a portion of qualifying wealth to designated categories of recipients.\n\n**Calculation:**\n- Rate: 2.5% of qualifying assets\n- Threshold (nisab): Value equivalent to 85 grams of gold or 595 grams of silver\n- Condition: Assets held for one full lunar year (hawl)\n\n**Eight Categories of Recipients (Quran 9:60):**\n1. Al-Fuqara' (the poor)\n2. Al-Masakin (the needy)\n3. 'Amileen (zakat collectors)\n4. Al-Mu'allafatu qulubuhum (those whose hearts are to be reconciled)\n5. Fir-Riqab (freeing of slaves/captives)\n6. Al-Gharimeen (those in debt)\n7. Fi Sabilillah (in the cause of Allah)\n8. Ibn al-Sabil (the wayfarer)\n\n**Distinguished from Sadaqah:** Sadaqah is any voluntary charity; Zakat is obligatory.`,
  },
  {
    id: 6,
    slug: 'badr',
    title_arabic: 'بدر',
    title_english: 'Battle of Badr',
    type: 'event',
    summary:
      'The first major military engagement between the Muslims of Medina and the Quraysh of Mecca, in 2 AH (624 CE). A decisive Muslim victory.',
    body: `The Battle of Badr (غزوة بدر) took place on 17 Ramadan, 2 AH (13 March 624 CE) near the wells of Badr in the Hejaz region.\n\n**Background:**\nThe Muslims of Medina, led by the Prophet ﷺ, intercepted a Qurayshi trading caravan returning from Syria. The Quraysh dispatched a large army to protect the caravan and confront the Muslims.\n\n**Forces:**\n- Muslim army: approximately 313–317 men, poorly equipped\n- Qurayshi army: approximately 950–1,000 men, well-armed\n\n**Outcome:**\nA decisive Muslim victory. 70 Qurayshi soldiers were killed and 70 captured. Key Qurayshi leaders including Abu Jahl were killed. The Muslims lost 14 men.\n\n**Quranic Significance:**\nAllah sent angels to assist the Muslims (8:9). Surah al-Anfal (Chapter 8) was revealed largely in connection with this battle, addressing matters of war spoils, the etiquette of battle, and gratitude to Allah.\n\n**Legacy:**\nBadr is considered the most important battle in early Islamic history, establishing Muslim military credibility and demonstrating divine support for the nascent Muslim community.`,
  },
]

// ─── Entry card ────────────────────────────────────────────────────────────────

function EntryCard({ entry, onClick }: { entry: FactbookEntry; onClick: () => void }) {
  const meta = TYPE_META[entry.type] ?? TYPE_META.concept
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] hover:bg-[var(--bg-panel)] transition-colors"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{meta.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${meta.color}`}>
              {meta.label}
            </span>
          </div>
          <div className="font-medium text-[var(--text-primary)]">{entry.title_english}</div>
          {entry.title_arabic && (
            <div className="font-arabic text-[var(--text-secondary)] text-sm mt-0.5" dir="rtl">
              {entry.title_arabic}
            </div>
          )}
          {entry.summary && (
            <p className="text-sm text-[var(--text-muted)] mt-1 line-clamp-2">{entry.summary}</p>
          )}
        </div>
      </div>
    </button>
  )
}

// ─── Entry detail ──────────────────────────────────────────────────────────────

function EntryDetail({
  entry,
  ayahRefs,
  onBack,
}: {
  entry: FactbookEntry
  ayahRefs: AyahRef[]
  onBack: () => void
}) {
  const navigate = useNavigate()
  const meta = TYPE_META[entry.type] ?? TYPE_META.concept
  const bodyParagraphs = (entry.body ?? '').split('\n\n').filter(Boolean)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-[var(--accent-primary)] hover:underline mb-3"
        >
          ← Back to Factbook
        </button>
        <div className="flex items-start gap-4">
          <span className="text-4xl">{meta.icon}</span>
          <div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${meta.color}`}>
              {meta.label}
            </span>
            <h1 className="text-2xl font-['Cormorant_Garamond'] mt-1 text-[var(--text-primary)]">
              {entry.title_english}
            </h1>
            {entry.title_arabic && (
              <div className="font-arabic text-xl text-[var(--text-secondary)] mt-0.5" dir="rtl">
                {entry.title_arabic}
              </div>
            )}
          </div>
        </div>
        {entry.summary && (
          <p className="mt-3 text-[var(--text-secondary)] text-sm leading-relaxed border-l-2 border-[var(--accent-primary)] pl-3">
            {entry.summary}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        {/* Full article */}
        {bodyParagraphs.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)] mb-3">
              Article
            </h2>
            <div className="prose prose-sm max-w-none space-y-3">
              {bodyParagraphs.map((para, i) => {
                if (para.startsWith('**') && para.endsWith('**')) {
                  return (
                    <h3 key={i} className="font-semibold text-[var(--text-primary)]">
                      {para.slice(2, -2)}
                    </h3>
                  )
                }
                if (para.startsWith('- ') || para.includes('\n- ')) {
                  const items = para.split('\n').filter((l) => l.startsWith('- '))
                  return (
                    <ul
                      key={i}
                      className="list-disc list-inside space-y-1 text-[var(--text-secondary)]"
                    >
                      {items.map((item, j) => (
                        <li key={j}>{item.slice(2)}</li>
                      ))}
                    </ul>
                  )
                }
                return (
                  <p key={i} className="text-[var(--text-secondary)] leading-relaxed">
                    {para}
                  </p>
                )
              })}
            </div>
          </section>
        )}

        {/* Related Quran verses */}
        {ayahRefs.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)] mb-3">
              Related Quran Verses
            </h2>
            <div className="space-y-2">
              {ayahRefs.map((ref) => (
                <button
                  key={ref.id}
                  onClick={() => void navigate(`/quran/${ref.surah_number}/${ref.ayah_number}`)}
                  className="w-full text-left p-3 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[var(--accent-primary)] font-medium">
                      {ref.surah_number}:{ref.ayah_number}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">Open →</span>
                  </div>
                  <div className="font-arabic text-base text-[var(--text-primary)]" dir="rtl">
                    {ref.arabic_text}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Demo related hadiths (static) */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)] mb-3">
            Related Hadith
          </h2>
          <div className="p-4 rounded-lg bg-[var(--bg-panel)] text-sm text-[var(--text-muted)] text-center">
            Related hadith cross-references will appear here once hadith data is seeded.
          </div>
        </section>
      </div>
    </div>
  )
}

// ─── FactbookPanel ─────────────────────────────────────────────────────────────

function filterDemoEntries(q: string): FactbookEntry[] {
  const lower = q.toLowerCase()
  return DEMO_ENTRIES.filter(
    (e) =>
      e.title_english.toLowerCase().includes(lower) ||
      (e.summary ?? '').toLowerCase().includes(lower)
  )
}

export default function FactbookPanel(): React.ReactElement {
  const { slug } = useParams<{ slug?: string }>()
  const navigate = useNavigate()
  const ipc = useIpc()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FactbookEntry[]>([])
  const [selectedEntry, setSelectedEntry] = useState<FactbookEntry | null>(null)
  const [ayahRefs, setAyahRefs] = useState<AyahRef[]>([])
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [loading, setLoading] = useState(false)

  const types = ['all', 'person', 'place', 'event', 'concept', 'surah', 'collection'] as const

  // Initial load — show all demo entries
  useEffect(() => {
    setResults(DEMO_ENTRIES)
  }, [])

  // Search
  useEffect(() => {
    if (!query.trim()) {
      setResults(DEMO_ENTRIES)
      return
    }
    const search = async () => {
      setLoading(true)
      try {
        if (ipc) {
          const rows = (await ipc.invoke('library:search-factbook', {
            query: query.trim(),
            limit: 30,
          })) as FactbookEntry[]
          setResults(rows.length > 0 ? rows : filterDemoEntries(query))
        } else {
          setResults(filterDemoEntries(query))
        }
      } catch {
        setResults(filterDemoEntries(query))
      } finally {
        setLoading(false)
      }
    }
    const timer = setTimeout(() => {
      void search()
    }, 300)
    return () => clearTimeout(timer)
  }, [query, ipc])

  // Open entry from URL param
  useEffect(() => {
    if (!slug) {
      setSelectedEntry(null)
      return
    }
    const demo = DEMO_ENTRIES.find((e) => e.slug === slug)
    if (demo) {
      setSelectedEntry(demo)
      setAyahRefs([])
    }
  }, [slug])

  const openEntry = (entry: FactbookEntry) => {
    setSelectedEntry(entry)
    setAyahRefs([])
    void navigate(`/factbook/${entry.slug}`)
    if (ipc) {
      ipc
        .invoke('library:get-factbook-ayah-refs', { entryId: entry.id })
        .then((refs) => setAyahRefs(refs as AyahRef[]))
        .catch(() => setAyahRefs([]))
    }
  }

  const filtered = typeFilter === 'all' ? results : results.filter((e) => e.type === typeFilter)

  if (selectedEntry) {
    return (
      <EntryDetail
        entry={selectedEntry}
        ayahRefs={ayahRefs}
        onBack={() => {
          setSelectedEntry(null)
          void navigate('/factbook')
        }}
      />
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">📚</span>
          <div>
            <h1 className="text-xl font-['Cormorant_Garamond'] text-[var(--text-primary)]">
              Factbook
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              Islamic encyclopedia — people, places, events, concepts
            </p>
          </div>
        </div>
        {/* Search */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the Factbook…"
          className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)]"
        />
        {/* Type filter */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`text-xs px-2.5 py-1 rounded-full capitalize transition-colors ${
                typeFilter === t
                  ? 'bg-[var(--accent-primary)] text-white'
                  : 'bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              {t === 'all' ? `All (${results.length})` : `${TYPE_META[t]?.icon ?? ''} ${t}`}
            </button>
          ))}
        </div>
      </div>

      {/* Results list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-muted)] text-sm">
            No entries found for &ldquo;{query}&rdquo;
          </div>
        ) : (
          filtered.map((entry) => (
            <EntryCard key={entry.slug} entry={entry} onClick={() => openEntry(entry)} />
          ))
        )}
      </div>
    </div>
  )
}
