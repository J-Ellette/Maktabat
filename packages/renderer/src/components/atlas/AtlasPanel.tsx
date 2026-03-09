import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// ─── Types ────────────────────────────────────────────────────────────────────

interface MapLayer {
  id: string
  label: string
  description: string
  enabled: boolean
}

interface HistoricalSite {
  id: string
  name: string
  arabicName?: string
  lat: number // normalized 0-100 for SVG
  lng: number // normalized 0-100 for SVG
  type: 'city' | 'battle' | 'route' | 'pilgrimage'
  era: number // CE year
  description: string
  surahRefs?: Array<{ surah: number; ayah: number; label: string }>
}

// ─── Static data ──────────────────────────────────────────────────────────────

const INITIAL_LAYERS: MapLayer[] = [
  {
    id: 'physical',
    label: 'Physical Geography',
    description: 'Mountains, rivers, deserts',
    enabled: true,
  },
  {
    id: 'political',
    label: 'Political Boundaries',
    description: 'Boundaries by selected era',
    enabled: false,
  },
  {
    id: 'hajj',
    label: 'Hajj & Trade Routes',
    description: 'Ancient caravan routes',
    enabled: true,
  },
  {
    id: 'conquest',
    label: 'Conquest & Expansion',
    description: 'Spread of Islam 622–750 CE',
    enabled: false,
  },
  {
    id: 'madhabs',
    label: 'Madhab Spread',
    description: 'Four schools of jurisprudence',
    enabled: false,
  },
  {
    id: 'population',
    label: 'Muslim Population',
    description: 'Modern Muslim population density',
    enabled: false,
  },
]

const HISTORICAL_SITES: HistoricalSite[] = [
  {
    id: 'mecca',
    name: 'Mecca (Makkah)',
    arabicName: 'مكة المكرمة',
    lat: 44,
    lng: 57,
    type: 'city',
    era: 570,
    description:
      "Birthplace of the Prophet ﷺ and site of the Masjid al-Haram. The Ka'bah — the first house of worship built by Ibrahim and Ismail — stands at its center. The focal point of Hajj.",
    surahRefs: [
      { surah: 3, ayah: 96, label: 'First house of worship (Bakkah)' },
      { surah: 14, ayah: 35, label: "Ibrahim's prayer for Mecca" },
      { surah: 95, ayah: 3, label: 'The Secure City' },
    ],
  },
  {
    id: 'medina',
    name: 'Medina (Al-Madinah)',
    arabicName: 'المدينة المنورة',
    lat: 43,
    lng: 53,
    type: 'city',
    era: 622,
    description:
      'City of the Prophet ﷺ — where he migrated (Hijrah) in 622 CE. Home of Masjid al-Nabawi. The political and spiritual capital of the early Muslim community and the Caliphate.',
    surahRefs: [],
  },
  {
    id: 'jerusalem',
    name: 'Jerusalem (Al-Quds)',
    arabicName: 'القدس',
    lat: 40,
    lng: 46,
    type: 'city',
    era: 630,
    description:
      "The first Qiblah of Islam and the site of the Isra' and Mi'raj (night journey). Home of Masjid al-Aqsa, the third holiest mosque in Islam.",
    surahRefs: [{ surah: 17, ayah: 1, label: "Isra' wal-Mi'raj — al-Masjid al-Aqsa" }],
  },
  {
    id: 'badr',
    name: 'Wells of Badr',
    arabicName: 'بدر',
    lat: 43.5,
    lng: 52,
    type: 'battle',
    era: 624,
    description:
      'Site of the Battle of Badr (2 AH / 624 CE) — the first major military engagement between the Muslims and the Quraysh. A decisive Muslim victory with divine assistance.',
    surahRefs: [
      { surah: 8, ayah: 9, label: 'Angels sent to assist at Badr' },
      { surah: 3, ayah: 123, label: "Allah's help at Badr" },
    ],
  },
  {
    id: 'sinai',
    name: 'Mount Sinai (Tur Sina)',
    arabicName: 'طور سيناء',
    lat: 40,
    lng: 48,
    type: 'city',
    era: -1200,
    description:
      'The mountain where Allah spoke to Musa (Moses) and revealed the Torah. A site of immense prophetic significance, mentioned multiple times in the Quran.',
    surahRefs: [
      { surah: 7, ayah: 143, label: 'Allah speaks to Musa at the mountain' },
      { surah: 19, ayah: 52, label: 'Musa called from the right side of the mountain' },
      { surah: 95, ayah: 2, label: 'By Mount Sinai (oath)' },
    ],
  },
  {
    id: 'damascus',
    name: 'Damascus (Dimashq)',
    arabicName: 'دمشق',
    lat: 40,
    lng: 45,
    type: 'city',
    era: 635,
    description:
      'Ancient city conquered in 635 CE by Khalid ibn al-Walid. Capital of the Umayyad Caliphate (661–750 CE) under Muawiyah ibn Abi Sufyan.',
    surahRefs: [],
  },
  {
    id: 'baghdad',
    name: 'Baghdad',
    arabicName: 'بغداد',
    lat: 41,
    lng: 52,
    type: 'city',
    era: 762,
    description:
      'Circular city founded by Caliph al-Mansur in 762 CE as the capital of the Abbasid Caliphate. Center of the Islamic Golden Age of science, philosophy, and culture.',
    surahRefs: [],
  },
  {
    id: 'cordoba',
    name: 'Córdoba (Qurtuba)',
    arabicName: 'قرطبة',
    lat: 39,
    lng: 28,
    type: 'city',
    era: 711,
    description:
      'Capital of Umayyad Al-Andalus (Muslim Iberia), conquered 711 CE. Home of the Great Mosque of Córdoba and scholars like Ibn Rushd (Averroes) and Ibn Hazm.',
    surahRefs: [],
  },
]

// ─── Simplified SVG World Map (Middle East / North Africa focus) ──────────────

function SchematicMap({
  sites,
  selectedSite,
  onSelectSite,
  showHajjRoutes,
}: {
  sites: HistoricalSite[]
  selectedSite: HistoricalSite | null
  onSelectSite: (site: HistoricalSite) => void
  showHajjRoutes: boolean
}) {
  return (
    <svg viewBox="0 0 800 450" className="w-full h-full" style={{ background: 'var(--bg-panel)' }}>
      {/* Background ocean */}
      <rect width="800" height="450" fill="#b8d4e8" opacity="0.3" rx="4" />

      {/* Land masses - simplified polygons */}
      {/* Arabian Peninsula */}
      <polygon
        points="420,200 480,190 510,220 520,280 490,320 450,340 420,300 400,260 410,230"
        fill="#e8d5a3"
        stroke="#c4a96b"
        strokeWidth="1"
      />
      {/* North Africa */}
      <polygon
        points="200,180 400,170 410,230 400,260 350,270 300,280 250,270 200,250 180,220"
        fill="#e8d5a3"
        stroke="#c4a96b"
        strokeWidth="1"
      />
      {/* Levant / Fertile Crescent */}
      <polygon
        points="400,160 430,150 460,160 470,190 450,200 420,200 400,190"
        fill="#d4c99a"
        stroke="#c4a96b"
        strokeWidth="1"
      />
      {/* Mesopotamia */}
      <polygon
        points="460,160 510,150 540,170 530,200 510,220 480,210 460,190"
        fill="#d4c99a"
        stroke="#c4a96b"
        strokeWidth="1"
      />
      {/* Iran/Persia */}
      <polygon
        points="510,150 580,140 610,160 600,200 560,210 530,200 540,170"
        fill="#cfc08a"
        stroke="#c4a96b"
        strokeWidth="1"
      />
      {/* Iberian Peninsula (Al-Andalus) */}
      <polygon
        points="220,130 270,120 290,140 280,170 250,175 220,160 210,145"
        fill="#e8d5a3"
        stroke="#c4a96b"
        strokeWidth="1"
      />
      {/* Central Asia */}
      <polygon
        points="580,100 680,90 700,140 660,160 610,160 580,140"
        fill="#cfc08a"
        stroke="#c4a96b"
        strokeWidth="1"
      />

      {/* Red Sea */}
      <polygon
        points="430,200 450,200 460,250 450,300 430,300 420,250"
        fill="#6fa8c8"
        opacity="0.6"
      />

      {/* Mediterranean Sea label */}
      <text
        x="320"
        y="160"
        textAnchor="middle"
        fontSize="9"
        fill="#4a7a9b"
        opacity="0.8"
        fontStyle="italic"
      >
        Mediterranean Sea
      </text>

      {/* Red Sea label */}
      <text
        x="440"
        y="245"
        textAnchor="middle"
        fontSize="7"
        fill="#4a7a9b"
        opacity="0.8"
        fontStyle="italic"
        transform="rotate(-60,440,245)"
      >
        Red Sea
      </text>

      {/* Hajj routes */}
      {showHajjRoutes && (
        <g opacity="0.7">
          {/* Egypt to Mecca */}
          <path
            d="M 330,220 Q 380,230 428,248"
            stroke="#b8860b"
            strokeWidth="1.5"
            strokeDasharray="5,3"
            fill="none"
          />
          {/* Damascus to Mecca */}
          <path
            d="M 400,173 Q 415,200 428,248"
            stroke="#b8860b"
            strokeWidth="1.5"
            strokeDasharray="5,3"
            fill="none"
          />
          {/* Baghdad to Mecca */}
          <path
            d="M 490,173 Q 470,210 435,248"
            stroke="#b8860b"
            strokeWidth="1.5"
            strokeDasharray="5,3"
            fill="none"
          />
          {/* Mecca to Medina */}
          <path d="M 430,252 Q 432,240 432,234" stroke="#8B4513" strokeWidth="2" fill="none" />
        </g>
      )}

      {/* Site markers */}
      {sites.map((site) => {
        const x = (site.lng / 100) * 800
        const y = (site.lat / 100) * 450
        const isSelected = selectedSite?.id === site.id
        const color =
          site.type === 'battle' ? '#dc2626' : site.type === 'pilgrimage' ? '#16a34a' : '#b8860b'
        return (
          <g key={site.id} onClick={() => onSelectSite(site)} style={{ cursor: 'pointer' }}>
            <circle
              cx={x}
              cy={y}
              r={isSelected ? 10 : 7}
              fill={color}
              stroke="white"
              strokeWidth="2"
              opacity={isSelected ? 1 : 0.85}
            />
            {isSelected && (
              <circle cx={x} cy={y} r={14} fill="none" stroke={color} strokeWidth="2" opacity="0.5">
                <animate attributeName="r" from="10" to="18" dur="1.5s" repeatCount="indefinite" />
                <animate
                  attributeName="opacity"
                  from="0.5"
                  to="0"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </circle>
            )}
            <text
              x={x}
              y={y - 12}
              textAnchor="middle"
              fontSize="9"
              fill="var(--text-primary)"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {site.name.split(' (')[0]}
            </text>
          </g>
        )
      })}

      {/* Compass rose */}
      <g transform="translate(750, 50)">
        <text textAnchor="middle" y="-12" fontSize="10" fill="var(--text-muted)">
          N
        </text>
        <text textAnchor="middle" y="20" fontSize="10" fill="var(--text-muted)">
          S
        </text>
        <text x="14" y="6" fontSize="10" fill="var(--text-muted)">
          E
        </text>
        <text x="-18" y="6" fontSize="10" fill="var(--text-muted)">
          W
        </text>
        <line x1="0" y1="-10" x2="0" y2="10" stroke="var(--text-muted)" strokeWidth="1" />
        <line x1="-10" y1="0" x2="10" y2="0" stroke="var(--text-muted)" strokeWidth="1" />
      </g>
    </svg>
  )
}

// ─── AtlasPanel ────────────────────────────────────────────────────────────────

export default function AtlasPanel(): React.ReactElement {
  const navigate = useNavigate()
  const [year, setYear] = useState(700)
  const [layers, setLayers] = useState<MapLayer[]>(INITIAL_LAYERS)
  const [selectedSite, setSelectedSite] = useState<HistoricalSite | null>(null)
  const [showSidebar, setShowSidebar] = useState(true)

  const toggleLayer = (id: string) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, enabled: !l.enabled } : l)))
  }

  const visibleSites = HISTORICAL_SITES.filter((s) => s.era <= year + 50)
  const showHajjRoutes = layers.find((l) => l.id === 'hajj')?.enabled ?? false

  return (
    <div className="flex h-full overflow-hidden">
      {/* Map area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="px-4 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-lg">🗺️</span>
            <span className="font-['Cormorant_Garamond'] text-lg text-[var(--text-primary)]">
              Islamic Atlas
            </span>
          </div>
          {/* Timeline slider */}
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <span className="text-xs text-[var(--text-muted)] w-16 text-right">
              {year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`}
            </span>
            <input
              type="range"
              min={-600}
              max={2000}
              step={50}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="flex-1 accent-[var(--accent-primary)]"
            />
            <span className="text-xs text-[var(--text-muted)] w-16">2000 CE</span>
          </div>
          <button
            onClick={() => setShowSidebar((s) => !s)}
            className="text-xs px-2 py-1 rounded border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
          >
            {showSidebar ? '⬅ Hide' : '➡ Layers'}
          </button>
        </div>

        {/* Map */}
        <div className="flex-1 overflow-hidden relative">
          <SchematicMap
            sites={visibleSites}
            selectedSite={selectedSite}
            onSelectSite={setSelectedSite}
            showHajjRoutes={showHajjRoutes}
          />

          {/* Selected site popup */}
          {selectedSite && (
            <div className="absolute bottom-4 left-4 right-4 max-w-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-lg p-4">
              <button
                onClick={() => setSelectedSite(null)}
                className="absolute top-2 right-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-lg leading-none"
              >
                ×
              </button>
              <div className="flex items-start gap-3">
                <span className="text-2xl">
                  {selectedSite.type === 'battle'
                    ? '⚔️'
                    : selectedSite.type === 'pilgrimage'
                      ? '🕌'
                      : '📍'}
                </span>
                <div>
                  <div className="font-semibold text-[var(--text-primary)]">
                    {selectedSite.name}
                  </div>
                  {selectedSite.arabicName && (
                    <div className="font-arabic text-[var(--text-secondary)] text-sm" dir="rtl">
                      {selectedSite.arabicName}
                    </div>
                  )}
                  <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
                    {selectedSite.description}
                  </p>
                  {selectedSite.surahRefs && selectedSite.surahRefs.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="text-xs font-semibold text-[var(--text-muted)] uppercase">
                        Quran References
                      </div>
                      {selectedSite.surahRefs.map((ref, i) => (
                        <button
                          key={i}
                          onClick={() => void navigate(`/quran/${ref.surah}/${ref.ayah}`)}
                          className="block text-xs text-[var(--accent-primary)] hover:underline text-left"
                        >
                          {ref.surah}:{ref.ayah} — {ref.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Era label */}
        <div className="px-4 py-1.5 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)] text-center">
          Showing sites and events up to {year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`} ·{' '}
          {visibleSites.length} locations visible
        </div>
      </div>

      {/* Layers sidebar */}
      {showSidebar && (
        <div className="w-64 border-l border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-y-auto flex flex-col">
          <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
            <div className="font-semibold text-sm text-[var(--text-primary)]">Map Layers</div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">
              Toggle overlays on the map
            </div>
          </div>
          <div className="p-3 space-y-2 flex-1">
            {layers.map((layer) => (
              <label
                key={layer.id}
                className="flex items-start gap-2 cursor-pointer p-2 rounded hover:bg-[var(--bg-hover)] transition-colors"
              >
                <input
                  type="checkbox"
                  checked={layer.enabled}
                  onChange={() => toggleLayer(layer.id)}
                  className="mt-0.5 accent-[var(--accent-primary)]"
                />
                <div>
                  <div className="text-sm text-[var(--text-primary)]">{layer.label}</div>
                  <div className="text-xs text-[var(--text-muted)]">{layer.description}</div>
                </div>
              </label>
            ))}
          </div>

          {/* Legend */}
          <div className="p-3 border-t border-[var(--border-subtle)]">
            <div className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-2">
              Legend
            </div>
            <div className="space-y-1 text-xs text-[var(--text-secondary)]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#b8860b]" />
                <span>City / Historic site</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#dc2626]" />
                <span>Battle site</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#16a34a]" />
                <span>Pilgrimage site</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-8 border-t-2 border-dashed border-[#b8860b]" />
                <span>Trade / Hajj route</span>
              </div>
            </div>
          </div>

          {/* Surah revelation location reference */}
          <div className="p-3 border-t border-[var(--border-subtle)]">
            <div className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-2">
              Revelation Locations
            </div>
            <div className="space-y-1 text-xs text-[var(--text-secondary)]">
              <div className="flex items-center justify-between">
                <span>Meccan surahs</span>
                <span className="px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800">
                  86 surahs
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Medinan surahs</span>
                <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-800">28 surahs</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
