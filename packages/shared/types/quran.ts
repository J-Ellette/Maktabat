export interface Surah {
  id: number
  number: number
  arabicName: string
  transliteratedName: string
  englishName: string
  revelationType: 'meccan' | 'medinan'
  verseCount: number
}

export interface Ayah {
  id: number
  surahId: number
  ayahNumber: number
  arabicText: string
  arabicSimple: string // no tashkeel for search
  bismillahPre: boolean
}

export interface Translation {
  id: number
  ayahId: number
  translationKey: TranslationKey
  text: string
  translator: string
  language: string
}

export type TranslationKey =
  | 'noble-quran'
  | 'pickthall'
  | 'yusuf-ali'
  | 'abdel-haleem'
  | 'clear-quran'
  | 'taqi-usmani'

export interface TafsirEntry {
  id: number
  ayahId: number
  tafsirKey: string
  text: string
  language: string
  volume?: number
  page?: number
}

export interface WordMorphology {
  id: number
  ayahId: number
  wordPosition: number
  surfaceForm: string
  rootId: number
  pattern: string
  pos: PartOfSpeech
  caseMarker?: string
}

export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'particle'
  | 'pronoun'
  | 'preposition'
  | 'conjunction'
  | 'interjection'
