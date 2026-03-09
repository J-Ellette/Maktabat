import { ipcMain } from 'electron'
import type { LibraryService } from './library-service.js'
import type { UserService } from './user-service.js'

// ─── Input validation helpers ─────────────────────────────────────────────────

function assertString(value: unknown, name: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Invalid input: '${name}' must be a non-empty string`)
  }
  return value.trim()
}

function assertNumber(value: unknown, name: string): number {
  const n = Number(value)
  if (!Number.isFinite(n) || n < 0) {
    throw new Error(`Invalid input: '${name}' must be a non-negative number`)
  }
  return n
}

function assertStringArray(value: unknown, name: string): string[] {
  if (!Array.isArray(value)) {
    throw new Error(`Invalid input: '${name}' must be an array`)
  }
  return (value as unknown[]).map((v) => assertString(v, `${name}[]`))
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && (value as unknown[]).every((v) => typeof v === 'string')
}

// ─── Registration ──────────────────────────────────────────────────────────────

export function registerIpcHandlers(
  libraryService: LibraryService,
  userService: UserService
): void {
  // ── library:get-surahs ──────────────────────────────────────────────────────
  ipcMain.handle('library:get-surahs', () => {
    return libraryService.getSurahs()
  })

  // ── library:get-ayahs-by-surah ──────────────────────────────────────────────
  ipcMain.handle('library:get-ayahs-by-surah', (_event, surahNumber: unknown) => {
    const sn = assertNumber(surahNumber, 'surahNumber')
    if (sn < 1 || sn > 114) throw new Error('surahNumber must be between 1 and 114')

    const ayahs = libraryService.getAyahsBySurah(sn)
    // For each ayah also get translations
    return ayahs.map((ayah) => ({
      ayah,
      translations: libraryService.getTranslations(ayah.id),
      morphology: libraryService.getMorphologyForAyah(ayah.id),
    }))
  })

  // ── library:get-translations ────────────────────────────────────────────────
  ipcMain.handle('library:get-translations', (_event, ayahId: unknown) => {
    const id = assertNumber(ayahId, 'ayahId')
    return libraryService.getTranslations(id)
  })

  // ── library:get-ayah ────────────────────────────────────────────────────────
  ipcMain.handle('library:get-ayah', (_event, surahNumber: unknown, ayahNumber: unknown) => {
    const sn = assertNumber(surahNumber, 'surahNumber')
    const an = assertNumber(ayahNumber, 'ayahNumber')
    if (sn < 1 || sn > 114) throw new Error('surahNumber must be between 1 and 114')
    if (an < 1 || an > 286) throw new Error('ayahNumber must be between 1 and 286')

    const ayah = libraryService.getAyah(sn, an)
    if (!ayah) return null

    const translations = libraryService.getTranslations(ayah.id)
    return { ayah, translations }
  })

  // ── library:get-tafsir ──────────────────────────────────────────────────────
  ipcMain.handle('library:get-tafsir', (_event, ayahId: unknown, tafsirKey: unknown) => {
    const id = assertNumber(ayahId, 'ayahId')
    const key = assertString(tafsirKey, 'tafsirKey')
    return libraryService.getTafsir(id, key) ?? null
  })

  // ── library:get-tafsirs-for-ayah ────────────────────────────────────────────
  ipcMain.handle('library:get-tafsirs-for-ayah', (_event, ayahId: unknown) => {
    const id = assertNumber(ayahId, 'ayahId')
    return libraryService.getTafsirsForAyah(id)
  })

  // ── library:get-tafsirs-by-surah ────────────────────────────────────────────
  ipcMain.handle(
    'library:get-tafsirs-by-surah',
    (_event, surahNumber: unknown, tafsirKey: unknown) => {
      const sn = assertNumber(surahNumber, 'surahNumber')
      const key = assertString(tafsirKey, 'tafsirKey')
      if (sn < 1 || sn > 114) throw new Error('surahNumber must be between 1 and 114')
      return libraryService.getTafsirsBySurah(sn, key)
    }
  )

  // ── library:get-tafsir-keys ─────────────────────────────────────────────────
  ipcMain.handle('library:get-tafsir-keys', () => {
    return libraryService.getTafsirKeys()
  })

  // ── library:get-hadith ──────────────────────────────────────────────────────
  ipcMain.handle('library:get-hadith', (_event, collectionKey: unknown, hadithNumber: unknown) => {
    const ck = assertString(collectionKey, 'collectionKey')
    const hn = assertString(hadithNumber, 'hadithNumber')

    const hadith = libraryService.getHadith(ck, hn)
    if (!hadith) return null

    const grades = libraryService.getHadithGrades(hadith.id)
    return { hadith, grades }
  })

  // ── library:get-hadith-collections ─────────────────────────────────────────
  ipcMain.handle('library:get-hadith-collections', () => {
    return libraryService.getHadithCollections()
  })

  // ── library:get-hadith-books ────────────────────────────────────────────────
  ipcMain.handle('library:get-hadith-books', (_event, collectionKey: unknown) => {
    const ck = assertString(collectionKey, 'collectionKey')
    return libraryService.getHadithBooks(ck)
  })

  // ── library:get-hadith-chapters ─────────────────────────────────────────────
  ipcMain.handle('library:get-hadith-chapters', (_event, bookId: unknown) => {
    const id = assertNumber(bookId, 'bookId')
    return libraryService.getHadithChapters(id)
  })

  // ── library:get-hadiths-by-book ──────────────────────────────────────────────
  ipcMain.handle('library:get-hadiths-by-book', (_event, bookId: unknown) => {
    const id = assertNumber(bookId, 'bookId')
    return libraryService.getHadithsByBook(id)
  })

  // ── library:get-hadiths-by-chapter ──────────────────────────────────────────
  ipcMain.handle('library:get-hadiths-by-chapter', (_event, chapterId: unknown) => {
    const id = assertNumber(chapterId, 'chapterId')
    return libraryService.getHadithsByChapter(id)
  })

  // ── library:get-hadith-by-id ─────────────────────────────────────────────────
  ipcMain.handle('library:get-hadith-by-id', (_event, hadithId: unknown) => {
    const id = assertNumber(hadithId, 'hadithId')

    const hadith = libraryService.getHadithById(id)
    if (!hadith) return null

    const grades = libraryService.getHadithGrades(hadith.id)
    const isnad = libraryService.getIsnad(hadith.id)
    return { hadith, grades, isnad }
  })

  // ── library:get-isnad ────────────────────────────────────────────────────────
  ipcMain.handle('library:get-isnad', (_event, hadithId: unknown) => {
    const id = assertNumber(hadithId, 'hadithId')
    return libraryService.getIsnad(id)
  })

  // ── library:search-hadiths ───────────────────────────────────────────────────
  ipcMain.handle(
    'library:search-hadiths',
    (
      _event,
      query: unknown,
      collectionKey: unknown,
      grade: unknown,
      limit: unknown,
      offset: unknown
    ) => {
      const q = assertString(query, 'query')
      if (q.length > 500) throw new Error('Query too long (max 500 characters)')

      const ck =
        collectionKey !== undefined && collectionKey !== null
          ? assertString(collectionKey, 'collectionKey')
          : undefined
      const gr = grade !== undefined && grade !== null ? assertString(grade, 'grade') : undefined
      const lim = limit !== undefined ? Math.min(assertNumber(limit, 'limit'), 100) : 20
      const off = offset !== undefined ? assertNumber(offset, 'offset') : 0

      return libraryService.searchHadiths(q, ck, gr, lim, off)
    }
  )

  // ── library:get-morphology ──────────────────────────────────────────────────
  ipcMain.handle('library:get-morphology', (_event, ayahId: unknown) => {
    const id = assertNumber(ayahId, 'ayahId')
    return libraryService.getMorphologyForAyah(id)
  })

  // ── library:get-word-occurrences ────────────────────────────────────────────
  ipcMain.handle('library:get-word-occurrences', (_event, root: unknown) => {
    const r = assertString(root, 'root')
    if (r.length > 10) throw new Error('root exceeds maximum length of 10 characters')
    return libraryService.getWordOccurrences(r)
  })

  // ── library:search ──────────────────────────────────────────────────────────
  ipcMain.handle(
    'library:search',
    (_event, query: unknown, limit: unknown, offset: unknown, resourceTypes: unknown) => {
      const q = assertString(query, 'query')
      if (q.length > 500) throw new Error('Query too long (max 500 characters)')

      const lim = limit !== undefined ? Math.min(assertNumber(limit, 'limit'), 100) : 20
      const off = offset !== undefined ? assertNumber(offset, 'offset') : 0
      const types =
        resourceTypes !== undefined && isStringArray(resourceTypes)
          ? assertStringArray(resourceTypes, 'resourceTypes')
          : undefined

      return libraryService.search(q, lim, off, types)
    }
  )

  // ── user:save-note ──────────────────────────────────────────────────────────
  ipcMain.handle(
    'user:save-note',
    (
      _event,
      resourceKey: unknown,
      contentRef: unknown,
      type: unknown,
      body: unknown,
      tags: unknown
    ) => {
      const rk = assertString(resourceKey, 'resourceKey')
      const cr = assertString(contentRef, 'contentRef')
      const t = assertString(type, 'type')
      const b = assertString(body, 'body')
      const tg = tags !== undefined && isStringArray(tags) ? assertStringArray(tags, 'tags') : []

      const VALID_TYPES = ['study', 'question', 'reflection', 'khutbah', 'application']
      if (!VALID_TYPES.includes(t)) {
        throw new Error(`Invalid note type. Must be one of: ${VALID_TYPES.join(', ')}`)
      }

      return userService.saveNote(rk, cr, t, b, tg)
    }
  )

  // ── user:get-notes ──────────────────────────────────────────────────────────
  ipcMain.handle('user:get-notes', (_event, resourceKey: unknown) => {
    if (resourceKey === undefined || resourceKey === null) {
      return userService.getAllNotes()
    }
    const rk = assertString(resourceKey, 'resourceKey')
    return userService.getNotesByResource(rk)
  })

  // ── user:save-highlight ─────────────────────────────────────────────────────
  ipcMain.handle(
    'user:save-highlight',
    (_event, resourceKey: unknown, contentRef: unknown, color: unknown) => {
      const rk = assertString(resourceKey, 'resourceKey')
      const cr = assertString(contentRef, 'contentRef')
      const c = assertString(color, 'color')

      const VALID_COLORS = ['gold', 'green', 'red', 'blue', 'yellow', 'orange', 'fuchsia', 'slate']
      if (!VALID_COLORS.includes(c)) {
        throw new Error(`Invalid color. Must be one of: ${VALID_COLORS.join(', ')}`)
      }

      return userService.saveHighlight(rk, cr, c)
    }
  )

  // ── user:get-highlights ─────────────────────────────────────────────────────
  ipcMain.handle('user:get-highlights', (_event, resourceKey: unknown) => {
    const rk = assertString(resourceKey, 'resourceKey')
    return userService.getHighlightsByResource(rk)
  })

  // ── user:get-all-highlights ─────────────────────────────────────────────────
  ipcMain.handle('user:get-all-highlights', () => {
    return userService.getAllHighlights()
  })

  // ── user:delete-highlight ───────────────────────────────────────────────────
  ipcMain.handle('user:delete-highlight', (_event, id: unknown) => {
    const highlightId = assertNumber(id, 'id')
    userService.deleteHighlight(highlightId)
    return true
  })

  // ── user:update-note ────────────────────────────────────────────────────────
  ipcMain.handle('user:update-note', (_event, id: unknown, body: unknown, tags: unknown) => {
    const noteId = assertNumber(id, 'id')
    const b = assertString(body, 'body')
    const tg = tags !== undefined && isStringArray(tags) ? assertStringArray(tags, 'tags') : []
    userService.updateNote(noteId, b, tg)
    return true
  })

  // ── user:delete-note ────────────────────────────────────────────────────────
  ipcMain.handle('user:delete-note', (_event, id: unknown) => {
    const noteId = assertNumber(id, 'id')
    userService.deleteNote(noteId)
    return true
  })

  // ── user:search-notes ───────────────────────────────────────────────────────
  ipcMain.handle('user:search-notes', (_event, query: unknown, limit: unknown) => {
    const q = assertString(query, 'query')
    if (q.length > 500) throw new Error('Query too long (max 500 characters)')
    const lim = limit !== undefined ? Math.min(assertNumber(limit, 'limit'), 200) : 50
    return userService.searchNotes(q, lim)
  })

  // ── user:save-khutbah ───────────────────────────────────────────────────────
  ipcMain.handle(
    'user:save-khutbah',
    (_event, title: unknown, date: unknown, templateKey: unknown, body: unknown) => {
      const t = assertString(title, 'title')
      const d = date != null ? assertString(date, 'date') : null
      const tk = assertString(templateKey, 'templateKey')
      const b = typeof body === 'string' ? body : ''

      const VALID_TEMPLATES = ['jumuah', 'eid-al-fitr', 'eid-al-adha', 'janazah', 'nikah', 'custom']
      if (!VALID_TEMPLATES.includes(tk)) {
        throw new Error(`Invalid templateKey. Must be one of: ${VALID_TEMPLATES.join(', ')}`)
      }

      return userService.saveKhutbah(t, d, tk, b)
    }
  )

  // ── user:get-khutbahs ───────────────────────────────────────────────────────
  ipcMain.handle('user:get-khutbahs', () => {
    return userService.getKhutbahs()
  })

  // ── user:get-khutbah ────────────────────────────────────────────────────────
  ipcMain.handle('user:get-khutbah', (_event, id: unknown) => {
    const khutbahId = assertNumber(id, 'id')
    return userService.getKhutbah(khutbahId) ?? null
  })

  // ── user:update-khutbah ─────────────────────────────────────────────────────
  ipcMain.handle(
    'user:update-khutbah',
    (_event, id: unknown, title: unknown, date: unknown, body: unknown, status: unknown) => {
      const khutbahId = assertNumber(id, 'id')
      const t = assertString(title, 'title')
      const d = date != null ? assertString(date, 'date') : null
      const b = typeof body === 'string' ? body : ''
      const s = typeof status === 'string' && ['draft', 'final'].includes(status) ? status : 'draft'
      userService.updateKhutbah(khutbahId, t, d, b, s)
      return true
    }
  )

  // ── user:delete-khutbah ─────────────────────────────────────────────────────
  ipcMain.handle('user:delete-khutbah', (_event, id: unknown) => {
    const khutbahId = assertNumber(id, 'id')
    userService.deleteKhutbah(khutbahId)
    return true
  })

  // ── user:add-khutbah-material ───────────────────────────────────────────────
  ipcMain.handle(
    'user:add-khutbah-material',
    (_event, khutbahId: unknown, contentRef: unknown, orderIndex: unknown) => {
      const kid = assertNumber(khutbahId, 'khutbahId')
      const cr = assertString(contentRef, 'contentRef')
      const oi = orderIndex !== undefined ? assertNumber(orderIndex, 'orderIndex') : 0
      return userService.addKhutbahMaterial(kid, cr, oi)
    }
  )

  // ── user:get-khutbah-materials ──────────────────────────────────────────────
  ipcMain.handle('user:get-khutbah-materials', (_event, khutbahId: unknown) => {
    const kid = assertNumber(khutbahId, 'khutbahId')
    return userService.getKhutbahMaterials(kid)
  })

  // ── user:remove-khutbah-material ────────────────────────────────────────────
  ipcMain.handle('user:remove-khutbah-material', (_event, id: unknown) => {
    const materialId = assertNumber(id, 'id')
    userService.removeKhutbahMaterial(materialId)
    return true
  })

  // ── user:get-reading-plan ───────────────────────────────────────────────────
  ipcMain.handle('user:get-reading-plan', (_event, planKey: unknown) => {
    const pk = assertString(planKey, 'planKey')
    return userService.getReadingPlan(pk) ?? null
  })

  // ── settings:get ────────────────────────────────────────────────────────────
  ipcMain.handle('settings:get', (_event, key: unknown, defaultValue: unknown) => {
    const k = assertString(key, 'key')
    return userService.getSetting(k, defaultValue ?? null)
  })

  // ── settings:set ────────────────────────────────────────────────────────────
  ipcMain.handle('settings:set', (_event, key: unknown, value: unknown) => {
    const k = assertString(key, 'key')
    if (value === undefined) throw new Error("settings:set requires a 'value' argument")
    userService.setSetting(k, value)
    return true
  })

  // ── audio:play / audio:pause ────────────────────────────────────────────────
  // Audio is handled in the renderer process; these IPC channels exist for
  // external triggers (e.g. media keys, tray menu) to control playback.
  ipcMain.handle('audio:play', () => {
    // Forward to renderer via webContents if needed
    return true
  })

  ipcMain.handle('audio:pause', () => {
    return true
  })

  // ── library:search-factbook ─────────────────────────────────────────────────
  ipcMain.handle('library:search-factbook', (_e, args: unknown) => {
    const { query, limit } = args as { query: string; limit?: number }
    if (typeof query !== 'string' || query.trim().length === 0) return []
    const sanitized = query.trim().slice(0, 100)
    return libraryService.searchFactbook(
      sanitized,
      typeof limit === 'number' ? Math.min(limit, 100) : 20
    )
  })

  // ── library:get-factbook-entry ──────────────────────────────────────────────
  ipcMain.handle('library:get-factbook-entry', (_e, args: unknown) => {
    const { slug } = args as { slug: string }
    if (typeof slug !== 'string' || !slug) return null
    return libraryService.getFactbookEntry(slug.slice(0, 100))
  })

  // ── library:get-factbook-ayah-refs ──────────────────────────────────────────
  ipcMain.handle('library:get-factbook-ayah-refs', (_e, args: unknown) => {
    const { entryId } = args as { entryId: number }
    if (typeof entryId !== 'number' || entryId < 1) return []
    return libraryService.getFactbookAyahRefs(entryId)
  })
}
