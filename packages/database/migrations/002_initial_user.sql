-- Migration: 002_initial_user
-- Created: 2025-01-01
-- Description: Initial user database schema

BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS highlights (
  id INTEGER PRIMARY KEY,
  resource_key TEXT NOT NULL,
  content_ref TEXT NOT NULL,
  color TEXT NOT NULL CHECK(color IN ('gold', 'green', 'red', 'blue', 'yellow', 'orange', 'fuchsia', 'slate')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY,
  resource_key TEXT NOT NULL,
  content_ref TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('study', 'question', 'reflection', 'khutbah', 'application')),
  body TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS bookmarks (
  id INTEGER PRIMARY KEY,
  resource_key TEXT NOT NULL,
  content_ref TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reading_history (
  id INTEGER PRIMARY KEY,
  resource_key TEXT NOT NULL UNIQUE,
  position TEXT NOT NULL,
  last_visited TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reading_plans (
  id INTEGER PRIMARY KEY,
  plan_key TEXT NOT NULL,
  start_date TEXT NOT NULL,
  target_date TEXT NOT NULL,
  progress_data TEXT NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS khutbahs (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT,
  template_key TEXT NOT NULL CHECK(template_key IN ('jumuah', 'eid-al-fitr', 'eid-al-adha', 'janazah', 'nikah', 'custom')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'final')),
  body TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS khutbah_materials (
  id INTEGER PRIMARY KEY,
  khutbah_id INTEGER NOT NULL REFERENCES khutbahs(id) ON DELETE CASCADE,
  content_ref TEXT NOT NULL,
  order_index INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT 'fuchsia'
);

CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
  body, content=notes, content_rowid=id
);

CREATE INDEX IF NOT EXISTS idx_notes_resource ON notes(resource_key);
CREATE INDEX IF NOT EXISTS idx_highlights_resource ON highlights(resource_key);
CREATE INDEX IF NOT EXISTS idx_bookmarks_resource ON bookmarks(resource_key);

COMMIT;
