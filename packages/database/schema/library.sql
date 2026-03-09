-- ============================================================
-- Maktabat Library Database Schema
-- ============================================================

-- Core Quran content
CREATE TABLE IF NOT EXISTS surahs (
  id INTEGER PRIMARY KEY,
  number INTEGER NOT NULL UNIQUE,
  arabic_name TEXT NOT NULL,
  transliterated_name TEXT NOT NULL,
  english_name TEXT NOT NULL,
  revelation_type TEXT NOT NULL CHECK(revelation_type IN ('meccan', 'medinan')),
  verse_count INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS ayahs (
  id INTEGER PRIMARY KEY,
  surah_id INTEGER NOT NULL REFERENCES surahs(id),
  ayah_number INTEGER NOT NULL,
  arabic_text TEXT NOT NULL,
  arabic_simple TEXT NOT NULL,
  bismillah_pre INTEGER NOT NULL DEFAULT 0,
  UNIQUE(surah_id, ayah_number)
);

CREATE TABLE IF NOT EXISTS translations (
  id INTEGER PRIMARY KEY,
  ayah_id INTEGER NOT NULL REFERENCES ayahs(id),
  translation_key TEXT NOT NULL,
  text TEXT NOT NULL,
  translator TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  UNIQUE(ayah_id, translation_key)
);

CREATE TABLE IF NOT EXISTS tafsir_entries (
  id INTEGER PRIMARY KEY,
  ayah_id INTEGER NOT NULL REFERENCES ayahs(id),
  tafsir_key TEXT NOT NULL,
  text TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  volume INTEGER,
  page INTEGER,
  UNIQUE(ayah_id, tafsir_key)
);

-- Hadith tables
CREATE TABLE IF NOT EXISTS hadith_collections (
  id INTEGER PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  name_arabic TEXT NOT NULL,
  name_english TEXT NOT NULL,
  tradition TEXT NOT NULL CHECK(tradition IN ('sunni', 'shia', 'ibadi')),
  tier TEXT NOT NULL CHECK(tier IN ('primary', 'secondary', 'commentary')),
  compiler TEXT NOT NULL,
  century INTEGER
);

CREATE TABLE IF NOT EXISTS hadith_books (
  id INTEGER PRIMARY KEY,
  collection_id INTEGER NOT NULL REFERENCES hadith_collections(id),
  book_number INTEGER NOT NULL,
  name_arabic TEXT,
  name_english TEXT NOT NULL,
  UNIQUE(collection_id, book_number)
);

CREATE TABLE IF NOT EXISTS hadith_chapters (
  id INTEGER PRIMARY KEY,
  book_id INTEGER NOT NULL REFERENCES hadith_books(id),
  chapter_number INTEGER NOT NULL,
  name_arabic TEXT,
  name_english TEXT,
  UNIQUE(book_id, chapter_number)
);

CREATE TABLE IF NOT EXISTS hadiths (
  id INTEGER PRIMARY KEY,
  collection_id INTEGER NOT NULL REFERENCES hadith_collections(id),
  book_id INTEGER NOT NULL REFERENCES hadith_books(id),
  chapter_id INTEGER REFERENCES hadith_chapters(id),
  hadith_number TEXT NOT NULL,
  arabic_text TEXT NOT NULL,
  english_text TEXT NOT NULL,
  UNIQUE(collection_id, hadith_number)
);

CREATE TABLE IF NOT EXISTS hadith_grades (
  id INTEGER PRIMARY KEY,
  hadith_id INTEGER NOT NULL REFERENCES hadiths(id),
  grade TEXT NOT NULL CHECK(grade IN ('sahih', 'hasan', 'hasan-li-ghayrihi', 'daif', 'mawdu')),
  grader TEXT NOT NULL,
  source TEXT
);

CREATE TABLE IF NOT EXISTS hadith_narrators (
  id INTEGER PRIMARY KEY,
  name_arabic TEXT NOT NULL,
  name_english TEXT NOT NULL,
  birth_year INTEGER,
  death_year INTEGER,
  reliability TEXT NOT NULL DEFAULT 'unknown' CHECK(reliability IN ('thiqah', 'sadooq', 'daif', 'unknown'))
);

CREATE TABLE IF NOT EXISTS isnad_entries (
  id INTEGER PRIMARY KEY,
  hadith_id INTEGER NOT NULL REFERENCES hadiths(id),
  position INTEGER NOT NULL,
  narrator_id INTEGER NOT NULL REFERENCES hadith_narrators(id),
  UNIQUE(hadith_id, position)
);

-- Cross-reference tables
CREATE TABLE IF NOT EXISTS hadith_ayah_refs (
  id INTEGER PRIMARY KEY,
  hadith_id INTEGER NOT NULL REFERENCES hadiths(id),
  ayah_id INTEGER NOT NULL REFERENCES ayahs(id),
  relation_type TEXT NOT NULL DEFAULT 'related',
  UNIQUE(hadith_id, ayah_id)
);

CREATE TABLE IF NOT EXISTS tafsir_hadith_refs (
  id INTEGER PRIMARY KEY,
  tafsir_entry_id INTEGER NOT NULL REFERENCES tafsir_entries(id),
  hadith_id INTEGER NOT NULL REFERENCES hadiths(id),
  UNIQUE(tafsir_entry_id, hadith_id)
);

CREATE TABLE IF NOT EXISTS topics (
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name_arabic TEXT,
  name_english TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS topic_ayah_refs (
  id INTEGER PRIMARY KEY,
  topic_id INTEGER NOT NULL REFERENCES topics(id),
  ayah_id INTEGER NOT NULL REFERENCES ayahs(id),
  UNIQUE(topic_id, ayah_id)
);

CREATE TABLE IF NOT EXISTS topic_hadith_refs (
  id INTEGER PRIMARY KEY,
  topic_id INTEGER NOT NULL REFERENCES topics(id),
  hadith_id INTEGER NOT NULL REFERENCES hadiths(id),
  UNIQUE(topic_id, hadith_id)
);

-- Arabic language tables
CREATE TABLE IF NOT EXISTS arabic_roots (
  id INTEGER PRIMARY KEY,
  root_letters TEXT NOT NULL UNIQUE,
  meaning_arabic TEXT,
  meaning_english TEXT
);

CREATE TABLE IF NOT EXISTS word_morphology (
  id INTEGER PRIMARY KEY,
  ayah_id INTEGER NOT NULL REFERENCES ayahs(id),
  word_position INTEGER NOT NULL,
  surface_form TEXT NOT NULL,
  root_id INTEGER REFERENCES arabic_roots(id),
  pattern TEXT,
  pos TEXT NOT NULL,
  case_marker TEXT,
  UNIQUE(ayah_id, word_position)
);

CREATE TABLE IF NOT EXISTS dictionary_entries (
  id INTEGER PRIMARY KEY,
  root_id INTEGER NOT NULL REFERENCES arabic_roots(id),
  source_key TEXT NOT NULL,
  definition_arabic TEXT,
  definition_english TEXT
);

-- Resource metadata
CREATE TABLE IF NOT EXISTS resources (
  id INTEGER PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  title_arabic TEXT,
  title_english TEXT NOT NULL,
  author TEXT,
  tradition TEXT,
  type TEXT NOT NULL,
  century INTEGER,
  tier TEXT
);

-- Factbook
CREATE TABLE IF NOT EXISTS factbook_entries (
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title_arabic TEXT,
  title_english TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('person', 'place', 'event', 'concept', 'surah', 'collection')),
  summary TEXT,
  body TEXT
);

CREATE TABLE IF NOT EXISTS factbook_ayah_refs (
  id INTEGER PRIMARY KEY,
  entry_id INTEGER NOT NULL REFERENCES factbook_entries(id),
  ayah_id INTEGER NOT NULL REFERENCES ayahs(id),
  UNIQUE(entry_id, ayah_id)
);

-- FTS5 search tables
CREATE VIRTUAL TABLE IF NOT EXISTS ayahs_fts USING fts5(
  arabic_simple, content=ayahs, content_rowid=id
);

CREATE VIRTUAL TABLE IF NOT EXISTS translations_fts USING fts5(
  text, content=translations, content_rowid=id
);

CREATE VIRTUAL TABLE IF NOT EXISTS hadiths_fts USING fts5(
  arabic_text, english_text, content=hadiths, content_rowid=id
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ayahs_surah ON ayahs(surah_id);
CREATE INDEX IF NOT EXISTS idx_ayahs_surah_ayah ON ayahs(surah_id, ayah_number);
CREATE INDEX IF NOT EXISTS idx_translations_ayah ON translations(ayah_id);
CREATE INDEX IF NOT EXISTS idx_translations_ayah_key ON translations(ayah_id, translation_key);
CREATE INDEX IF NOT EXISTS idx_tafsir_ayah ON tafsir_entries(ayah_id);
CREATE INDEX IF NOT EXISTS idx_tafsir_ayah_key ON tafsir_entries(ayah_id, tafsir_key);
CREATE INDEX IF NOT EXISTS idx_hadiths_collection ON hadiths(collection_id);
CREATE INDEX IF NOT EXISTS idx_hadiths_collection_number ON hadiths(collection_id, hadith_number);
CREATE INDEX IF NOT EXISTS idx_hadith_grades_hadith ON hadith_grades(hadith_id);
CREATE INDEX IF NOT EXISTS idx_word_morphology_ayah ON word_morphology(ayah_id);
CREATE INDEX IF NOT EXISTS idx_word_morphology_root ON word_morphology(root_id);
