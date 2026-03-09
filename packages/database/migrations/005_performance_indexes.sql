-- ============================================================
-- Migration 005: Performance indexes
-- ============================================================

-- Composite index for looking up ayahs by surah + ayah number
CREATE INDEX IF NOT EXISTS idx_ayahs_surah_ayah ON ayahs(surah_id, ayah_number);

-- Composite index for fetching translations filtered by ayah and key
CREATE INDEX IF NOT EXISTS idx_translations_ayah_key ON translations(ayah_id, translation_key);

-- Composite index for fetching tafsir filtered by ayah and key
CREATE INDEX IF NOT EXISTS idx_tafsir_ayah_key ON tafsir_entries(ayah_id, tafsir_key);

-- Composite index for hadith lookup by collection + hadith number
CREATE INDEX IF NOT EXISTS idx_hadiths_collection_number ON hadiths(collection_id, hadith_number);

-- Index on word_morphology(ayah_id) — already created in initial schema but
-- listed here for completeness; IF NOT EXISTS makes it a no-op if present.
CREATE INDEX IF NOT EXISTS idx_word_morphology_ayah ON word_morphology(ayah_id);
