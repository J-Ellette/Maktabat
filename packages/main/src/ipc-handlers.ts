import { ipcMain } from 'electron'
import type { LibraryService } from './library-service.js'
import type { UserService } from './user-service.js'
import type { AccountService } from './account-service.js'
import type { SyncService } from './sync-service.js'
import type { ResourceManagerService } from './resource-manager.js'

// ─── Input validation helpers ─────────────────────────────────────────────────

const MAX_FACTBOOK_QUERY_LENGTH = 100

function assertString(value: unknown, name: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Invalid input: '${name}' must be a non-empty string`)
  }
  return value.trim()
}

function assertNumber(value: unknown, name: string): number {
  const parsedNumber = Number(value)
  if (!Number.isFinite(parsedNumber) || parsedNumber < 0) {
    throw new Error(`Invalid input: '${name}' must be a non-negative number`)
  }
  return parsedNumber
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

// ─── Validation constants ──────────────────────────────────────────────────────

const VALID_NOTE_TYPES = ['study', 'question', 'reflection', 'khutbah', 'application'] as const
const VALID_HIGHLIGHT_COLORS = ['gold', 'green', 'red', 'blue', 'yellow', 'orange', 'fuchsia', 'slate'] as const
const VALID_KHUTBAH_TEMPLATES = ['jumuah', 'eid-al-fitr', 'eid-al-adha', 'janazah', 'nikah', 'custom'] as const

// ─── Registration ──────────────────────────────────────────────────────────────

export function registerIpcHandlers(
  libraryService: LibraryService,
  userService: UserService,
  accountService?: AccountService,
  syncService?: SyncService,
  resourceManager?: ResourceManagerService
): void {
  // ── library:get-surahs ──────────────────────────────────────────────────────
  ipcMain.handle('library:get-surahs', () => {
    return libraryService.getSurahs()
  })

  // ── library:get-ayahs-by-surah ──────────────────────────────────────────────
  ipcMain.handle('library:get-ayahs-by-surah', (_event, surahNumber: unknown) => {
    const surahNum = assertNumber(surahNumber, 'surahNumber')
    if (surahNum < 1 || surahNum > 114) throw new Error('surahNumber must be between 1 and 114')

    const ayahs = libraryService.getAyahsBySurah(surahNum)
    // For each ayah also get translations
    return ayahs.map((ayah) => ({
      ayah,
      translations: libraryService.getTranslations(ayah.id),
      morphology: libraryService.getMorphologyForAyah(ayah.id),
    }))
  })

  // ── library:get-translations ────────────────────────────────────────────────
  ipcMain.handle('library:get-translations', (_event, ayahId: unknown) => {
    const validatedAyahId = assertNumber(ayahId, 'ayahId')
    return libraryService.getTranslations(validatedAyahId)
  })

  // ── library:get-ayah ────────────────────────────────────────────────────────
  ipcMain.handle('library:get-ayah', (_event, surahNumber: unknown, ayahNumber: unknown) => {
    const surahNum = assertNumber(surahNumber, 'surahNumber')
    const ayahNum = assertNumber(ayahNumber, 'ayahNumber')
    if (surahNum < 1 || surahNum > 114) throw new Error('surahNumber must be between 1 and 114')
    if (ayahNum < 1 || ayahNum > 286) throw new Error('ayahNumber must be between 1 and 286')

    const ayah = libraryService.getAyah(surahNum, ayahNum)
    if (!ayah) return null

    const translations = libraryService.getTranslations(ayah.id)
    return { ayah, translations }
  })

  // ── library:get-tafsir ──────────────────────────────────────────────────────
  ipcMain.handle('library:get-tafsir', (_event, ayahId: unknown, tafsirKey: unknown) => {
    const validatedAyahId = assertNumber(ayahId, 'ayahId')
    const validatedTafsirKey = assertString(tafsirKey, 'tafsirKey')
    return libraryService.getTafsir(validatedAyahId, validatedTafsirKey) ?? null
  })

  // ── library:get-tafsirs-for-ayah ────────────────────────────────────────────
  ipcMain.handle('library:get-tafsirs-for-ayah', (_event, ayahId: unknown) => {
    const validatedAyahId = assertNumber(ayahId, 'ayahId')
    return libraryService.getTafsirsForAyah(validatedAyahId)
  })

  // ── library:get-tafsirs-by-surah ────────────────────────────────────────────
  ipcMain.handle(
    'library:get-tafsirs-by-surah',
    (_event, surahNumber: unknown, tafsirKey: unknown) => {
      const surahNum = assertNumber(surahNumber, 'surahNumber')
      const validatedTafsirKey = assertString(tafsirKey, 'tafsirKey')
      if (surahNum < 1 || surahNum > 114) throw new Error('surahNumber must be between 1 and 114')
      return libraryService.getTafsirsBySurah(surahNum, validatedTafsirKey)
    }
  )

  // ── library:get-tafsir-keys ─────────────────────────────────────────────────
  ipcMain.handle('library:get-tafsir-keys', () => {
    return libraryService.getTafsirKeys()
  })

  // ── library:get-hadith ──────────────────────────────────────────────────────
  ipcMain.handle('library:get-hadith', (_event, collectionKey: unknown, hadithNumber: unknown) => {
    const validatedCollectionKey = assertString(collectionKey, 'collectionKey')
    const validatedHadithNumber = assertString(hadithNumber, 'hadithNumber')

    const hadith = libraryService.getHadith(validatedCollectionKey, validatedHadithNumber)
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
    const validatedCollectionKey = assertString(collectionKey, 'collectionKey')
    return libraryService.getHadithBooks(validatedCollectionKey)
  })

  // ── library:get-hadith-chapters ─────────────────────────────────────────────
  ipcMain.handle('library:get-hadith-chapters', (_event, bookId: unknown) => {
    const validatedBookId = assertNumber(bookId, 'bookId')
    return libraryService.getHadithChapters(validatedBookId)
  })

  // ── library:get-hadiths-by-book ──────────────────────────────────────────────
  ipcMain.handle('library:get-hadiths-by-book', (_event, bookId: unknown) => {
    const validatedBookId = assertNumber(bookId, 'bookId')
    return libraryService.getHadithsByBook(validatedBookId)
  })

  // ── library:get-hadiths-by-chapter ──────────────────────────────────────────
  ipcMain.handle('library:get-hadiths-by-chapter', (_event, chapterId: unknown) => {
    const validatedChapterId = assertNumber(chapterId, 'chapterId')
    return libraryService.getHadithsByChapter(validatedChapterId)
  })

  // ── library:get-hadith-by-id ─────────────────────────────────────────────────
  ipcMain.handle('library:get-hadith-by-id', (_event, hadithId: unknown) => {
    const validatedHadithId = assertNumber(hadithId, 'hadithId')

    const hadith = libraryService.getHadithById(validatedHadithId)
    if (!hadith) return null

    const grades = libraryService.getHadithGrades(hadith.id)
    const isnad = libraryService.getIsnad(hadith.id)
    return { hadith, grades, isnad }
  })

  // ── library:get-isnad ────────────────────────────────────────────────────────
  ipcMain.handle('library:get-isnad', (_event, hadithId: unknown) => {
    const validatedHadithId = assertNumber(hadithId, 'hadithId')
    return libraryService.getIsnad(validatedHadithId)
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
      const searchQuery = assertString(query, 'query')
      if (searchQuery.length > 500) throw new Error('Query too long (max 500 characters)')

      const collectionFilter =
        collectionKey !== undefined && collectionKey !== null
          ? assertString(collectionKey, 'collectionKey')
          : undefined
      const gradeFilter = grade !== undefined && grade !== null ? assertString(grade, 'grade') : undefined
      const resultLimit = limit !== undefined ? Math.min(assertNumber(limit, 'limit'), 100) : 20
      const resultOffset = offset !== undefined ? assertNumber(offset, 'offset') : 0

      return libraryService.searchHadiths(searchQuery, collectionFilter, gradeFilter, resultLimit, resultOffset)
    }
  )

  // ── library:get-morphology ──────────────────────────────────────────────────
  ipcMain.handle('library:get-morphology', (_event, ayahId: unknown) => {
    const validatedAyahId = assertNumber(ayahId, 'ayahId')
    return libraryService.getMorphologyForAyah(validatedAyahId)
  })

  // ── library:get-word-occurrences ────────────────────────────────────────────
  ipcMain.handle('library:get-word-occurrences', (_event, root: unknown) => {
    const rootWord = assertString(root, 'root')
    if (rootWord.length > 10) throw new Error('root exceeds maximum length of 10 characters')
    return libraryService.getWordOccurrences(rootWord)
  })

  // ── library:search ──────────────────────────────────────────────────────────
  ipcMain.handle(
    'library:search',
    (
      _event,
      query: unknown,
      limit: unknown,
      offset: unknown,
      resourceTypes: unknown,
      expandMorphology: unknown
    ) => {
      const searchQuery = assertString(query, 'query')
      if (searchQuery.length > 500) throw new Error('Query too long (max 500 characters)')

      const resultLimit = limit !== undefined ? Math.min(assertNumber(limit, 'limit'), 100) : 20
      const resultOffset = offset !== undefined ? assertNumber(offset, 'offset') : 0
      const types =
        resourceTypes !== undefined && isStringArray(resourceTypes)
          ? assertStringArray(resourceTypes, 'resourceTypes')
          : undefined
      const expand = typeof expandMorphology === 'boolean' ? expandMorphology : false

      return libraryService.search(searchQuery, resultLimit, resultOffset, types, expand)
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
      const validatedResourceKey = assertString(resourceKey, 'resourceKey')
      const validatedContentRef = assertString(contentRef, 'contentRef')
      const noteType = assertString(type, 'type')
      const noteBody = assertString(body, 'body')
      const noteTags = tags !== undefined && isStringArray(tags) ? assertStringArray(tags, 'tags') : []

      if (!VALID_NOTE_TYPES.includes(noteType as (typeof VALID_NOTE_TYPES)[number])) {
        throw new Error(`Invalid note type. Must be one of: ${VALID_NOTE_TYPES.join(', ')}`)
      }

      return userService.saveNote(validatedResourceKey, validatedContentRef, noteType, noteBody, noteTags)
    }
  )

  // ── user:get-notes ──────────────────────────────────────────────────────────
  ipcMain.handle('user:get-notes', (_event, resourceKey: unknown) => {
    if (resourceKey === undefined || resourceKey === null) {
      return userService.getAllNotes()
    }
    const validatedResourceKey = assertString(resourceKey, 'resourceKey')
    return userService.getNotesByResource(validatedResourceKey)
  })

  // ── user:save-highlight ─────────────────────────────────────────────────────
  ipcMain.handle(
    'user:save-highlight',
    (_event, resourceKey: unknown, contentRef: unknown, color: unknown) => {
      const validatedResourceKey = assertString(resourceKey, 'resourceKey')
      const validatedContentRef = assertString(contentRef, 'contentRef')
      const highlightColor = assertString(color, 'color')

      if (!VALID_HIGHLIGHT_COLORS.includes(highlightColor as (typeof VALID_HIGHLIGHT_COLORS)[number])) {
        throw new Error(`Invalid color. Must be one of: ${VALID_HIGHLIGHT_COLORS.join(', ')}`)
      }

      return userService.saveHighlight(validatedResourceKey, validatedContentRef, highlightColor)
    }
  )

  // ── user:get-highlights ─────────────────────────────────────────────────────
  ipcMain.handle('user:get-highlights', (_event, resourceKey: unknown) => {
    const validatedResourceKey = assertString(resourceKey, 'resourceKey')
    return userService.getHighlightsByResource(validatedResourceKey)
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
    const noteBody = assertString(body, 'body')
    const noteTags = tags !== undefined && isStringArray(tags) ? assertStringArray(tags, 'tags') : []
    userService.updateNote(noteId, noteBody, noteTags)
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
    const searchQuery = assertString(query, 'query')
    if (searchQuery.length > 500) throw new Error('Query too long (max 500 characters)')
    const resultLimit = limit !== undefined ? Math.min(assertNumber(limit, 'limit'), 200) : 50
    return userService.searchNotes(searchQuery, resultLimit)
  })

  // ── user:save-khutbah ───────────────────────────────────────────────────────
  ipcMain.handle(
    'user:save-khutbah',
    (_event, title: unknown, date: unknown, templateKey: unknown, body: unknown) => {
      const titleValue = assertString(title, 'title')
      const dateValue = date != null ? assertString(date, 'date') : null
      const validatedTemplateKey = assertString(templateKey, 'templateKey')
      const bodyContent = typeof body === 'string' ? body : ''

      if (!VALID_KHUTBAH_TEMPLATES.includes(validatedTemplateKey as (typeof VALID_KHUTBAH_TEMPLATES)[number])) {
        throw new Error(`Invalid templateKey. Must be one of: ${VALID_KHUTBAH_TEMPLATES.join(', ')}`)
      }

      return userService.saveKhutbah(titleValue, dateValue, validatedTemplateKey, bodyContent)
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
      const titleValue = assertString(title, 'title')
      const dateValue = date != null ? assertString(date, 'date') : null
      const bodyContent = typeof body === 'string' ? body : ''
      const statusValue = typeof status === 'string' && ['draft', 'final'].includes(status) ? status : 'draft'
      userService.updateKhutbah(khutbahId, titleValue, dateValue, bodyContent, statusValue)
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
      const parsedKhutbahId = assertNumber(khutbahId, 'khutbahId')
      const validatedContentRef = assertString(contentRef, 'contentRef')
      const parsedOrderIndex = orderIndex !== undefined ? assertNumber(orderIndex, 'orderIndex') : 0
      return userService.addKhutbahMaterial(parsedKhutbahId, validatedContentRef, parsedOrderIndex)
    }
  )

  // ── user:get-khutbah-materials ──────────────────────────────────────────────
  ipcMain.handle('user:get-khutbah-materials', (_event, khutbahId: unknown) => {
    const parsedKhutbahId = assertNumber(khutbahId, 'khutbahId')
    return userService.getKhutbahMaterials(parsedKhutbahId)
  })

  // ── user:remove-khutbah-material ────────────────────────────────────────────
  ipcMain.handle('user:remove-khutbah-material', (_event, id: unknown) => {
    const materialId = assertNumber(id, 'id')
    userService.removeKhutbahMaterial(materialId)
    return true
  })

  // ── user:get-khutbahs-for-verse ─────────────────────────────────────────────
  ipcMain.handle('user:get-khutbahs-for-verse', (_e, contentRef: unknown) => {
    if (typeof contentRef !== 'string') return []
    return userService.getKhutbahsForVerse(contentRef)
  })

  // ── user:get-reading-plan ───────────────────────────────────────────────────
  ipcMain.handle('user:get-reading-plan', (_event, planKey: unknown) => {
    const validatedPlanKey = assertString(planKey, 'planKey')
    return userService.getReadingPlan(validatedPlanKey) ?? null
  })

  // ── user:get-all-reading-plans ──────────────────────────────────────────────
  ipcMain.handle('user:get-all-reading-plans', () => {
    return userService.getAllReadingPlans()
  })

  // ── user:save-reading-plan ──────────────────────────────────────────────────
  ipcMain.handle(
    'user:save-reading-plan',
    (_event, planKey: unknown, startDate: unknown, targetDate: unknown, progressData: unknown) => {
      const validatedPlanKey = assertString(planKey, 'planKey')
      const validatedStartDate = assertString(startDate, 'startDate')
      const validatedTargetDate = assertString(targetDate, 'targetDate')
      if (!progressData || typeof progressData !== 'object' || Array.isArray(progressData)) {
        throw new Error('user:save-reading-plan: progressData must be an object')
      }
      userService.saveReadingPlan(validatedPlanKey, validatedStartDate, validatedTargetDate, progressData as Record<string, unknown>)
      return true
    }
  )

  // ── user:update-reading-plan-progress ──────────────────────────────────────
  ipcMain.handle(
    'user:update-reading-plan-progress',
    (_event, planKey: unknown, progressData: unknown) => {
      const validatedPlanKey = assertString(planKey, 'planKey')
      if (!progressData || typeof progressData !== 'object' || Array.isArray(progressData)) {
        throw new Error('user:update-reading-plan-progress: progressData must be an object')
      }
      userService.updateReadingPlanProgress(validatedPlanKey, progressData as Record<string, unknown>)
      return true
    }
  )

  // ── user:delete-reading-plan ────────────────────────────────────────────────
  ipcMain.handle('user:delete-reading-plan', (_event, planKey: unknown) => {
    const validatedPlanKey = assertString(planKey, 'planKey')
    userService.deleteReadingPlan(validatedPlanKey)
    return true
  })

  // ── settings:get ────────────────────────────────────────────────────────────
  ipcMain.handle('settings:get', (_event, key: unknown, defaultValue: unknown) => {
    const settingKey = assertString(key, 'key')
    return userService.getSetting(settingKey, defaultValue ?? null)
  })

  // ── settings:set ────────────────────────────────────────────────────────────
  ipcMain.handle('settings:set', (_event, key: unknown, value: unknown) => {
    const settingKey = assertString(key, 'key')
    if (value === undefined) throw new Error("settings:set requires a 'value' argument")
    userService.setSetting(settingKey, value)
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
    const sanitized = query.trim().slice(0, MAX_FACTBOOK_QUERY_LENGTH)
    return libraryService.searchFactbook(
      sanitized,
      typeof limit === 'number' ? Math.min(limit, 100) : 20
    )
  })

  // ── library:get-factbook-entry ──────────────────────────────────────────────
  ipcMain.handle('library:get-factbook-entry', (_e, args: unknown) => {
    const { slug } = args as { slug: string }
    if (typeof slug !== 'string' || !slug) return null
    return libraryService.getFactbookEntry(slug.slice(0, MAX_FACTBOOK_QUERY_LENGTH))
  })

  // ── library:get-factbook-ayah-refs ──────────────────────────────────────────
  ipcMain.handle('library:get-factbook-ayah-refs', (_e, args: unknown) => {
    const { entryId } = args as { entryId: number }
    if (typeof entryId !== 'number' || entryId < 1) return []
    return libraryService.getFactbookAyahRefs(entryId)
  })

  // ── account:sign-up ─────────────────────────────────────────────────────────
  ipcMain.handle(
    'account:sign-up',
    (_e, email: unknown, password: unknown, displayName: unknown) => {
      if (!accountService) throw new Error('Account service not available.')
      const emailAddress = assertString(email, 'email')
      const passwordValue = assertString(password, 'password')
      if (passwordValue.length < 8) throw new Error('Password must be at least 8 characters.')
      const displayNameValue = displayName != null && typeof displayName === 'string' ? displayName : undefined
      return accountService.signUp(emailAddress, passwordValue, displayNameValue)
    }
  )

  // ── account:sign-in ─────────────────────────────────────────────────────────
  ipcMain.handle('account:sign-in', (_e, email: unknown, password: unknown) => {
    if (!accountService) throw new Error('Account service not available.')
    const emailAddress = assertString(email, 'email')
    const passwordValue = assertString(password, 'password')
    return accountService.signIn(emailAddress, passwordValue)
  })

  // ── account:sign-out ────────────────────────────────────────────────────────
  ipcMain.handle('account:sign-out', (_e, token: unknown) => {
    if (!accountService) throw new Error('Account service not available.')
    const sessionToken = assertString(token, 'token')
    accountService.signOut(sessionToken)
    return true
  })

  // ── account:get-profile ─────────────────────────────────────────────────────
  ipcMain.handle('account:get-profile', (_e, token: unknown) => {
    if (!accountService) throw new Error('Account service not available.')
    const sessionToken = assertString(token, 'token')
    return accountService.getProfileByToken(sessionToken) ?? null
  })

  // ── account:update-display-name ─────────────────────────────────────────────
  ipcMain.handle('account:update-display-name', (_e, token: unknown, name: unknown) => {
    if (!accountService) throw new Error('Account service not available.')
    const sessionToken = assertString(token, 'token')
    const newDisplayName = assertString(name, 'name')
    return accountService.updateDisplayName(sessionToken, newDisplayName) ?? null
  })

  // ── sync:get-status ─────────────────────────────────────────────────────────
  ipcMain.handle('sync:get-status', () => {
    if (!syncService)
      return { status: 'offline', lastSyncAt: null, errorMessage: null, pendingChanges: 0 }
    return syncService.getStatus()
  })

  // ── sync:export-bundle ──────────────────────────────────────────────────────
  ipcMain.handle('sync:export-bundle', (_e, outputPath: unknown) => {
    if (!syncService) throw new Error('Sync service not available.')
    const validatedOutputPath = assertString(outputPath, 'outputPath')
    return syncService.exportBundle(validatedOutputPath)
  })

  // ── sync:import-bundle ──────────────────────────────────────────────────────
  ipcMain.handle('sync:import-bundle', (_e, bundlePath: unknown) => {
    if (!syncService) throw new Error('Sync service not available.')
    const validatedBundlePath = assertString(bundlePath, 'bundlePath')
    return syncService.importBundle(validatedBundlePath)
  })

  // ── sync:trigger ────────────────────────────────────────────────────────────
  ipcMain.handle('sync:trigger', async () => {
    if (!syncService)
      return { status: 'offline', lastSyncAt: null, errorMessage: null, pendingChanges: 0 }
    return syncService.triggerCloudSync()
  })

  // ── resource:get-installed ──────────────────────────────────────────────────
  ipcMain.handle('resource:get-installed', () => {
    if (!resourceManager) return []
    return resourceManager.getInstalledResources()
  })

  // ── resource:get-available ──────────────────────────────────────────────────
  ipcMain.handle('resource:get-available', () => {
    if (!resourceManager) return []
    return resourceManager.getAvailableResources()
  })

  // ── resource:install ────────────────────────────────────────────────────────
  ipcMain.handle('resource:install', (_e, resourceKey: unknown) => {
    if (!resourceManager) throw new Error('Resource manager not available.')
    const validatedResourceKey = assertString(resourceKey, 'resourceKey')
    return resourceManager.installResource(validatedResourceKey)
  })

  // ── resource:uninstall ──────────────────────────────────────────────────────
  ipcMain.handle('resource:uninstall', (_e, resourceKey: unknown) => {
    if (!resourceManager) throw new Error('Resource manager not available.')
    const validatedResourceKey = assertString(resourceKey, 'resourceKey')
    return resourceManager.uninstallResource(validatedResourceKey)
  })

  // ── resource:import-mkt ─────────────────────────────────────────────────────
  ipcMain.handle('resource:import-mkt', (_e, filePath: unknown) => {
    if (!resourceManager) throw new Error('Resource manager not available.')
    const validatedFilePath = assertString(filePath, 'filePath')
    return resourceManager.importMktResource(validatedFilePath)
  })

  // ── resource:import-epub ────────────────────────────────────────────────────
  ipcMain.handle('resource:import-epub', (_e, filePath: unknown) => {
    if (!resourceManager) throw new Error('Resource manager not available.')
    const validatedFilePath = assertString(filePath, 'filePath')
    return resourceManager.importEpub(validatedFilePath)
  })

  // ── resource:import-pdf ─────────────────────────────────────────────────────
  ipcMain.handle('resource:import-pdf', (_e, filePath: unknown) => {
    if (!resourceManager) throw new Error('Resource manager not available.')
    const validatedFilePath = assertString(filePath, 'filePath')
    return resourceManager.importPdf(validatedFilePath)
  })

  // ── library:get-tafsir-annotations ──────────────────────────────────────────
  ipcMain.handle('library:get-tafsir-annotations', (_e, ayahId: unknown, tafsirKey: unknown) => {
    const validatedAyahId = assertNumber(ayahId, 'ayahId')
    const validatedTafsirKey = assertString(tafsirKey, 'tafsirKey')
    return libraryService.getTafsirAnnotations(validatedAyahId, validatedTafsirKey)
  })
}
