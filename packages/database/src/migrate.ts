import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'

export interface MigrationOptions {
  dbPath: string
  migrationsDir: string
}

export interface MigrationRecord {
  version: string
  applied_at: string
}

export function runMigrations(options: MigrationOptions): void {
  const { dbPath, migrationsDir } = options
  const db = new Database(dbPath)

  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  // Create migrations tracking table if not exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT NOT NULL PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  // Get applied migrations
  const applied = new Set(
    (
      db
        .prepare('SELECT version FROM schema_migrations ORDER BY version')
        .all() as MigrationRecord[]
    ).map((r) => r.version)
  )

  // Find and sort migration files
  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort()

  for (const file of migrationFiles) {
    const version = file.replace('.sql', '')
    if (applied.has(version)) {
      console.log(`Skipping migration ${version} (already applied)`)
      continue
    }

    console.log(`Applying migration ${version}...`)
    const rawSql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8')
    // Migration files may include their own BEGIN TRANSACTION / COMMIT wrapper.
    // Strip only full-line occurrences of these markers (not ones inside
    // comments or string literals) so we can manage the transaction ourselves
    // and atomically record the migration version alongside the SQL changes.
    const sql = rawSql
      .replace(/^\s*BEGIN\s+TRANSACTION\s*;\s*$/gim, '')
      .replace(/^\s*COMMIT\s*;\s*$/gim, '')

    db.transaction(() => {
      db.exec(sql)
      db.prepare('INSERT INTO schema_migrations (version) VALUES (?)').run(version)
    })()

    console.log(`Migration ${version} applied successfully`)
  }

  db.close()
}

export function rollbackMigration(options: MigrationOptions & { version: string }): void {
  console.warn('Rollback not yet implemented for version:', options.version)
  // Down migrations would be implemented here in a later phase
}
