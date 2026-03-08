export interface MorphologyResult {
  word: string
  root: string
  pattern: string
  partOfSpeech: string
  caseMarker?: string
  gender?: 'masculine' | 'feminine'
  number?: 'singular' | 'dual' | 'plural'
  person?: 'first' | 'second' | 'third'
  tense?: 'past' | 'present' | 'imperative'
  voice?: 'active' | 'passive'
}

/**
 * Analyzes an Arabic word and returns its morphological breakdown.
 * Stub implementation — full WASM-based engine (Qalsadi) in a later phase.
 */
export function analyzeWord(word: string): MorphologyResult {
  const stripped = stripDiacritics(word)

  return {
    word,
    root: stripped,
    pattern: 'unknown',
    partOfSpeech: 'unknown',
  }
}

/** Strip Arabic diacritics (tashkeel) from a string for normalization. */
export function stripDiacritics(text: string): string {
  return text.replace(/[\u064B-\u065F\u0670\u0640]/g, '')
}

/** Normalize Arabic text for search (strip diacritics + normalize alef variants). */
export function normalizeArabic(text: string): string {
  return stripDiacritics(text)
    .replace(/[\u0622\u0623\u0625]/g, '\u0627') // normalize alef variants to bare alef
    .replace(/\u0629/g, '\u0647') // normalize taa marbuta to haa
    .trim()
}
