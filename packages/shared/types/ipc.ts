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

// Request/Response types
export interface LibrarySearchRequest {
  query: string
  limit?: number
  offset?: number
  resourceTypes?: string[]
}

export interface LibrarySearchResult {
  id: string
  type: string
  title: string
  excerpt: string
  relevance: number
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
  type: string
  body: string
  tags: string[]
}
