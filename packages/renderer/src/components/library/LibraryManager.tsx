import React, { useState, useEffect, useCallback } from 'react'
import { useIpc } from '../../hooks/useIpc'

// ─── Types ────────────────────────────────────────────────────────────────────

type ResourceCategory = 'quran' | 'hadith' | 'tafsir' | 'fiqh' | 'linguistics' | 'sirah'
type ResourceTier = 'free' | 'student' | 'scholar'
type DownloadStatus = 'installed' | 'available' | 'downloading' | 'error'

interface InstalledResource {
  key: string
  name: string
  category: ResourceCategory
  sizeBytes: number
  installedAt: string
}

interface AvailableResource {
  key: string
  name: string
  nameArabic: string
  category: ResourceCategory
  tier: ResourceTier
  author: string
  century: number | null
  description: string
  sizeBytes: number
  status: DownloadStatus
  downloadUrl: string | null
}

interface ImportResult {
  success: boolean
  resourceKey: string
  message: string
  recordsImported?: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

const CATEGORY_LABELS: Record<ResourceCategory, string> = {
  quran: '📖 Quran',
  hadith: '📜 Hadith',
  tafsir: '🔍 Tafsir',
  fiqh: '⚖️ Fiqh',
  linguistics: '🔤 Linguistics',
  sirah: '🌙 Sirah',
}

const TIER_BADGE: Record<ResourceTier, string> = {
  free: 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-900/30',
  student: 'text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-900/30',
  scholar: 'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-900/30',
}

const ALL_CATEGORIES: ResourceCategory[] = [
  'quran',
  'hadith',
  'tafsir',
  'fiqh',
  'linguistics',
  'sirah',
]

type IpcBridge = ReturnType<typeof useIpc>

// ─── Installed Resources Tab ──────────────────────────────────────────────────

function InstalledTab({ ipc }: { ipc: IpcBridge }): React.ReactElement {
  const [resources, setResources] = useState<InstalledResource[]>([])
  const [loading, setLoading] = useState(true)
  const [uninstalling, setUninstalling] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!ipc) {
      setLoading(false)
      return
    }
    ipc
      .invoke('resource:get-installed')
      .then((r) => setResources(r as InstalledResource[]))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [ipc])

  async function handleUninstall(key: string): Promise<void> {
    if (!ipc) return
    setUninstalling(key)
    setMessage(null)
    try {
      const result = (await ipc.invoke('resource:uninstall', key)) as {
        success: boolean
        message: string
      }
      setMessage(result.message)
      if (result.success) {
        setResources((prev) => prev.filter((r) => r.key !== key))
      }
    } catch {
      setMessage('Failed to uninstall resource.')
    } finally {
      setUninstalling(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-6 h-6 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const totalSize = resources.reduce((sum, r) => sum + r.sizeBytes, 0)

  return (
    <div className="flex flex-col gap-4">
      {/* Storage summary */}
      <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-between text-sm">
        <span className="text-[var(--text-secondary)]">
          {resources.length} resource{resources.length !== 1 ? 's' : ''} installed
        </span>
        <span className="font-medium text-[var(--text-primary)]">
          Total: {formatBytes(totalSize)}
        </span>
      </div>

      {message && (
        <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm text-[var(--text-secondary)]">
          {message}
        </div>
      )}

      {resources.length === 0 ? (
        <div className="text-center py-8 text-[var(--text-secondary)]">
          <div className="text-3xl mb-2">📚</div>
          <p>No resources installed yet.</p>
          <p className="text-sm mt-1">
            Go to the "Available" tab to browse and download resources.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {resources.map((r) => (
            <div
              key={r.key}
              className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs text-[var(--text-secondary)]">
                    {CATEGORY_LABELS[r.category]}
                  </span>
                </div>
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">{r.name}</p>
                <p className="text-xs text-[var(--text-secondary)]">{formatBytes(r.sizeBytes)}</p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 font-medium">
                Installed
              </span>
              {r.key !== 'quran-hafs' && (
                <button
                  onClick={() => void handleUninstall(r.key)}
                  disabled={uninstalling === r.key}
                  className="px-3 py-1.5 text-xs rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-red-600 hover:border-red-300 disabled:opacity-50 transition-colors"
                >
                  {uninstalling === r.key ? 'Removing…' : 'Uninstall'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Resource Detail Modal ────────────────────────────────────────────────────

function ResourceDetailModal({
  resource,
  onClose,
  onInstall,
}: {
  resource: AvailableResource
  onClose: () => void
  onInstall: (key: string) => Promise<void>
}): React.ReactElement {
  const [installing, setInstalling] = useState(false)

  async function handleInstall(): Promise<void> {
    setInstalling(true)
    await onInstall(resource.key)
    setInstalling(false)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] shadow-xl max-w-md w-full mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-[var(--text-secondary)] mb-1">
              {CATEGORY_LABELS[resource.category]}
            </p>
            <h2 className="text-lg font-bold text-[var(--text-primary)] leading-snug">
              {resource.name}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5 font-arabic" dir="rtl">
              {resource.nameArabic}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xl leading-none"
          >
            ×
          </button>
        </div>

        <dl className="text-sm flex flex-col gap-2 mb-4">
          <div className="flex gap-2">
            <dt className="w-24 text-[var(--text-secondary)] flex-shrink-0">Author</dt>
            <dd className="text-[var(--text-primary)]">{resource.author}</dd>
          </div>
          {resource.century && (
            <div className="flex gap-2">
              <dt className="w-24 text-[var(--text-secondary)] flex-shrink-0">Century</dt>
              <dd className="text-[var(--text-primary)]">{resource.century}th century CE</dd>
            </div>
          )}
          <div className="flex gap-2">
            <dt className="w-24 text-[var(--text-secondary)] flex-shrink-0">Size</dt>
            <dd className="text-[var(--text-primary)]">{formatBytes(resource.sizeBytes)}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-24 text-[var(--text-secondary)] flex-shrink-0">Tier</dt>
            <dd>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${TIER_BADGE[resource.tier]}`}
              >
                {resource.tier}
              </span>
            </dd>
          </div>
        </dl>

        <p className="text-sm text-[var(--text-secondary)] mb-5">{resource.description}</p>

        {resource.status === 'installed' ? (
          <div className="text-center text-sm text-emerald-600 dark:text-emerald-400 font-medium">
            ✅ Installed
          </div>
        ) : (
          <button
            onClick={() => void handleInstall()}
            disabled={installing || resource.status === 'downloading'}
            className="w-full py-2.5 rounded-xl bg-[var(--accent-primary)] text-white font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {installing || resource.status === 'downloading'
              ? 'Downloading…'
              : 'Download & Install'}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Available Resources Tab ──────────────────────────────────────────────────

interface DownloadProgress {
  percentage: number
  status: DownloadStatus
  message?: string
}

function AvailableTab({ ipc }: { ipc: IpcBridge }): React.ReactElement {
  const [resources, setResources] = useState<AvailableResource[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState<ResourceCategory | 'all'>('all')
  const [filterTier, setFilterTier] = useState<ResourceTier | 'all'>('all')
  const [selectedResource, setSelectedResource] = useState<AvailableResource | null>(null)
  const [installMessage, setInstallMessage] = useState<string | null>(null)
  // Track download progress per resource key
  const [downloadProgress, setDownloadProgress] = useState<Record<string, DownloadProgress>>({})

  const loadResources = useCallback(async (): Promise<void> => {
    if (!ipc) {
      setLoading(false)
      return
    }
    try {
      const r = await ipc.invoke('resource:get-available')
      setResources(r as AvailableResource[])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [ipc])

  useEffect(() => {
    void loadResources()
  }, [loadResources])

  // Subscribe to download progress events from the main process
  useEffect(() => {
    if (!ipc) return
    const unsubscribe = ipc.on(
      'resource:download-progress',
      (...args: unknown[]) => {
        const p = args[0] as { resourceKey: string; percentage: number; status: DownloadStatus; message?: string }
        if (!p?.resourceKey) return
        setDownloadProgress((prev) => ({
          ...prev,
          [p.resourceKey]: { percentage: p.percentage, status: p.status, message: p.message },
        }))
        // When download completes, refresh the resource list
        if (p.status === 'installed') {
          void loadResources()
        }
      }
    )
    return unsubscribe
  }, [ipc, loadResources])

  async function handleInstall(key: string): Promise<void> {
    if (!ipc) return
    try {
      const result = (await ipc.invoke('resource:install', key)) as {
        queued: boolean
        message: string
      }
      setInstallMessage(result.message)
      if (result.queued) {
        setDownloadProgress((prev) => ({ ...prev, [key]: { percentage: 0, status: 'downloading' } }))
        // Update the resource status in the list immediately
        setResources((prev) => prev.map((r) => r.key === key ? { ...r, status: 'downloading' } : r))
      }
    } catch {
      setInstallMessage('Failed to start download.')
    }
  }

  const filtered = resources.filter((r) => {
    if (filterCategory !== 'all' && r.category !== filterCategory) return false
    if (filterTier !== 'all' && r.tier !== filterTier) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-6 h-6 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as ResourceCategory | 'all')}
          className="px-3 py-1.5 text-sm rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none"
        >
          <option value="all">All Categories</option>
          {ALL_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
        <select
          value={filterTier}
          onChange={(e) => setFilterTier(e.target.value as ResourceTier | 'all')}
          className="px-3 py-1.5 text-sm rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none"
        >
          <option value="all">All Tiers</option>
          <option value="free">Free</option>
          <option value="student">Student</option>
          <option value="scholar">Scholar</option>
        </select>
      </div>

      {installMessage && (
        <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm text-[var(--text-secondary)]">
          {installMessage}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-center py-8 text-[var(--text-secondary)] text-sm">
          No resources match the selected filters.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((r) => (
            <div
              key={r.key}
              className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] flex items-center gap-3 cursor-pointer hover:border-[var(--accent-primary)]/40 transition-colors"
              onClick={() => setSelectedResource(r)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs text-[var(--text-secondary)]">
                    {CATEGORY_LABELS[r.category]}
                  </span>
                  <span
                    className={`text-xs font-semibold px-1.5 py-0 rounded-full capitalize ${TIER_BADGE[r.tier]}`}
                  >
                    {r.tier}
                  </span>
                </div>
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">{r.name}</p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {r.author} · {formatBytes(r.sizeBytes)}
                </p>
              </div>
              {r.status === 'installed' ? (
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 font-medium flex-shrink-0">
                  Installed
                </span>
              ) : r.status === 'downloading' || downloadProgress[r.key]?.status === 'downloading' ? (
                <div className="flex flex-col items-end gap-1 min-w-[80px] flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-[var(--text-secondary)]">
                      {downloadProgress[r.key]?.percentage ?? 0}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--accent-primary)] transition-all duration-300"
                      style={{ width: `${downloadProgress[r.key]?.percentage ?? 0}%` }}
                    />
                  </div>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    void handleInstall(r.key)
                  }}
                  className="px-3 py-1.5 text-xs rounded-lg bg-[var(--accent-primary)] text-white font-semibold hover:opacity-90 transition-opacity flex-shrink-0"
                >
                  Install
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedResource && (
        <ResourceDetailModal
          resource={selectedResource}
          onClose={() => setSelectedResource(null)}
          onInstall={handleInstall}
        />
      )}
    </div>
  )
}

// ─── Import Resources Tab ─────────────────────────────────────────────────────

function ImportTab({ ipc }: { ipc: IpcBridge }): React.ReactElement {
  const [mktPath, setMktPath] = useState('')
  const [epubPath, setEpubPath] = useState('')
  const [pdfPath, setPdfPath] = useState('')
  const [mktResult, setMktResult] = useState<ImportResult | null>(null)
  const [epubResult, setEpubResult] = useState<ImportResult | null>(null)
  const [pdfResult, setPdfResult] = useState<ImportResult | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  async function handleImport(type: 'mkt' | 'epub' | 'pdf', filePath: string): Promise<void> {
    if (!ipc) return
    setLoading(type)
    const channel =
      type === 'mkt'
        ? 'resource:import-mkt'
        : type === 'epub'
          ? 'resource:import-epub'
          : 'resource:import-pdf'
    try {
      const result = (await ipc.invoke(channel, filePath)) as ImportResult
      if (type === 'mkt') setMktResult(result)
      if (type === 'epub') setEpubResult(result)
      if (type === 'pdf') setPdfResult(result)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Import failed.'
      const failResult: ImportResult = { success: false, resourceKey: '', message: msg }
      if (type === 'mkt') setMktResult(failResult)
      if (type === 'epub') setEpubResult(failResult)
      if (type === 'pdf') setPdfResult(failResult)
    } finally {
      setLoading(null)
    }
  }

  function ImportSection({
    title,
    description,
    placeholder,
    type,
    value,
    onChange,
    result,
  }: {
    title: string
    description: string
    placeholder: string
    type: 'mkt' | 'epub' | 'pdf'
    value: string
    onChange: (v: string) => void
    result: ImportResult | null
  }): React.ReactElement {
    return (
      <section className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">{title}</h3>
        <p className="text-xs text-[var(--text-secondary)] mb-3">{description}</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
          />
          <button
            onClick={() => void handleImport(type, value)}
            disabled={!value.trim() || loading === type}
            className="px-4 py-2 text-sm rounded-lg bg-[var(--accent-primary)] text-white font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            {loading === type ? 'Importing…' : 'Import'}
          </button>
        </div>
        {result && (
          <p
            className={`mt-2 text-sm ${result.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}
          >
            {result.success ? '✅' : '❌'} {result.message}
          </p>
        )}
      </section>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <ImportSection
        title="Import .mkt Resource Bundle"
        description="Import a Maktabat-format resource bundle from another user or a third-party publisher."
        placeholder="/path/to/resource.mkt"
        type="mkt"
        value={mktPath}
        onChange={setMktPath}
        result={mktResult}
      />
      <ImportSection
        title="Import EPUB"
        description="Import an EPUB ebook. Quran and Hadith passages detected automatically (beta)."
        placeholder="/path/to/book.epub"
        type="epub"
        value={epubPath}
        onChange={setEpubPath}
        result={epubResult}
      />
      <ImportSection
        title="Import Personal PDF"
        description="Add a PDF to your personal library for annotation. Not cross-linked with other resources."
        placeholder="/path/to/document.pdf"
        type="pdf"
        value={pdfPath}
        onChange={setPdfPath}
        result={pdfResult}
      />
    </div>
  )
}

// ─── Main LibraryManager Component ───────────────────────────────────────────

type ActiveTab = 'installed' | 'available' | 'import'

export default function LibraryManager(): React.ReactElement {
  const ipc = useIpc()
  const [activeTab, setActiveTab] = useState<ActiveTab>('installed')

  const tabs: { key: ActiveTab; label: string }[] = [
    { key: 'installed', label: '✅ Installed' },
    { key: 'available', label: '📦 Available' },
    { key: 'import', label: '⬆️ Import' },
  ]

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--border-color)]">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Library Manager</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Manage installed resources, browse the catalog, and import your own materials.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border-color)] px-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'installed' && <InstalledTab ipc={ipc} />}
        {activeTab === 'available' && <AvailableTab ipc={ipc} />}
        {activeTab === 'import' && <ImportTab ipc={ipc} />}
      </div>
    </div>
  )
}
