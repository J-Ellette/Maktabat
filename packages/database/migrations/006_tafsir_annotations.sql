-- Migration 006: Tafsir Passage Annotations
-- Adds a table for annotating tafsir passages with scholarly markers:
-- key_ruling (ahkam), ijaz (eloquence), disputed, linguistic_note, historical_context

CREATE TABLE IF NOT EXISTS tafsir_annotations (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  tafsir_key TEXT    NOT NULL,
  ayah_id    INTEGER NOT NULL,
  type       TEXT    NOT NULL CHECK (type IN ('key_ruling', 'ijaz', 'disputed', 'linguistic_note', 'historical_context')),
  label      TEXT    NOT NULL DEFAULT '',
  note       TEXT    NOT NULL DEFAULT '',
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (ayah_id) REFERENCES ayahs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tafsir_annotations_ayah
  ON tafsir_annotations (ayah_id, tafsir_key);

-- Seed sample annotations for Al-Fatiha (ibn-kathir)
-- These correspond to ayah IDs 1–7 which are seeded in 001_initial_library.sql

INSERT OR IGNORE INTO tafsir_annotations (tafsir_key, ayah_id, type, label, note)
SELECT 'ibn-kathir', a.id, 'key_ruling', 'Basmalah Ruling', 'Scholars differ on whether the Basmalah is a verse of Al-Fatiha or a separate verse; Imam al-Shafi''i held it is a verse, while Imam Malik did not.'
FROM ayahs a JOIN surahs s ON a.surah_id = s.id
WHERE s.number = 1 AND a.ayah_number = 1
LIMIT 1;

INSERT OR IGNORE INTO tafsir_annotations (tafsir_key, ayah_id, type, label, note)
SELECT 'ibn-kathir', a.id, 'ijaz', 'Concise Praise', 'Ibn Kathir notes the miraculous brevity of this verse: all forms of praise are attributed to Allah without restriction.'
FROM ayahs a JOIN surahs s ON a.surah_id = s.id
WHERE s.number = 1 AND a.ayah_number = 2
LIMIT 1;

INSERT OR IGNORE INTO tafsir_annotations (tafsir_key, ayah_id, type, label, note)
SELECT 'ibn-kathir', a.id, 'disputed', 'Names of Allah', 'Al-Razi and others discuss whether "al-Rahman" and "al-Rahim" are synonyms or have distinct meanings; the majority hold they differ in degree of mercy.'
FROM ayahs a JOIN surahs s ON a.surah_id = s.id
WHERE s.number = 1 AND a.ayah_number = 3
LIMIT 1;

INSERT OR IGNORE INTO tafsir_annotations (tafsir_key, ayah_id, type, label, note)
SELECT 'ibn-kathir', a.id, 'linguistic_note', 'Iyyaka — Fronting for Emphasis', 'The object "You alone" is fronted before the verb "we worship" to express exclusivity — a classical Arabic rhetorical device (taqdim al-ma''mul).'
FROM ayahs a JOIN surahs s ON a.surah_id = s.id
WHERE s.number = 1 AND a.ayah_number = 5
LIMIT 1;

INSERT OR IGNORE INTO tafsir_annotations (tafsir_key, ayah_id, type, label, note)
SELECT 'ibn-kathir', a.id, 'key_ruling', 'Recitation Ruling', 'This verse and the following dua is obligatory to recite in every rak''ah of the prayer (Sahih — reported in Muslim).'
FROM ayahs a JOIN surahs s ON a.surah_id = s.id
WHERE s.number = 1 AND a.ayah_number = 6
LIMIT 1;

INSERT OR IGNORE INTO tafsir_annotations (tafsir_key, ayah_id, type, label, note)
SELECT 'ibn-kathir', a.id, 'historical_context', 'The Three Paths', 'Ibn Kathir identifies "those blessed" as prophets and the righteous; "those who earned anger" as those who knew the truth but rejected it (Banu Isra''il); "those who went astray" as those without knowledge (Christians per ibn Abbas).'
FROM ayahs a JOIN surahs s ON a.surah_id = s.id
WHERE s.number = 1 AND a.ayah_number = 7
LIMIT 1;
