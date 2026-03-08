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
}

// ─── Statement cache ──────────────────────────────────────────────────────────

type CachedStatements = {
  insertNote: Statement
  getNotesByResource: Statement
  getAllNotes: Statement
  updateNote: Statement
  deleteNote: Statement
  insertHighlight: Statement
  getHighlightsByResource: Statement
  deleteHighlight: Statement
  upsertBookmark: Statement
  getBookmarksByResource: Statement
  deleteBookmark: Statement
  getReadingPlan: Statement
  upsertReadingPlan: Statement
  getSetting: Statement
  upsertSetting: Statement
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

      insertHighlight: this.db.prepare(`
        INSERT INTO highlights (resource_key, content_ref, color) VALUES (?, ?, ?)
      `),

      getHighlightsByResource: this.db.prepare(`
        SELECT * FROM highlights WHERE resource_key = ? ORDER BY created_at DESC
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

      upsertReadingPlan: this.db.prepare(`
        INSERT INTO reading_plans (plan_key, start_date, target_date, progress_data)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(plan_key) DO UPDATE SET
          start_date = excluded.start_date,
          target_date = excluded.target_date,
          progress_data = excluded.progress_data
      `),

      getSetting: this.db.prepare(`SELECT value FROM settings WHERE key = ? LIMIT 1`),

      upsertSetting: this.db.prepare(`
        INSERT INTO settings (key, value) VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `),
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

  // ─── Highlights ────────────────────────────────────────────────────────────

  saveHighlight(resourceKey: string, contentRef: string, color: string): number {
    const result = this.stmts.insertHighlight.run(resourceKey, contentRef, color)
    return result.lastInsertRowid as number
  }

  getHighlightsByResource(resourceKey: string): HighlightRow[] {
    return this.stmts.getHighlightsByResource.all(resourceKey) as HighlightRow[]
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

  saveReadingPlan(
    planKey: string,
    startDate: string,
    targetDate: string,
    progressData: Record<string, boolean>
  ): void {
    this.stmts.upsertReadingPlan.run(planKey, startDate, targetDate, JSON.stringify(progressData))
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

  close(): void {
    this.db.close()
  }
}
