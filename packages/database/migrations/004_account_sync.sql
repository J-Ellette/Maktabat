-- Migration 004: Account & Sync tables
-- Adds local account profile, sessions, and sync metadata to user.db

CREATE TABLE IF NOT EXISTS account (
  id           INTEGER PRIMARY KEY,
  email        TEXT    NOT NULL UNIQUE,
  display_name TEXT,
  password_hash      TEXT,         -- PBKDF2+SHA512 hash; NULL for SSO-only accounts
  tier         TEXT    NOT NULL DEFAULT 'free',  -- 'free' | 'student' | 'scholar' | 'institution'
  license_key  TEXT,
  license_expires_at TEXT,
  last_online_check  TEXT,    -- ISO-8601; used for 7-day offline grace period
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id           INTEGER PRIMARY KEY,
  account_id   INTEGER NOT NULL REFERENCES account(id) ON DELETE CASCADE,
  token        TEXT    NOT NULL UNIQUE,
  device_label TEXT,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  expires_at   TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS sync_log (
  id           INTEGER PRIMARY KEY,
  direction    TEXT    NOT NULL,  -- 'push' | 'pull'
  entity_type  TEXT    NOT NULL,  -- 'note' | 'highlight' | 'bookmark' | 'reading_plan' | 'khutbah'
  entity_id    INTEGER NOT NULL,
  synced_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  status       TEXT    NOT NULL DEFAULT 'ok'  -- 'ok' | 'conflict' | 'error'
);

CREATE INDEX IF NOT EXISTS idx_sessions_account ON sessions(account_id);
CREATE INDEX IF NOT EXISTS idx_sync_log_entity ON sync_log(entity_type, entity_id);
