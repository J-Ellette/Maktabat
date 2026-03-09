import React, { useState, useEffect, useCallback } from 'react'
import { useIpc } from '../../hooks/useIpc'

interface SyncState {
  status: 'idle' | 'syncing' | 'synced' | 'error' | 'offline'
  lastSyncAt: string | null
  errorMessage: string | null
  pendingChanges: number
}

const STATUS_LABELS: Record<string, string> = {
  idle: '⏸ Idle',
  syncing: '🔄 Syncing…',
  synced: '✅ Synced',
  error: '❌ Error',
  offline: '🔌 Offline',
}

const STATUS_COLORS: Record<string, string> = {
  idle: 'text-[var(--text-secondary)]',
  syncing: 'text-blue-600 dark:text-blue-400',
  synced: 'text-emerald-600 dark:text-emerald-400',
  error: 'text-red-600 dark:text-red-400',
  offline: 'text-amber-600 dark:text-amber-400',
}

export default function SyncPanel(): React.ReactElement {
  const ipc = useIpc()
  const [syncState, setSyncState] = useState<SyncState | null>(null)
  const [loadingSync, setLoadingSync] = useState(false)
  const [exportPath, setExportPath] = useState('')
  const [importPath, setImportPath] = useState('')
  const [exportResult, setExportResult] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  const loadStatus = useCallback(async (): Promise<void> => {
    if (!ipc) return
    try {
      const state = await ipc.invoke('sync:get-status')
      setSyncState(state as SyncState)
    } catch {
      // ignore
    }
  }, [ipc])

  useEffect(() => {
    void loadStatus()
  }, [loadStatus])

  async function handleSync(): Promise<void> {
    if (!ipc) return
    setLoadingSync(true)
    try {
      const state = await ipc.invoke('sync:trigger')
      setSyncState(state as SyncState)
    } catch {
      // ignore
    } finally {
      setLoadingSync(false)
    }
  }

  async function handleExport(): Promise<void> {
    if (!ipc || !exportPath.trim()) return
    setExportError(null)
    setExportResult(null)
    try {
      const result = await ipc.invoke('sync:export-bundle', exportPath.trim())
      setExportResult(`✅ Exported to: ${result as string}`)
    } catch (err: unknown) {
      setExportError(err instanceof Error ? err.message : 'Export failed.')
    }
  }

  async function handleImport(): Promise<void> {
    if (!ipc || !importPath.trim()) return
    setImportError(null)
    setImportResult(null)
    try {
      const result = await ipc.invoke('sync:import-bundle', importPath.trim())
      const r = result as { imported: Record<string, number>; conflicts: number }
      const summary = Object.entries(r.imported)
        .map(([k, v]) => `${v} ${k}`)
        .join(', ')
      setImportResult(`✅ Imported: ${summary || 'nothing new'}. Conflicts: ${r.conflicts}.`)
    } catch (err: unknown) {
      setImportError(err instanceof Error ? err.message : 'Import failed.')
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      {/* Sync Status */}
      <section className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
          Cloud Sync Status
        </h3>

        {syncState ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${STATUS_COLORS[syncState.status] ?? ''}`}>
                {STATUS_LABELS[syncState.status] ?? syncState.status}
              </span>
              <button
                onClick={() => void handleSync()}
                disabled={loadingSync || syncState.status === 'syncing'}
                className="px-3 py-1 text-xs rounded-lg bg-[var(--accent-primary)] text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {loadingSync ? 'Syncing…' : 'Sync Now'}
              </button>
            </div>
            {syncState.lastSyncAt && (
              <p className="text-xs text-[var(--text-secondary)]">
                Last sync: {new Date(syncState.lastSyncAt).toLocaleString()}
              </p>
            )}
            {syncState.errorMessage && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                {syncState.errorMessage}
              </p>
            )}
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Cloud sync is not yet available (coming in a future update). Use export/import below
              for local backup in the meantime.
            </p>
          </div>
        ) : (
          <div className="w-5 h-5 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
        )}
      </section>

      {/* Export Bundle */}
      <section className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
          Export Library Bundle
        </h3>
        <p className="text-sm text-[var(--text-secondary)] mb-3">
          Save all your notes, highlights, bookmarks, reading plans and khutbahs to a{' '}
          <code className="font-mono text-xs bg-[var(--bg-primary)] px-1 py-0.5 rounded">.mkt</code>{' '}
          file for backup or transfer to another device.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={exportPath}
            onChange={(e) => setExportPath(e.target.value)}
            placeholder="/path/to/backup.mkt"
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
          />
          <button
            onClick={() => void handleExport()}
            disabled={!exportPath.trim()}
            className="px-4 py-2 text-sm rounded-lg bg-[var(--accent-primary)] text-white font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            Export
          </button>
        </div>
        {exportResult && (
          <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">{exportResult}</p>
        )}
        {exportError && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{exportError}</p>
        )}
      </section>

      {/* Import Bundle */}
      <section className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
          Import Library Bundle
        </h3>
        <p className="text-sm text-[var(--text-secondary)] mb-3">
          Restore from a previously exported{' '}
          <code className="font-mono text-xs bg-[var(--bg-primary)] px-1 py-0.5 rounded">.mkt</code>{' '}
          bundle. Existing data is preserved; conflicts are resolved by keeping your local version.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={importPath}
            onChange={(e) => setImportPath(e.target.value)}
            placeholder="/path/to/backup.mkt"
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
          />
          <button
            onClick={() => void handleImport()}
            disabled={!importPath.trim()}
            className="px-4 py-2 text-sm rounded-lg bg-[var(--accent-primary)] text-white font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            Import
          </button>
        </div>
        {importResult && (
          <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">{importResult}</p>
        )}
        {importError && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{importError}</p>
        )}
      </section>

      {/* Offline mode note */}
      <div className="p-3 rounded-lg border border-[var(--border-color)] text-sm text-[var(--text-secondary)]">
        <span className="font-medium text-[var(--text-primary)]">Offline Mode: </span>
        Maktabat is fully functional offline. All library content and your personal data are stored
        locally. Internet is only used for cloud sync and resource downloads.
      </div>
    </div>
  )
}
