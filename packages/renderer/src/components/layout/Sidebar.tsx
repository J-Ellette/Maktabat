import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppStore, type SidebarSection } from '../../store/app-store'

interface NavItem {
  id: SidebarSection
  label: string
  icon: React.ReactElement
  route?: string
}

const sidebarItems: NavItem[] = [
  {
    id: 'library',
    label: 'Library',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    id: 'bookmarks',
    label: 'Bookmarks',
    route: '/bookmarks',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: 'notes',
    label: 'Notes',
    route: '/notes',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
  {
    id: 'reading-plans',
    label: 'Reading Plans',
    route: '/reading-plans',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    id: 'factbook',
    label: 'Factbook',
    route: '/factbook',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  {
    id: 'atlas',
    label: 'Islamic Atlas',
    route: '/atlas',
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
        <line x1="9" y1="3" x2="9" y2="18" />
        <line x1="15" y1="6" x2="15" y2="21" />
      </svg>
    ),
  },
]

// ────────────────────────────────────────────────────────────────
// Library tree for the "Library" section
// ────────────────────────────────────────────────────────────────
interface TreeNode {
  id: string
  label: string
  route?: string
  children?: TreeNode[]
}

const libraryTree: TreeNode[] = [
  {
    id: 'quran',
    label: '📖 Quran',
    route: '/quran',
    children: [
      { id: 'quran-1', label: 'Al-Fatiha (1)', route: '/quran/1' },
      { id: 'quran-2', label: 'Al-Baqarah (2)', route: '/quran/2' },
      { id: 'quran-3', label: 'Āl ʿImrān (3)', route: '/quran/3' },
    ],
  },
  {
    id: 'hadith',
    label: '📜 Hadith Collections',
    route: '/hadith',
    children: [
      { id: 'bukhari', label: 'Sahih al-Bukhari', route: '/hadith/bukhari' },
      { id: 'muslim', label: 'Sahih Muslim', route: '/hadith/muslim' },
      { id: 'abu-dawood', label: 'Sunan Abu Dawood', route: '/hadith/abu-dawood' },
      { id: 'tirmidhi', label: 'Sunan al-Tirmidhi', route: '/hadith/tirmidhi' },
      { id: 'nasai', label: "Sunan al-Nasa'i", route: '/hadith/nasai' },
      { id: 'ibn-majah', label: 'Sunan Ibn Majah', route: '/hadith/ibn-majah' },
    ],
  },
  {
    id: 'tafsir',
    label: '🔎 Tafsir',
    children: [
      { id: 'ibn-kathir', label: 'Tafsir Ibn Kathir' },
      { id: 'tabari', label: 'Tafsir al-Tabari' },
      { id: 'jalalayn', label: 'Tafsir al-Jalalayn' },
    ],
  },
  {
    id: 'fiqh',
    label: '⚖️ Fiqh (Jurisprudence)',
    children: [
      { id: 'hanafi', label: 'Hanafi' },
      { id: 'maliki', label: 'Maliki' },
      { id: 'shafii', label: "Shafi'i" },
      { id: 'hanbali', label: 'Hanbali' },
    ],
  },
]

function TreeNodeRow({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [expanded, setExpanded] = React.useState(false)
  const hasChildren = (node.children?.length ?? 0) > 0
  const isActive = node.route ? location.pathname === node.route : false

  function handleClick() {
    if (hasChildren) setExpanded((e) => !e)
    if (node.route) void navigate(node.route)
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={`w-full flex items-center gap-1 px-2 py-1.5 text-left text-sm rounded transition-colors ${
          isActive
            ? 'bg-[var(--accent-primary)] text-white'
            : 'hover:bg-[var(--bg-secondary)] text-[var(--text-primary)]'
        }`}
        style={{ paddingLeft: `${8 + depth * 12}px` }}
      >
        {hasChildren && (
          <span
            className={`w-3 h-3 flex-shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`}
          >
            <svg viewBox="0 0 12 12" fill="currentColor">
              <path
                d="M4 2l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}
        {!hasChildren && <span className="w-3 flex-shrink-0" />}
        <span className="truncate">{node.label}</span>
      </button>
      {hasChildren && expanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNodeRow key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </>
  )
}

function LibrarySection() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-0.5 px-2">
      <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] px-2 py-2">
        Collections
      </div>
      {libraryTree.map((node) => (
        <TreeNodeRow key={node.id} node={node} />
      ))}
      <div className="mt-2 border-t border-[var(--border-color)] pt-2">
        <button
          onClick={() => void navigate('/library')}
          className="w-full text-left px-2 py-2 text-xs text-[var(--accent-primary)] hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
        >
          📦 Manage Library Resources →
        </button>
      </div>
    </div>
  )
}

function PlaceholderSection({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-6 text-center text-[var(--text-secondary)]">
      <div className="text-3xl opacity-50">📂</div>
      <p className="text-sm">{title} will appear here.</p>
    </div>
  )
}

export default function Sidebar(): React.ReactElement {
  const navigate = useNavigate()
  const location = useLocation()
  const sidebarSection = useAppStore((s) => s.sidebarSection)
  const setSidebarSection = useAppStore((s) => s.setSidebarSection)

  function handleNavItemClick(item: NavItem) {
    setSidebarSection(item.id)
    if (item.route) void navigate(item.route)
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-sidebar)] border-e border-[var(--border-color)]">
      {/* Icon nav rail */}
      <nav
        className="flex flex-col items-center gap-1 p-2 border-b border-[var(--border-color)]"
        aria-label="Sidebar sections"
      >
        {sidebarItems.map((item) => {
          const isActive =
            sidebarSection === item.id || (item.route && location.pathname.startsWith(item.route))
          return (
            <button
              key={item.id}
              onClick={() => handleNavItemClick(item)}
              title={item.label}
              aria-label={item.label}
              aria-pressed={!!isActive}
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
                isActive
                  ? 'bg-[var(--accent-primary)] text-white'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {item.icon}
            </button>
          )
        })}
      </nav>

      {/* Section label */}
      <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] border-b border-[var(--border-color)]">
        {sidebarItems.find((i) => i.id === sidebarSection)?.label}
      </div>

      {/* Section content */}
      <div className="flex-1 overflow-y-auto">
        {sidebarSection === 'library' && <LibrarySection />}
        {sidebarSection === 'bookmarks' && <PlaceholderSection title="Bookmarks" />}
        {sidebarSection === 'notes' && <PlaceholderSection title="Notes & Highlights" />}
        {sidebarSection === 'reading-plans' && <PlaceholderSection title="Reading Plans" />}
        {sidebarSection === 'factbook' && <PlaceholderSection title="Factbook" />}
        {sidebarSection === 'atlas' && <PlaceholderSection title="Islamic Atlas" />}
      </div>
    </div>
  )
}
