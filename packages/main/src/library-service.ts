import Database, { type Database as DatabaseType, type Statement } from 'better-sqlite3'
import fs from 'fs'
import path from 'path'

export interface SearchResult {
  id: number
  type: 'ayah' | 'translation' | 'hadith'
  resourceKey: string
  excerpt: string
  relevance: number
  metadata: Record<string, unknown>
}

export interface AyahRow {
  id: number
  surah_id: number
  ayah_number: number
  arabic_text: string
  arabic_simple: string
  bismillah_pre: number
  surah_number?: number
  surah_arabic_name?: string
  surah_english_name?: string
}

export interface TranslationRow {
  id: number
  ayah_id: number
  translation_key: string
  text: string
  translator: string
  language: string
}

export interface TafsirRow {
  id: number
  ayah_id: number
  tafsir_key: string
  text: string
  language: string
  volume: number | null
  page: number | null
}

export interface HadithRow {
  id: number
  collection_id: number
  book_id: number
  chapter_id: number | null
  hadith_number: string
  arabic_text: string
  english_text: string
  collection_key?: string
  collection_name_english?: string
}

export interface HadithGradeRow {
  id: number
  hadith_id: number
  grade: string
  grader: string
  source: string | null
}

export interface MorphologyRow {
  id: number
  ayah_id: number
  word_position: number
  surface_form: string
  root_id: number | null
  pattern: string | null
  pos: string
  case_marker: string | null
  root_letters?: string | null
  root_meaning_english?: string | null
}

// ─── Statement cache ──────────────────────────────────────────────────────────

type CachedStatements = {
  getAyah: Statement
  getAyahsBySurah: Statement
  getTranslations: Statement
  getTafsir: Statement
  getHadith: Statement
  getHadithGrades: Statement
  getMorphologyForAyah: Statement
  ftsAyah: Statement
  ftsTranslation: Statement
  ftsHadith: Statement
}

export class LibraryService {
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
    this.db.pragma('cache_size = -16000') // ~16 MB page cache

    this.prepareStatements()
  }

  private prepareStatements(): void {
    this.stmts = {
      getAyah: this.db.prepare(`
        SELECT a.*, s.number AS surah_number, s.arabic_name AS surah_arabic_name,
               s.english_name AS surah_english_name
        FROM ayahs a
        JOIN surahs s ON a.surah_id = s.id
        WHERE s.number = ? AND a.ayah_number = ?
        LIMIT 1
      `),

      getAyahsBySurah: this.db.prepare(`
        SELECT a.*, s.number AS surah_number, s.arabic_name AS surah_arabic_name,
               s.english_name AS surah_english_name
        FROM ayahs a
        JOIN surahs s ON a.surah_id = s.id
        WHERE s.number = ?
        ORDER BY a.ayah_number
      `),

      getTranslations: this.db.prepare(`
        SELECT * FROM translations WHERE ayah_id = ?
        ORDER BY translation_key
      `),

      getTafsir: this.db.prepare(`
        SELECT * FROM tafsir_entries WHERE ayah_id = ? AND tafsir_key = ?
        LIMIT 1
      `),

      getHadith: this.db.prepare(`
        SELECT h.*, c.key AS collection_key, c.name_english AS collection_name_english
        FROM hadiths h
        JOIN hadith_collections c ON h.collection_id = c.id
        WHERE c.key = ? AND h.hadith_number = ?
        LIMIT 1
      `),

      getHadithGrades: this.db.prepare(`
        SELECT * FROM hadith_grades WHERE hadith_id = ?
        ORDER BY id
      `),

      getMorphologyForAyah: this.db.prepare(`
        SELECT wm.*, ar.root_letters, ar.meaning_english AS root_meaning_english
        FROM word_morphology wm
        LEFT JOIN arabic_roots ar ON wm.root_id = ar.id
        WHERE wm.ayah_id = ?
        ORDER BY wm.word_position
      `),

      // FTS5 queries — use snippet() for excerpt extraction
      ftsAyah: this.db.prepare(`
        SELECT a.id, a.surah_id, a.ayah_number,
               snippet(ayahs_fts, 0, '<mark>', '</mark>', '…', 24) AS excerpt
        FROM ayahs_fts
        JOIN ayahs a ON ayahs_fts.rowid = a.id
        WHERE ayahs_fts MATCH ?
        ORDER BY rank
        LIMIT ?
        OFFSET ?
      `),

      ftsTranslation: this.db.prepare(`
        SELECT t.id, t.ayah_id, t.translation_key, t.translator,
               snippet(translations_fts, 0, '<mark>', '</mark>', '…', 32) AS excerpt
        FROM translations_fts
        JOIN translations t ON translations_fts.rowid = t.id
        WHERE translations_fts MATCH ?
        ORDER BY rank
        LIMIT ?
        OFFSET ?
      `),

      ftsHadith: this.db.prepare(`
        SELECT h.id, h.collection_id, h.hadith_number, c.key AS collection_key,
               snippet(hadiths_fts, 1, '<mark>', '</mark>', '…', 32) AS excerpt
        FROM hadiths_fts
        JOIN hadiths h ON hadiths_fts.rowid = h.id
        JOIN hadith_collections c ON h.collection_id = c.id
        WHERE hadiths_fts MATCH ?
        ORDER BY rank
        LIMIT ?
        OFFSET ?
      `),
    }
  }

  // ─── Public query API ──────────────────────────────────────────────────────

  getAyah(surahNumber: number, ayahNumber: number): AyahRow | undefined {
    return this.stmts.getAyah.get(surahNumber, ayahNumber) as AyahRow | undefined
  }

  getAyahsBySurah(surahNumber: number): AyahRow[] {
    return this.stmts.getAyahsBySurah.all(surahNumber) as AyahRow[]
  }

  getTranslations(ayahId: number): TranslationRow[] {
    return this.stmts.getTranslations.all(ayahId) as TranslationRow[]
  }

  getTafsir(ayahId: number, tafsirKey: string): TafsirRow | undefined {
    return this.stmts.getTafsir.get(ayahId, tafsirKey) as TafsirRow | undefined
  }

  getHadith(collectionKey: string, hadithNumber: string): HadithRow | undefined {
    return this.stmts.getHadith.get(collectionKey, hadithNumber) as HadithRow | undefined
  }

  getHadithGrades(hadithId: number): HadithGradeRow[] {
    return this.stmts.getHadithGrades.all(hadithId) as HadithGradeRow[]
  }

  getMorphologyForAyah(ayahId: number): MorphologyRow[] {
    return this.stmts.getMorphologyForAyah.all(ayahId) as MorphologyRow[]
  }

  /**
   * Full-text search across Quran (Arabic), translations (English), and Hadith.
   * Returns unified SearchResult array sorted by relevance.
   */
  search(query: string, limit = 20, offset = 0, resourceTypes?: string[]): SearchResult[] {
    // Sanitize query: wrap in quotes if it contains special characters to avoid FTS syntax errors
    const safeQuery = sanitizeFtsQuery(query)

    const results: SearchResult[] = []

    try {
      const types = resourceTypes ?? ['ayah', 'translation', 'hadith']

      if (types.includes('ayah')) {
        const ayahRows = this.stmts.ftsAyah.all(safeQuery, limit, offset) as Array<{
          id: number
          surah_id: number
          ayah_number: number
          excerpt: string
        }>
        for (const row of ayahRows) {
          results.push({
            id: row.id,
            type: 'ayah',
            resourceKey: `quran:${row.surah_id}:${row.ayah_number}`,
            excerpt: row.excerpt,
            relevance: 1,
            metadata: { surahId: row.surah_id, ayahNumber: row.ayah_number },
          })
        }
      }

      if (types.includes('translation')) {
        const transRows = this.stmts.ftsTranslation.all(safeQuery, limit, offset) as Array<{
          id: number
          ayah_id: number
          translation_key: string
          translator: string
          excerpt: string
        }>
        for (const row of transRows) {
          results.push({
            id: row.id,
            type: 'translation',
            resourceKey: `translation:${row.translation_key}:${row.ayah_id}`,
            excerpt: row.excerpt,
            relevance: 0.9,
            metadata: {
              ayahId: row.ayah_id,
              translationKey: row.translation_key,
              translator: row.translator,
            },
          })
        }
      }

      if (types.includes('hadith')) {
        const hadithRows = this.stmts.ftsHadith.all(safeQuery, limit, offset) as Array<{
          id: number
          collection_id: number
          hadith_number: string
          collection_key: string
          excerpt: string
        }>
        for (const row of hadithRows) {
          results.push({
            id: row.id,
            type: 'hadith',
            resourceKey: `hadith:${row.collection_key}:${row.hadith_number}`,
            excerpt: row.excerpt,
            relevance: 0.85,
            metadata: {
              collectionId: row.collection_id,
              collectionKey: row.collection_key,
              hadithNumber: row.hadith_number,
            },
          })
        }
      }
    } catch {
      // If FTS tables don't exist yet (no migrations run), return empty
      return []
    }

    // Sort by relevance descending
    return results.sort((a, b) => b.relevance - a.relevance).slice(0, limit)
  }

  close(): void {
    this.db.close()
  }
}

/**
 * Escape FTS5 query to prevent syntax errors.
 * Wraps the entire query in double quotes if it contains special FTS operators.
 */
function sanitizeFtsQuery(query: string): string {
  // Strip characters that are dangerous in FTS5 queries
  const stripped = query.replace(/["*^]/g, ' ').trim()
  if (!stripped) return '""'
  // If the query contains operators like AND/OR/NOT, pass as-is; otherwise quote it
  if (/\b(AND|OR|NOT)\b/.test(stripped)) {
    return stripped
  }
  return `"${stripped}"`
}
