import Database, { type Database as DatabaseType, type Statement } from 'better-sqlite3'
import crypto from 'crypto'
import path from 'path'
import fs from 'fs'

// ─── Row Types ────────────────────────────────────────────────────────────────

export interface AccountRow {
  id: number
  email: string
  display_name: string | null
  tier: 'free' | 'student' | 'scholar' | 'institution'
  license_key: string | null
  license_expires_at: string | null
  last_online_check: string | null
  created_at: string
  updated_at: string
}

export interface SessionRow {
  id: number
  account_id: number
  token: string
  device_label: string | null
  created_at: string
  expires_at: string
}

export interface AccountProfile {
  id: number
  email: string
  displayName: string | null
  tier: 'free' | 'student' | 'scholar' | 'institution'
  licenseKey: string | null
  licenseExpiresAt: string | null
  isLicenseValid: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Simple PBKDF2-based password hash (no external deps). */
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 100_000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, expected] = stored.split(':')
  if (!salt || !expected) return false
  const actual = crypto.pbkdf2Sync(password, salt, 100_000, 64, 'sha512').toString('hex')
  // Constant-time compare
  return crypto.timingSafeEqual(Buffer.from(actual, 'hex'), Buffer.from(expected, 'hex'))
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// ─── Service ──────────────────────────────────────────────────────────────────

type CachedStatements = {
  insertAccount: Statement
  getAccountByEmail: Statement
  getAccountById: Statement
  updateAccountName: Statement
  updateLastOnlineCheck: Statement
  insertSession: Statement
  getSessionByToken: Statement
  deleteSession: Statement
  deleteExpiredSessions: Statement
}

// Grace period: 7 days without an internet check before license is considered unverified
const OFFLINE_GRACE_DAYS = 7
/** Session duration in days. */
const SESSION_DURATION_DAYS = 90

export class AccountService {
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
    this.ensureSchema()
    this.prepareStatements()
  }

  private ensureSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS account (
        id                 INTEGER PRIMARY KEY,
        email              TEXT    NOT NULL UNIQUE,
        display_name       TEXT,
        password_hash      TEXT,
        tier               TEXT    NOT NULL DEFAULT 'free',
        license_key        TEXT,
        license_expires_at TEXT,
        last_online_check  TEXT,
        created_at         TEXT    NOT NULL DEFAULT (datetime('now')),
        updated_at         TEXT    NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id           INTEGER PRIMARY KEY,
        account_id   INTEGER NOT NULL REFERENCES account(id) ON DELETE CASCADE,
        token        TEXT    NOT NULL UNIQUE,
        device_label TEXT,
        created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
        expires_at   TEXT    NOT NULL
      );
    `)
  }

  private prepareStatements(): void {
    this.stmts = {
      insertAccount: this.db.prepare(`
        INSERT INTO account (email, display_name, password_hash, tier)
        VALUES (?, ?, ?, 'free')
        RETURNING id, email, display_name, tier, license_key, license_expires_at,
                  last_online_check, created_at, updated_at
      `),

      getAccountByEmail: this.db.prepare(`
        SELECT id, email, display_name, password_hash, tier, license_key,
               license_expires_at, last_online_check, created_at, updated_at
        FROM account WHERE email = ? LIMIT 1
      `),

      getAccountById: this.db.prepare(`
        SELECT id, email, display_name, tier, license_key, license_expires_at,
               last_online_check, created_at, updated_at
        FROM account WHERE id = ? LIMIT 1
      `),

      updateAccountName: this.db.prepare(`
        UPDATE account SET display_name = ?, updated_at = datetime('now') WHERE id = ?
      `),

      updateLastOnlineCheck: this.db.prepare(`
        UPDATE account SET last_online_check = datetime('now'), updated_at = datetime('now')
        WHERE id = ?
      `),

      insertSession: this.db.prepare(`
        INSERT INTO sessions (account_id, token, device_label, expires_at)
        VALUES (?, ?, ?, ?)
        RETURNING id, account_id, token, device_label, created_at, expires_at
      `),

      getSessionByToken: this.db.prepare(`
        SELECT s.*, a.email, a.display_name, a.tier, a.license_key, a.license_expires_at,
               a.last_online_check
        FROM sessions s
        JOIN account a ON a.id = s.account_id
        WHERE s.token = ? AND s.expires_at > datetime('now')
        LIMIT 1
      `),

      deleteSession: this.db.prepare(`DELETE FROM sessions WHERE token = ?`),

      deleteExpiredSessions: this.db.prepare(
        `DELETE FROM sessions WHERE expires_at <= datetime('now')`
      ),
    }
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  signUp(
    email: string,
    password: string,
    displayName?: string
  ): { token: string; profile: AccountProfile } {
    const existing = this.stmts.getAccountByEmail.get(email)
    if (existing) throw new Error('An account with this email already exists.')

    const passwordHash = hashPassword(password)
    const row = this.stmts.insertAccount.get(
      email.toLowerCase().trim(),
      displayName ?? null,
      passwordHash
    ) as AccountRow

    const token = this._createSession(row.id)
    return { token, profile: this._toProfile(row) }
  }

  signIn(email: string, password: string): { token: string; profile: AccountProfile } {
    const row = this.stmts.getAccountByEmail.get(email.toLowerCase().trim()) as
      | (AccountRow & { password_hash: string })
      | undefined

    if (!row) throw new Error('No account found with this email address.')
    if (!row.password_hash)
      throw new Error('This account uses social sign-in. Please use Google SSO.')

    const valid = verifyPassword(password, row.password_hash)
    if (!valid) throw new Error('Incorrect password.')

    const token = this._createSession(row.id)
    return { token, profile: this._toProfile(row) }
  }

  signOut(token: string): void {
    this.stmts.deleteSession.run(token)
  }

  getProfileByToken(token: string): AccountProfile | null {
    const row = this.stmts.getSessionByToken.get(token) as
      | (AccountRow & { account_id: number })
      | undefined
    if (!row) return null
    return this._toProfile(row)
  }

  updateDisplayName(token: string, name: string): AccountProfile | null {
    const row = this.stmts.getSessionByToken.get(token) as
      | (AccountRow & { account_id: number })
      | undefined
    if (!row) return null
    this.stmts.updateAccountName.run(name.trim(), row.account_id)
    return this.getProfileByToken(token)
  }

  markOnlineCheck(token: string): void {
    const row = this.stmts.getSessionByToken.get(token) as
      | (AccountRow & { account_id: number })
      | undefined
    if (row) this.stmts.updateLastOnlineCheck.run(row.account_id)
  }

  pruneExpiredSessions(): void {
    this.stmts.deleteExpiredSessions.run()
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private _createSession(accountId: number): string {
    const token = generateToken()
    // Sessions expire after SESSION_DURATION_DAYS days
    const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000)
      .toISOString()
      .replace('T', ' ')
      .slice(0, 19)
    const deviceLabel = `Device ${Date.now()}`
    this.stmts.insertSession.run(accountId, token, deviceLabel, expiresAt)
    return token
  }

  private _toProfile(row: AccountRow): AccountProfile {
    const isLicenseValid = this._isLicenseValid(row)
    return {
      id: row.id,
      email: row.email,
      displayName: row.display_name ?? null,
      tier: row.tier,
      licenseKey: row.license_key ?? null,
      licenseExpiresAt: row.license_expires_at ?? null,
      isLicenseValid,
    }
  }

  private _isLicenseValid(row: AccountRow): boolean {
    // Free tier is always valid
    if (row.tier === 'free') return true
    // If no license expiry, treat as valid (lifetime)
    if (!row.license_expires_at) return true
    // Check expiry
    const expires = new Date(row.license_expires_at)
    if (expires > new Date()) return true
    // Offline grace period: if no last_online_check, assume within grace
    if (!row.last_online_check) return true
    const lastCheck = new Date(row.last_online_check)
    const daysSinceCheck = (Date.now() - lastCheck.getTime()) / (1000 * 60 * 60 * 24)
    return daysSinceCheck <= OFFLINE_GRACE_DAYS
  }
}
