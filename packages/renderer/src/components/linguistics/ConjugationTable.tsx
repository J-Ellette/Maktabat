import React, { useState, useCallback, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useIpc } from '../../hooks/useIpc'
import { conjugateVerb, getFormPatterns } from '@arabic-nlp/conjugation'
import type { ConjugationTable, ConjugationCell } from '@arabic-nlp/conjugation'
import type { LibrarySearchResult } from '@shared/types/ipc'

// ─── Form tab selector ────────────────────────────────────────────────────────

const FORM_PATTERNS = getFormPatterns()

// ─── Column order for the table ───────────────────────────────────────────────

const COLUMN_ORDER = [
  { key: '3.m.sg', label: '3rd m.sg', labelAr: 'هو' },
  { key: '3.f.sg', label: '3rd f.sg', labelAr: 'هي' },
  { key: '3.m.du', label: '3rd m.du', labelAr: 'هما' },
  { key: '3.f.du', label: '3rd f.du', labelAr: 'هما ف' },
  { key: '3.m.pl', label: '3rd m.pl', labelAr: 'هم' },
  { key: '3.f.pl', label: '3rd f.pl', labelAr: 'هن' },
  { key: '2.m.sg', label: '2nd m.sg', labelAr: 'أنت' },
  { key: '2.f.sg', label: '2nd f.sg', labelAr: 'أنتِ' },
  { key: '2.b.du', label: '2nd du', labelAr: 'أنتما' },
  { key: '2.m.pl', label: '2nd m.pl', labelAr: 'أنتم' },
  { key: '2.f.pl', label: '2nd f.pl', labelAr: 'أنتن' },
  { key: '1.b.sg', label: '1st sg', labelAr: 'أنا' },
  { key: '1.b.pl', label: '1st pl', labelAr: 'نحن' },
]

const IMP_COLUMN_ORDER = [
  { key: '2.m.sg', labelAr: 'أنت' },
  { key: '2.f.sg', labelAr: 'أنتِ' },
  { key: '2.b.du', labelAr: 'أنتما' },
  { key: '2.m.pl', labelAr: 'أنتم' },
  { key: '2.f.pl', labelAr: 'أنتن' },
]

// ─── Single verb form table ────────────────────────────────────────────────────

function FormTable({
  table,
  onCellClick,
}: {
  table: ConjugationTable
  onCellClick: (cell: ConjugationCell) => void
}) {
  const past = table.tenses.find((tense) => tense.tense === 'past')
  const present = table.tenses.find((tense) => tense.tense === 'present')
  const imperative = table.tenses.find((tense) => tense.tense === 'imperative')

  const cellMap = (cells: ConjugationCell[] | undefined) => {
    const cellsByKey: Record<string, ConjugationCell> = {}
    cells?.forEach((cellEntry) => { cellsByKey[cellEntry.key] = cellEntry })
    return cellsByKey
  }

  const pastMap = cellMap(past?.forms)
  const presentMap = cellMap(present?.forms)
  const imperativeMap = cellMap(imperative?.forms)

  return (
    <div className="space-y-4">
      {/* Form header */}
      <div className="flex items-center gap-3">
        <div
          className="text-2xl text-[var(--accent-primary)]"
          dir="rtl"
          style={{ fontFamily: "'IBM Plex Arabic', 'Amiri', serif" }}
        >
          {table.formPattern}
        </div>
        <span className="text-[var(--text-secondary)]">/</span>
        <div
          className="text-2xl text-[var(--text-secondary)]"
          dir="rtl"
          style={{ fontFamily: "'IBM Plex Arabic', 'Amiri', serif" }}
        >
          {table.formPatternPresent}
        </div>
        <span className="ml-auto text-sm text-[var(--text-secondary)]">{table.formName}</span>
      </div>

      {/* Past & Present combined table */}
      <div className="overflow-x-auto rounded-xl border border-[var(--border-color)]">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
              <th className="px-3 py-2 text-left text-xs text-[var(--text-secondary)] font-semibold whitespace-nowrap">
                Person
              </th>
              {COLUMN_ORDER.map((col) => (
                <th
                  key={col.key}
                  className="px-2 py-2 text-center text-xs text-[var(--text-secondary)] font-medium whitespace-nowrap"
                >
                  <span
                    dir="rtl"
                    style={{ fontFamily: "'IBM Plex Arabic', 'Amiri', serif" }}
                    className="block text-[var(--text-primary)]"
                  >
                    {col.labelAr}
                  </span>
                  <span className="text-[10px] text-[var(--text-secondary)]">{col.label}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { label: 'Past', labelAr: 'الماضي', map: pastMap },
              { label: 'Present', labelAr: 'المضارع', map: presentMap },
            ].map(({ label, labelAr, map }) => (
              <tr
                key={label}
                className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <td className="px-3 py-2 text-xs text-[var(--text-secondary)] whitespace-nowrap">
                  <span className="font-medium text-[var(--text-primary)] block">{label}</span>
                  <span
                    dir="rtl"
                    style={{ fontFamily: "'IBM Plex Arabic', 'Amiri', serif" }}
                    className="text-[var(--text-secondary)]"
                  >
                    {labelAr}
                  </span>
                </td>
                {COLUMN_ORDER.map((col) => {
                  const cell = map[col.key]
                  return (
                    <td key={col.key} className="px-2 py-2 text-center">
                      {cell ? (
                        <button
                          onClick={() => onCellClick(cell)}
                          className="text-lg text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors cursor-pointer whitespace-nowrap px-1 py-0.5 rounded hover:bg-[var(--bg-secondary)]"
                          dir="rtl"
                          style={{ fontFamily: "'IBM Plex Arabic', 'Amiri', serif" }}
                          title="Search in library"
                        >
                          {cell.arabic}
                        </button>
                      ) : (
                        <span className="text-[var(--text-secondary)]">—</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Imperative table */}
      {imperative && imperative.forms.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-[var(--border-color)]">
          <table className="text-sm">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
                <th className="px-3 py-2 text-left text-xs text-[var(--text-secondary)] font-semibold whitespace-nowrap">
                  Imperative
                </th>
                {IMP_COLUMN_ORDER.map((col) => (
                  <th
                    key={col.key}
                    className="px-3 py-2 text-center text-xs text-[var(--text-secondary)] font-medium"
                  >
                    <span
                      dir="rtl"
                      style={{ fontFamily: "'IBM Plex Arabic', 'Amiri', serif" }}
                    >
                      {col.labelAr}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-3 py-2 text-xs text-[var(--text-secondary)]">
                  <span
                    dir="rtl"
                    style={{ fontFamily: "'IBM Plex Arabic', 'Amiri', serif" }}
                  >
                    الأمر
                  </span>
                </td>
                {IMP_COLUMN_ORDER.map((col) => {
                  const cell = imperativeMap[col.key]
                  return (
                    <td key={col.key} className="px-3 py-2 text-center">
                      {cell ? (
                        <button
                          onClick={() => onCellClick(cell)}
                          className="text-lg text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors cursor-pointer whitespace-nowrap"
                          dir="rtl"
                          style={{ fontFamily: "'IBM Plex Arabic', 'Amiri', serif" }}
                        >
                          {cell.arabic}
                        </button>
                      ) : (
                        <span className="text-[var(--text-secondary)]">—</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function ConjugationTablePage(): React.ReactElement {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const ipc = useIpc()

  const rootParam = searchParams.get('root') ?? ''
  const [rootInput, setRootInput] = useState(rootParam)
  const [activeForm, setActiveForm] = useState<number | 'all'>(1)
  const [tables, setTables] = useState<ConjugationTable[]>([])
  const [searchResults, setSearchResults] = useState<LibrarySearchResult[]>([])
  const [searchQuery, setSearchQuery] = useState<string | null>(null)
  const [searching, setSearching] = useState(false)

  // Re-generate tables whenever root or form selection changes
  useEffect(() => {
    const root = rootParam.trim()
    if (!root) { setTables([]); return }
    if (activeForm === 'all') {
      setTables(Array.from({ length: 10 }, (_, i) => conjugateVerb(root, i + 1)))
    } else {
      setTables([conjugateVerb(root, activeForm)])
    }
  }, [rootParam, activeForm])

  const handleSearch = useCallback(() => {
    const trimmedRoot = rootInput.trim()
    if (!trimmedRoot) return
    setSearchParams({ root: trimmedRoot })
  }, [rootInput, setSearchParams])

  const handleCellClick = useCallback(
    async (cell: ConjugationCell) => {
      if (!ipc) return
      setSearchQuery(cell.arabic)
      setSearching(true)
      try {
        const results = (await ipc.invoke('library:search', cell.arabic, 10, 0)) as LibrarySearchResult[]
        setSearchResults(results)
      } catch {
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    },
    [ipc]
  )

  const handleResultClick = useCallback(
    (r: LibrarySearchResult) => {
      if (r.type === 'ayah') {
        const meta = r.metadata as { surahId?: number; ayahNumber?: number }
        if (meta.surahId && meta.ayahNumber) {
          void navigate(`/quran/${meta.surahId}/${meta.ayahNumber}`)
        }
      } else if (r.type === 'hadith') {
        const meta = r.metadata as { collectionKey?: string; hadithNumber?: string }
        if (meta.collectionKey) void navigate(`/hadith/${meta.collectionKey}/${meta.hadithNumber ?? '1'}`)
      }
    },
    [navigate]
  )

  return (
    <div className="flex h-full overflow-hidden bg-[var(--bg-secondary)]">
      {/* Main panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-primary)] flex-shrink-0">
          <button
            onClick={() => void navigate(-1)}
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1"
          >
            ← Back
          </button>
          <div className="w-px h-4 bg-[var(--border-color)]" />
          <h1 className="text-sm font-semibold text-[var(--text-primary)]">Verb Conjugation</h1>
        </div>

        {/* Root input */}
        <div className="px-4 py-4 border-b border-[var(--border-color)] bg-[var(--bg-primary)] flex-shrink-0">
          <div className="flex gap-2 max-w-md">
            <div className="flex-1 relative">
              <input
                type="text"
                value={rootInput}
                onChange={(e) => setRootInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter trilateral root (e.g. كتب)"
                dir="rtl"
                className="w-full px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-xl focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                style={{ fontFamily: "'IBM Plex Arabic', 'Amiri', serif" }}
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Conjugate
            </button>
          </div>
          {rootParam && (
            <p className="text-xs text-[var(--text-secondary)] mt-2">
              Showing conjugations for root:{' '}
              <span
                className="text-lg text-[var(--accent-primary)]"
                dir="rtl"
                style={{ fontFamily: "'IBM Plex Arabic', 'Amiri', serif" }}
              >
                {rootParam}
              </span>
            </p>
          )}
        </div>

        {/* Form selector tabs */}
        {rootParam && (
          <div className="px-4 py-2 border-b border-[var(--border-color)] bg-[var(--bg-primary)] flex-shrink-0 overflow-x-auto">
            <div className="flex gap-1 min-w-max">
              <button
                onClick={() => setActiveForm('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeForm === 'all'
                    ? 'bg-[var(--accent-primary)] text-white'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                }`}
              >
                All Forms
              </button>
              {FORM_PATTERNS.map((fp) => (
                <button
                  key={fp.form}
                  onClick={() => setActiveForm(fp.form)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    activeForm === fp.form
                      ? 'bg-[var(--accent-primary)] text-white'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                  }`}
                  title={fp.nameArabic}
                >
                  <span className="mr-1">{fp.nameEnglish}</span>
                  <span
                    dir="rtl"
                    className="text-xs opacity-75"
                    style={{ fontFamily: "'IBM Plex Arabic', 'Amiri', serif" }}
                  >
                    {fp.pattern}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tables */}
        <div className="flex-1 overflow-y-auto p-4 space-y-8">
          {!rootParam ? (
            <div className="flex flex-col items-center justify-center h-48 text-[var(--text-secondary)] gap-3">
              <div className="text-4xl">📖</div>
              <p>Enter a trilateral Arabic root above to see its full conjugation table.</p>
              <div className="flex gap-2 mt-2">
                {['كتب', 'قرأ', 'علم', 'نزل', 'خرج'].map((ex) => (
                  <button
                    key={ex}
                    onClick={() => {
                      setRootInput(ex)
                      setSearchParams({ root: ex })
                    }}
                    className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-sm hover:bg-[var(--bg-secondary)] transition-colors"
                    dir="rtl"
                    style={{ fontFamily: "'IBM Plex Arabic', 'Amiri', serif" }}
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            tables.map((table) => (
              <div
                key={`${table.root}-${table.form}`}
                className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-5"
              >
                <FormTable table={table} onCellClick={(cell) => void handleCellClick(cell)} />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Search results sidebar */}
      {(searchQuery !== null) && (
        <div className="w-80 flex-shrink-0 border-l border-[var(--border-color)] bg-[var(--bg-primary)] flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border-color)] flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--text-secondary)]">Search results for</p>
              <span
                className="text-xl text-[var(--text-primary)]"
                dir="rtl"
                style={{ fontFamily: "'IBM Plex Arabic', 'Amiri', serif" }}
              >
                {searchQuery}
              </span>
            </div>
            <button
              onClick={() => setSearchQuery(null)}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {searching ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : searchResults.length === 0 ? (
              <p className="text-sm text-[var(--text-secondary)] text-center py-6">No results found.</p>
            ) : (
              <div className="space-y-2">
                {searchResults.map((r) => (
                  <button
                    key={`${r.type}-${r.id}`}
                    onClick={() => handleResultClick(r)}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors border border-[var(--border-color)]"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span
                        className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                          r.type === 'ayah'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            : r.type === 'hadith'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                        }`}
                      >
                        {r.type}
                      </span>
                      <span className="text-xs text-[var(--text-secondary)] truncate">{r.resourceKey}</span>
                    </div>
                    <p
                      className="text-xs text-[var(--text-primary)] line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: r.excerpt }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
