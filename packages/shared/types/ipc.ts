export const IpcChannel = {
  LIBRARY_SEARCH: 'library:search',
  LIBRARY_GET_SURAHS: 'library:get-surahs',
  LIBRARY_GET_AYAH: 'library:get-ayah',
  LIBRARY_GET_AYAHS_BY_SURAH: 'library:get-ayahs-by-surah',
  LIBRARY_GET_TRANSLATIONS: 'library:get-translations',
  LIBRARY_GET_TAFSIR: 'library:get-tafsir',
  LIBRARY_GET_TAFSIRS_FOR_AYAH: 'library:get-tafsirs-for-ayah',
  LIBRARY_GET_TAFSIRS_BY_SURAH: 'library:get-tafsirs-by-surah',
  LIBRARY_GET_TAFSIR_KEYS: 'library:get-tafsir-keys',
  LIBRARY_GET_HADITH: 'library:get-hadith',
  LIBRARY_GET_HADITH_COLLECTIONS: 'library:get-hadith-collections',
  LIBRARY_GET_HADITH_BOOKS: 'library:get-hadith-books',
  LIBRARY_GET_HADITH_CHAPTERS: 'library:get-hadith-chapters',
  LIBRARY_GET_HADITHS_BY_BOOK: 'library:get-hadiths-by-book',
  LIBRARY_GET_HADITHS_BY_CHAPTER: 'library:get-hadiths-by-chapter',
  LIBRARY_GET_HADITH_BY_ID: 'library:get-hadith-by-id',
  LIBRARY_GET_ISNAD: 'library:get-isnad',
  LIBRARY_SEARCH_HADITHS: 'library:search-hadiths',
  LIBRARY_GET_MORPHOLOGY: 'library:get-morphology',
  LIBRARY_GET_WORD_OCCURRENCES: 'library:get-word-occurrences',
  USER_SAVE_NOTE: 'user:save-note',
  USER_GET_NOTES: 'user:get-notes',
  USER_UPDATE_NOTE: 'user:update-note',
  USER_DELETE_NOTE: 'user:delete-note',
  USER_SEARCH_NOTES: 'user:search-notes',
  USER_SAVE_HIGHLIGHT: 'user:save-highlight',
  USER_GET_HIGHLIGHTS: 'user:get-highlights',
  USER_GET_ALL_HIGHLIGHTS: 'user:get-all-highlights',
  USER_DELETE_HIGHLIGHT: 'user:delete-highlight',
  USER_GET_READING_PLAN: 'user:get-reading-plan',
  USER_SAVE_KHUTBAH: 'user:save-khutbah',
  USER_GET_KHUTBAHS: 'user:get-khutbahs',
  USER_GET_KHUTBAH: 'user:get-khutbah',
  USER_UPDATE_KHUTBAH: 'user:update-khutbah',
  USER_DELETE_KHUTBAH: 'user:delete-khutbah',
  USER_ADD_KHUTBAH_MATERIAL: 'user:add-khutbah-material',
  USER_GET_KHUTBAH_MATERIALS: 'user:get-khutbah-materials',
  USER_REMOVE_KHUTBAH_MATERIAL: 'user:remove-khutbah-material',
  AUDIO_PLAY: 'audio:play',
  AUDIO_PAUSE: 'audio:pause',
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',
} as const

export type IpcChannelType = (typeof IpcChannel)[keyof typeof IpcChannel]

/** Channels pushed from the main process to the renderer (not invoked). */
export const ReceiveChannel = {
  MENU_OPEN_LIBRARY: 'menu:open-library',
  MENU_IMPORT_RESOURCE: 'menu:import-resource',
  MENU_EXPORT_NOTES: 'menu:export-notes',
  MENU_PREFERENCES: 'menu:preferences',
  MENU_FIND: 'menu:find',
  MENU_FIND_IN_LIBRARY: 'menu:find-in-library',
  MENU_LAYOUT_SINGLE: 'menu:layout-single',
  MENU_LAYOUT_TWO: 'menu:layout-two',
  MENU_LAYOUT_THREE: 'menu:layout-three',
  MENU_THEME: 'menu:theme',
  MENU_LIBRARY_MANAGER: 'menu:library-manager',
  MENU_DOWNLOAD_RESOURCES: 'menu:download-resources',
  MENU_SYNC: 'menu:sync',
  MENU_READING_PLANS: 'menu:reading-plans',
  MENU_KHUTBAH_BUILDER: 'menu:khutbah-builder',
  MENU_STUDY_TEMPLATES: 'menu:study-templates',
  MENU_KEYBOARD_SHORTCUTS: 'menu:keyboard-shortcuts',
  TRAY_VERSE_OF_DAY: 'tray:verse-of-day',
  FILE_OPEN_MKT: 'file:open-mkt',
  PROTOCOL_OPEN_URL: 'protocol:open-url',
} as const

export type ReceiveChannelType = (typeof ReceiveChannel)[keyof typeof ReceiveChannel]

// Request/Response types
export interface LibrarySearchRequest {
  query: string
  limit?: number
  offset?: number
  resourceTypes?: string[]
}

export interface LibrarySearchResult {
  id: number
  type: 'ayah' | 'translation' | 'hadith'
  resourceKey: string
  excerpt: string
  relevance: number
  metadata: Record<string, unknown>
}

export interface GetAyahRequest {
  surahNumber: number
  ayahNumber: number
}

export interface GetTafsirRequest {
  ayahId: number
  tafsirKey: string
}

export interface GetHadithRequest {
  collectionKey: string
  hadithNumber: string
}

export interface SaveNoteRequest {
  resourceKey: string
  contentRef: string
  type: 'study' | 'question' | 'reflection' | 'khutbah' | 'application'
  body: string
  tags: string[]
}

export interface SaveHighlightRequest {
  resourceKey: string
  contentRef: string
  color: 'gold' | 'green' | 'red' | 'blue' | 'yellow' | 'orange' | 'fuchsia' | 'slate'
}

export interface SettingsGetRequest {
  key: string
  defaultValue?: unknown
}

export interface SettingsSetRequest {
  key: string
  value: unknown
}

// Quran data types returned from IPC
export interface SurahInfo {
  id: number
  number: number
  arabicName: string
  transliteratedName: string
  englishName: string
  revelationType: 'meccan' | 'medinan'
  verseCount: number
  juzStart: number
}

export interface AyahData {
  id: number
  surahNumber: number
  ayahNumber: number
  arabicText: string
  arabicSimple: string
  bismillahPre: boolean
}

export interface TranslationData {
  id: number
  ayahId: number
  translationKey: string
  text: string
  translator: string
  language: string
}

export interface MorphologyData {
  id: number
  wordPosition: number
  surfaceForm: string
  rootLetters: string | null
  rootMeaningEnglish: string | null
  pattern: string | null
  pos: string
  caseMarker: string | null
}

export interface AyahBundle {
  ayah: AyahData
  translations: TranslationData[]
  morphology: MorphologyData[]
}

export type HighlightColor =
  | 'gold'
  | 'green'
  | 'red'
  | 'blue'
  | 'yellow'
  | 'orange'
  | 'fuchsia'
  | 'slate'

export interface HighlightData {
  resourceKey: string
  contentRef: string
  color: HighlightColor
}

export interface TafsirData {
  id: number
  ayahId: number
  tafsirKey: string
  text: string
  language: string
  volume: number | null
  page: number | null
}

export interface GetTafsirsForAyahRequest {
  ayahId: number
}

export interface GetTafsirsBySurahRequest {
  surahNumber: number
  tafsirKey: string
}

// ─── Hadith Module Types ───────────────────────────────────────────────────────

export interface HadithCollection {
  id: number
  key: string
  nameArabic: string
  nameEnglish: string
  tradition: string
  tier: string
  compiler: string
  century: number
}

export interface HadithBook {
  id: number
  collectionId: number
  bookNumber: number
  nameArabic: string
  nameEnglish: string
}

export interface HadithChapter {
  id: number
  bookId: number
  chapterNumber: number
  nameArabic: string
  nameEnglish: string
}

export interface HadithItem {
  id: number
  collectionId: number
  bookId: number
  chapterId: number | null
  hadithNumber: string
  arabicText: string
  englishText: string
  collectionKey: string
  collectionNameEnglish: string
}

export interface HadithGrade {
  id: number
  hadithId: number
  grade: string
  grader: string
  source: string | null
}

export interface IsnadNarrator {
  id: number
  position: number
  nameArabic: string
  nameEnglish: string
  birthYear: number | null
  deathYear: number | null
  reliability: string
}

export interface HadithWithGrades {
  hadith: HadithItem
  grades: HadithGrade[]
  isnad: IsnadNarrator[]
}

export interface HadithSearchResult {
  id: number
  hadithNumber: string
  collectionKey: string
  collectionNameEnglish: string
  excerpt: string
}

export interface GetHadithCollectionsRequest {
  tradition?: string
  tier?: string
}

export interface GetHadithBooksRequest {
  collectionKey: string
}

export interface GetHadithChaptersRequest {
  bookId: number
}

export interface GetHadithsByBookRequest {
  bookId: number
}

export interface GetHadithsByChapterRequest {
  chapterId: number
}

export interface GetHadithByIdRequest {
  hadithId: number
}

export interface GetIsnadRequest {
  hadithId: number
}

export interface SearchHadithsRequest {
  query: string
  collectionKey?: string
  grade?: string
  limit?: number
  offset?: number
}

export interface WordOccurrenceRow {
  surah_number: number
  ayah_number: number
  surface_form: string
  pos: string
}

// ─── Khutbah Builder Types ─────────────────────────────────────────────────────

export type KhutbahTemplateKey =
  | 'jumuah'
  | 'eid-al-fitr'
  | 'eid-al-adha'
  | 'janazah'
  | 'nikah'
  | 'custom'

export type KhutbahStatus = 'draft' | 'final'

export interface KhutbahRow {
  id: number
  title: string
  date: string | null
  template_key: KhutbahTemplateKey
  status: KhutbahStatus
  body: string
}

export interface KhutbahMaterialRow {
  id: number
  khutbah_id: number
  content_ref: string
  order_index: number
}

export interface SaveKhutbahRequest {
  title: string
  date?: string
  templateKey: KhutbahTemplateKey
  body?: string
}

export interface UpdateKhutbahRequest {
  id: number
  title?: string
  date?: string
  body?: string
  status?: KhutbahStatus
}

// ─── Notes Search ─────────────────────────────────────────────────────────────

export interface SearchNotesRequest {
  query: string
  limit?: number
}
