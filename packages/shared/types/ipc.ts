export const IpcChannel = {
  LIBRARY_SEARCH: 'library:search',
  LIBRARY_GET_AYAH: 'library:get-ayah',
  LIBRARY_GET_TAFSIR: 'library:get-tafsir',
  LIBRARY_GET_HADITH: 'library:get-hadith',
  LIBRARY_GET_MORPHOLOGY: 'library:get-morphology',
  USER_SAVE_NOTE: 'user:save-note',
  USER_GET_NOTES: 'user:get-notes',
  USER_SAVE_HIGHLIGHT: 'user:save-highlight',
  USER_GET_READING_PLAN: 'user:get-reading-plan',
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
