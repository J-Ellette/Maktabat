import { describe, it, expect, afterEach } from 'vitest'
import { runMigrations } from './migrate'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import os from 'os'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const migrationsDir = path.resolve(__dirname, '../migrations')

describe('runMigrations', () => {
  let dbPath: string

  afterEach(() => {
    if (dbPath && fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath)
    }
  })

  it('should run migrations on a fresh database', () => {
    dbPath = path.join(os.tmpdir(), `test-migrate-${Date.now()}.db`)

    expect(() => runMigrations({ dbPath, migrationsDir })).not.toThrow()
  })

  it('should be idempotent (running twice should not error)', () => {
    dbPath = path.join(os.tmpdir(), `test-migrate-idempotent-${Date.now()}.db`)

    runMigrations({ dbPath, migrationsDir })
    expect(() => runMigrations({ dbPath, migrationsDir })).not.toThrow()
  })

  it('should create schema_migrations table', () => {
    dbPath = path.join(os.tmpdir(), `test-migrate-schema-${Date.now()}.db`)
    const Database = require('better-sqlite3')

    runMigrations({ dbPath, migrationsDir })

    const db = new Database(dbPath)
    const tableExists = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='schema_migrations'")
      .get()
    expect(tableExists).toBeTruthy()
    db.close()
  })
})
