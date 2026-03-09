export { analyzeWord, stripDiacritics, normalizeArabic } from './morphology.js'
export type { MorphologyResult } from './morphology.js'

export { extractRoot } from './root-extractor.js'

export { transliterate } from './transliteration.js'
export type { TransliterationSystem } from './transliteration.js'

export { conjugateVerb, conjugateAllForms, getFormPatterns } from './conjugation.js'
export type { ConjugationTable, ConjugationTense, ConjugationCell } from './conjugation.js'

export { analyzeIrab, analyzeVerseIrab, ROLE_COLORS } from './irab.js'
export type { IrabAnalysis, GrammaticalRole } from './irab.js'
