-- Migration: 003_reading_plans_update
-- Created: 2026-03-09
-- Description: Add unique constraint on plan_key and created_at to reading_plans

BEGIN TRANSACTION;

-- SQLite does not support ADD CONSTRAINT on existing tables, so we recreate the table.
CREATE TABLE IF NOT EXISTS reading_plans_new (
  id INTEGER PRIMARY KEY,
  plan_key TEXT NOT NULL UNIQUE,
  start_date TEXT NOT NULL,
  target_date TEXT NOT NULL,
  progress_data TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO reading_plans_new (id, plan_key, start_date, target_date, progress_data)
  SELECT id, plan_key, start_date, target_date, progress_data FROM reading_plans;

DROP TABLE reading_plans;
ALTER TABLE reading_plans_new RENAME TO reading_plans;

COMMIT;
