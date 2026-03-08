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

  // ── library:get-hadith ──────────────────────────────────────────────────────
  ipcMain.handle('library:get-hadith', (_event, collectionKey: unknown, hadithNumber: unknown) => {
    const ck = assertString(collectionKey, 'collectionKey')
    const hn = assertString(hadithNumber, 'hadithNumber')

    const hadith = libraryService.getHadith(ck, hn)
    if (!hadith) return null

    const grades = libraryService.getHadithGrades(hadith.id)
    return { hadith, grades }
  })

  // ── library:get-morphology ──────────────────────────────────────────────────
  ipcMain.handle('library:get-morphology', (_event, ayahId: unknown) => {
    const id = assertNumber(ayahId, 'ayahId')
    return libraryService.getMorphologyForAyah(id)
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
}
