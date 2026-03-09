import Database, { type Database as DatabaseType, type Statement } from 'better-sqlite3'
import fs from 'fs'
import path from 'path'

// ─── Row types ────────────────────────────────────────────────────────────────

export interface NoteRow {
  id: number
  resource_key: string
  content_ref: string
  type: string
  body: string
  tags: string
  created_at: string
  updated_at: string
}

export interface HighlightRow {
  id: number
  resource_key: string
  content_ref: string
  color: string
  created_at: string
}

export interface BookmarkRow {
  id: number
  resource_key: string
  content_ref: string
  label: string
  created_at: string
}

export interface ReadingPlanRow {
  id: number
  plan_key: string
  start_date: string
  target_date: string
  progress_data: string
  created_at: string
}

export interface KhutbahRow {
  id: number
  title: string
  date: string | null
  template_key: string
  status: string
  body: string
}

export interface KhutbahMaterialRow {
  id: number
  khutbah_id: number
  content_ref: string
  order_index: number
}

// ─── Statement cache ──────────────────────────────────────────────────────────

type CachedStatements = {
  insertNote: Statement
  getNotesByResource: Statement
  getAllNotes: Statement
  updateNote: Statement
  deleteNote: Statement
  searchNotes: Statement
  insertHighlight: Statement
  getHighlightsByResource: Statement
  getAllHighlights: Statement
  deleteHighlight: Statement
  upsertBookmark: Statement
  getBookmarksByResource: Statement
  deleteBookmark: Statement
  getReadingPlan: Statement
  getAllReadingPlans: Statement
  upsertReadingPlan: Statement
  updateReadingPlanProgress: Statement
  deleteReadingPlan: Statement
  getSetting: Statement
  upsertSetting: Statement
  insertKhutbah: Statement
  getKhutbahs: Statement
  getKhutbah: Statement
  updateKhutbah: Statement
  deleteKhutbah: Statement
  insertKhutbahMaterial: Statement
  getKhutbahMaterials: Statement
  deleteKhutbahMaterial: Statement
}

export class UserService {
  private db: DatabaseType
  private stmts!: CachedStatements

  constructor(dbPath: string) {
    const dirPath = path.dirname(dbPath)
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }

    this.db = new Database(dbPath)
    this.db.pragma('journal_mode = WAL')
    this.db.pragma('foreign_keys = ON')

    this.ensureSettingsTable()
    this.prepareStatements()
  }

  /** Create a key-value settings table if it doesn't exist yet. */
  private ensureSettingsTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT NOT NULL PRIMARY KEY,
        value TEXT NOT NULL
      )
    `)
  }

  private prepareStatements(): void {
    this.stmts = {
      insertNote: this.db.prepare(`
        INSERT INTO notes (resource_key, content_ref, type, body, tags)
        VALUES (?, ?, ?, ?, ?)
      `),

      getNotesByResource: this.db.prepare(`
        SELECT * FROM notes WHERE resource_key = ? ORDER BY created_at DESC
      `),

      getAllNotes: this.db.prepare(`
        SELECT * FROM notes ORDER BY updated_at DESC
      `),

      updateNote: this.db.prepare(`
        UPDATE notes SET body = ?, tags = ?, updated_at = datetime('now') WHERE id = ?
      `),

      deleteNote: this.db.prepare(`DELETE FROM notes WHERE id = ?`),

      searchNotes: this.db.prepare(`
        SELECT notes.* FROM notes
        JOIN notes_fts ON notes.id = notes_fts.rowid
        WHERE notes_fts MATCH ?
        ORDER BY rank
        LIMIT ?
      `),

      insertHighlight: this.db.prepare(`
        INSERT INTO highlights (resource_key, content_ref, color) VALUES (?, ?, ?)
      `),

      getHighlightsByResource: this.db.prepare(`
        SELECT * FROM highlights WHERE resource_key = ? ORDER BY created_at DESC
      `),

      getAllHighlights: this.db.prepare(`
        SELECT * FROM highlights ORDER BY created_at DESC
      `),

      deleteHighlight: this.db.prepare(`DELETE FROM highlights WHERE id = ?`),

      upsertBookmark: this.db.prepare(`
        INSERT INTO bookmarks (resource_key, content_ref, label) VALUES (?, ?, ?)
        ON CONFLICT DO UPDATE SET label = excluded.label
      `),

      getBookmarksByResource: this.db.prepare(`
        SELECT * FROM bookmarks WHERE resource_key = ? ORDER BY created_at DESC
      `),

      deleteBookmark: this.db.prepare(`DELETE FROM bookmarks WHERE id = ?`),

      getReadingPlan: this.db.prepare(`
        SELECT * FROM reading_plans WHERE plan_key = ? LIMIT 1
      `),

      getAllReadingPlans: this.db.prepare(`
        SELECT * FROM reading_plans ORDER BY created_at DESC
      `),

      upsertReadingPlan: this.db.prepare(`
        INSERT INTO reading_plans (plan_key, start_date, target_date, progress_data)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(plan_key) DO UPDATE SET
          start_date = excluded.start_date,
          target_date = excluded.target_date,
          progress_data = excluded.progress_data
      `),

      updateReadingPlanProgress: this.db.prepare(`
        UPDATE reading_plans SET progress_data = ? WHERE plan_key = ?
      `),

      deleteReadingPlan: this.db.prepare(`DELETE FROM reading_plans WHERE plan_key = ?`),

      getSetting: this.db.prepare(`SELECT value FROM settings WHERE key = ? LIMIT 1`),

      upsertSetting: this.db.prepare(`
        INSERT INTO settings (key, value) VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `),

      insertKhutbah: this.db.prepare(`
        INSERT INTO khutbahs (title, date, template_key, body) VALUES (?, ?, ?, ?)
      `),

      getKhutbahs: this.db.prepare(`
        SELECT * FROM khutbahs ORDER BY date DESC, id DESC
      `),

      getKhutbah: this.db.prepare(`SELECT * FROM khutbahs WHERE id = ? LIMIT 1`),

      updateKhutbah: this.db.prepare(`
        UPDATE khutbahs SET title = ?, date = ?, body = ?, status = ? WHERE id = ?
      `),

      deleteKhutbah: this.db.prepare(`DELETE FROM khutbahs WHERE id = ?`),

      insertKhutbahMaterial: this.db.prepare(`
        INSERT INTO khutbah_materials (khutbah_id, content_ref, order_index) VALUES (?, ?, ?)
      `),

      getKhutbahMaterials: this.db.prepare(`
        SELECT * FROM khutbah_materials WHERE khutbah_id = ? ORDER BY order_index ASC
      `),

      deleteKhutbahMaterial: this.db.prepare(`DELETE FROM khutbah_materials WHERE id = ?`),
    }
  }

  // ─── Notes ─────────────────────────────────────────────────────────────────

  saveNote(
    resourceKey: string,
    contentRef: string,
    type: string,
    body: string,
    tags: string[]
  ): number {
    const result = this.stmts.insertNote.run(
      resourceKey,
      contentRef,
      type,
      body,
      JSON.stringify(tags)
    )
    return result.lastInsertRowid as number
  }

  getNotesByResource(resourceKey: string): NoteRow[] {
    return this.stmts.getNotesByResource.all(resourceKey) as NoteRow[]
  }

  getAllNotes(): NoteRow[] {
    return this.stmts.getAllNotes.all() as NoteRow[]
  }

  updateNote(id: number, body: string, tags: string[]): void {
    this.stmts.updateNote.run(body, JSON.stringify(tags), id)
  }

  deleteNote(id: number): void {
    this.stmts.deleteNote.run(id)
  }

  searchNotes(query: string, limit = 50): NoteRow[] {
    // Sanitize for FTS5: wrap in quotes for phrase search, append * for prefix
    const ftsQuery = `"${query.replace(/"/g, '""')}"`
    try {
      return this.stmts.searchNotes.all(ftsQuery, limit) as NoteRow[]
    } catch {
      return []
    }
  }

  // ─── Highlights ────────────────────────────────────────────────────────────

  saveHighlight(resourceKey: string, contentRef: string, color: string): number {
    const result = this.stmts.insertHighlight.run(resourceKey, contentRef, color)
    return result.lastInsertRowid as number
  }

  getHighlightsByResource(resourceKey: string): HighlightRow[] {
    return this.stmts.getHighlightsByResource.all(resourceKey) as HighlightRow[]
  }

  getAllHighlights(): HighlightRow[] {
    return this.stmts.getAllHighlights.all() as HighlightRow[]
  }

  deleteHighlight(id: number): void {
    this.stmts.deleteHighlight.run(id)
  }

  // ─── Bookmarks ─────────────────────────────────────────────────────────────

  saveBookmark(resourceKey: string, contentRef: string, label: string): void {
    this.stmts.upsertBookmark.run(resourceKey, contentRef, label)
  }

  getBookmarksByResource(resourceKey: string): BookmarkRow[] {
    return this.stmts.getBookmarksByResource.all(resourceKey) as BookmarkRow[]
  }

  deleteBookmark(id: number): void {
    this.stmts.deleteBookmark.run(id)
  }

  // ─── Reading Plans ─────────────────────────────────────────────────────────

  getReadingPlan(planKey: string): ReadingPlanRow | undefined {
    return this.stmts.getReadingPlan.get(planKey) as ReadingPlanRow | undefined
  }

  getAllReadingPlans(): ReadingPlanRow[] {
    return this.stmts.getAllReadingPlans.all() as ReadingPlanRow[]
  }

  saveReadingPlan(
    planKey: string,
    startDate: string,
    targetDate: string,
    progressData: Record<string, unknown>
  ): void {
    this.stmts.upsertReadingPlan.run(planKey, startDate, targetDate, JSON.stringify(progressData))
  }

  updateReadingPlanProgress(planKey: string, progressData: Record<string, unknown>): void {
    this.stmts.updateReadingPlanProgress.run(JSON.stringify(progressData), planKey)
  }

  deleteReadingPlan(planKey: string): void {
    this.stmts.deleteReadingPlan.run(planKey)
  }

  // ─── Settings ──────────────────────────────────────────────────────────────

  getSetting<T>(key: string, defaultValue: T): T {
    const row = this.stmts.getSetting.get(key) as { value: string } | undefined
    if (!row) return defaultValue
    try {
      return JSON.parse(row.value) as T
    } catch {
      return defaultValue
    }
  }

  setSetting<T>(key: string, value: T): void {
    this.stmts.upsertSetting.run(key, JSON.stringify(value))
  }

  // ─── Khutbah Builder ───────────────────────────────────────────────────────

  saveKhutbah(title: string, date: string | null, templateKey: string, body: string): number {
    const result = this.stmts.insertKhutbah.run(title, date ?? null, templateKey, body)
    return result.lastInsertRowid as number
  }

  getKhutbahs(): KhutbahRow[] {
    return this.stmts.getKhutbahs.all() as KhutbahRow[]
  }

  getKhutbah(id: number): KhutbahRow | undefined {
    return this.stmts.getKhutbah.get(id) as KhutbahRow | undefined
  }

  updateKhutbah(
    id: number,
    title: string,
    date: string | null,
    body: string,
    status: string
  ): void {
    this.stmts.updateKhutbah.run(title, date ?? null, body, status, id)
  }

  deleteKhutbah(id: number): void {
    this.stmts.deleteKhutbah.run(id)
  }

  addKhutbahMaterial(khutbahId: number, contentRef: string, orderIndex: number): number {
    const result = this.stmts.insertKhutbahMaterial.run(khutbahId, contentRef, orderIndex)
    return result.lastInsertRowid as number
  }

  getKhutbahMaterials(khutbahId: number): KhutbahMaterialRow[] {
    return this.stmts.getKhutbahMaterials.all(khutbahId) as KhutbahMaterialRow[]
  }

  removeKhutbahMaterial(id: number): void {
    this.stmts.deleteKhutbahMaterial.run(id)
  }

  close(): void {
    this.db.close()
  }
}
