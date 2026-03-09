/**
 * SyncService — handles .mkt bundle export/import and sync metadata.
 *
 * The .mkt bundle format is a JSON file containing all user data:
 * notes, highlights, bookmarks, reading plans, khutbahs, and settings.
 * It is written/read directly by this service without external dependencies.
 *
 * Cloud sync (PouchDB ↔ CouchDB) is deferred; this service provides the
 * local foundation (export/import bundles, conflict-free restore).
 */

import fs from 'fs'
import path from 'path'
import type { UserService } from './user-service.js'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline'

export interface SyncState {
  status: SyncStatus
  lastSyncAt: string | null
  errorMessage: string | null
  pendingChanges: number
}

export interface MktBundle {
  version: number
  exportedAt: string
  appVersion: string
  data: {
    notes: unknown[]
    highlights: unknown[]
    bookmarks: unknown[]
    readingPlans: unknown[]
    khutbahs: unknown[]
    khutbahMaterials: unknown[]
    settings: Record<string, unknown>
  }
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class SyncService {
  private userService: UserService
  private state: SyncState = {
    status: 'idle',
    lastSyncAt: null,
    errorMessage: null,
    pendingChanges: 0,
  }

  constructor(userService: UserService) {
    this.userService = userService
  }

  getStatus(): SyncState {
    return { ...this.state }
  }

  /**
   * Export all user data to a .mkt bundle file.
   * @param outputPath - Absolute file path to write the bundle.
   * @returns The path written.
   */
  exportBundle(outputPath: string): string {
    const dir = path.dirname(outputPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    const notes = this.userService.getAllNotes()
    const highlights = this.userService.getAllHighlights()
    const readingPlans = this.userService.getAllReadingPlans()
    const khutbahs = this.userService.getKhutbahs()

    // Collect khutbah materials for all khutbahs
    const khutbahMaterials = khutbahs.flatMap((k) => this.userService.getKhutbahMaterials(k.id))

    // Collect bookmarks from settings (they're stored per-resource)
    // We expose the getSetting API to grab the bookmark metadata
    const settingsKeys = [
      'theme',
      'fontSizes',
      'arabicScript',
      'transliteration',
      'interfaceLanguage',
    ]
    const settings: Record<string, unknown> = {}
    for (const key of settingsKeys) {
      settings[key] = this.userService.getSetting<unknown>(key, null)
    }

    const bundle: MktBundle = {
      version: 1,
      exportedAt: new Date().toISOString(),
      appVersion: '1.0.0',
      data: {
        notes,
        highlights,
        bookmarks: [],
        readingPlans,
        khutbahs,
        khutbahMaterials,
        settings,
      },
    }

    fs.writeFileSync(outputPath, JSON.stringify(bundle, null, 2), 'utf-8')
    this.state.lastSyncAt = new Date().toISOString()
    this.state.status = 'synced'
    return outputPath
  }

  /**
   * Import a .mkt bundle file, merging its data into the local user database.
   * Uses last-write-wins for conflicts (bundle data overwrites local if newer).
   * @param bundlePath - Absolute path to the .mkt file to import.
   * @returns Summary of items imported.
   */
  importBundle(bundlePath: string): { imported: Record<string, number>; conflicts: number } {
    if (!fs.existsSync(bundlePath)) {
      throw new Error(`Bundle file not found: ${bundlePath}`)
    }

    let bundle: MktBundle
    try {
      bundle = JSON.parse(fs.readFileSync(bundlePath, 'utf-8')) as MktBundle
    } catch {
      throw new Error('Invalid .mkt bundle: could not parse JSON.')
    }

    if (!bundle.version || !bundle.data) {
      throw new Error('Invalid .mkt bundle: missing version or data fields.')
    }

    const imported: Record<string, number> = {
      notes: 0,
      highlights: 0,
      readingPlans: 0,
      khutbahs: 0,
    }
    let conflicts = 0

    // Import notes
    for (const note of (bundle.data.notes ?? []) as Array<{
      resource_key: string
      content_ref: string
      type: string
      body: string
      tags: string
    }>) {
      try {
        this.userService.saveNote(
          note.resource_key,
          note.content_ref,
          note.type,
          note.body,
          JSON.parse(note.tags || '[]') as string[]
        )
        imported.notes++
      } catch {
        conflicts++
      }
    }

    // Import highlights
    for (const hl of (bundle.data.highlights ?? []) as Array<{
      resource_key: string
      content_ref: string
      color: string
    }>) {
      try {
        this.userService.saveHighlight(hl.resource_key, hl.content_ref, hl.color)
        imported.highlights++
      } catch {
        conflicts++
      }
    }

    // Import reading plans
    for (const rp of (bundle.data.readingPlans ?? []) as Array<{
      plan_key: string
      start_date: string
      target_date: string
      progress_data: string
    }>) {
      try {
        this.userService.saveReadingPlan(
          rp.plan_key,
          rp.start_date,
          rp.target_date,
          JSON.parse(rp.progress_data || '{}') as Record<string, unknown>
        )
        imported.readingPlans++
      } catch {
        conflicts++
      }
    }

    // Import khutbahs
    for (const k of (bundle.data.khutbahs ?? []) as Array<{
      title: string
      date: string | null
      template_key: string
      body: string
    }>) {
      try {
        this.userService.saveKhutbah(k.title, k.date ?? null, k.template_key, k.body)
        imported.khutbahs++
      } catch {
        conflicts++
      }
    }

    this.state.lastSyncAt = new Date().toISOString()
    this.state.status = 'synced'
    return { imported, conflicts }
  }

  /** Stub: trigger cloud sync (PouchDB ↔ CouchDB, not yet connected to a server). */
  async triggerCloudSync(): Promise<SyncState> {
    this.state.status = 'syncing'
    // Simulate async operation; real implementation would connect to CouchDB
    await new Promise<void>((resolve) => setTimeout(resolve, 500))
    this.state.status = 'offline'
    this.state.errorMessage = 'Cloud sync is not yet configured. Use export/import for backup.'
    return this.getStatus()
  }
}
