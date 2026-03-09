export interface MorphologyResult {
  word: string
  root: string
  pattern: string
  wazan: string
  wazanForm: number | null // Form I–X, or null if not a verb
  partOfSpeech: string
  caseMarker?: string
  gender?: 'masculine' | 'feminine'
  number?: 'singular' | 'dual' | 'plural'
  person?: 'first' | 'second' | 'third'
  tense?: 'past' | 'present' | 'imperative'
  voice?: 'active' | 'passive'
}

// ─── Wazan (verb pattern) detection ──────────────────────────────────────────

/**
 * Estimate the verb form (wazan) of a diacritized Arabic word by comparing
 * its structure against the 10 standard trilateral patterns.
 * Returns the form number (1–10) and the canonical pattern name.
 */
function detectWazan(stripped: string, withDiacritics: string): { form: number; wazan: string } {
  const len = stripped.length

  // Form X: اسْتَفْعَلَ — starts with استَ/يَسْتَ (7–10 chars stripped)
  if (stripped.startsWith('است') && len >= 6) return { form: 10, wazan: 'اسْتَفْعَلَ' }
  if (stripped.startsWith('يست') && len >= 6) return { form: 10, wazan: 'يَسْتَفْعِلُ' }

  // Form VII: انْفَعَلَ — starts with انفَ/يَنفَ
  if (stripped.startsWith('انف') || stripped.startsWith('ينف')) return { form: 7, wazan: 'انْفَعَلَ' }

  // Form VIII: افْتَعَلَ — 3-letter root with infixed ت between r1 and r2
  // Hard to detect without full root table; use prefix pattern
  if (stripped.startsWith('ا') && len === 6 && stripped[3] === 'ت') return { form: 8, wazan: 'افْتَعَلَ' }

  // Form IX: افْعَلَّ — ends with shadda marker in diacritized form
  if (withDiacritics.includes('\u0651') && stripped.startsWith('ا') && len === 5) {
    return { form: 9, wazan: 'افْعَلَّ' }
  }

  // Form V: تَفَعَّلَ — starts with تَفَ/يَتَفَ + shadda on 2nd radical
  if (
    (stripped.startsWith('تف') || stripped.startsWith('يتف')) &&
    withDiacritics.includes('\u0651')
  ) {
    return { form: 5, wazan: 'تَفَعَّلَ' }
  }

  // Form VI: تَفَاعَلَ — starts with تفا/يتفا
  if (stripped.startsWith('تفا') || stripped.startsWith('يتفا')) return { form: 6, wazan: 'تَفَاعَلَ' }

  // Form IV: أَفْعَلَ / يُفْعِلُ — starts with أ/أف or يُفْ
  if (stripped.startsWith('أف') || stripped.startsWith('اف') && len === 5) {
    // Distinguish from Form VIII and Form VII
    if (!stripped.startsWith('افت') && !stripped.startsWith('انف')) {
      return { form: 4, wazan: 'أَفْعَلَ' }
    }
  }

  // Form II: فَعَّلَ — shadda on second root letter (4 chars: f + shadda marker)
  if (len === 4 && withDiacritics.includes('\u0651')) return { form: 2, wazan: 'فَعَّلَ' }

  // Form III: فَاعَلَ — alef after first root letter (4 chars: r1 + ا + r2 + r3)
  if (len === 4 && stripped[1] === 'ا') return { form: 3, wazan: 'فَاعَلَ' }

  // Form I: فَعَلَ — bare trilateral root (3 letters)
  if (len === 3) return { form: 1, wazan: 'فَعَلَ' }

  return { form: 1, wazan: 'فَعَلَ' }
}

/**
 * Analyzes an Arabic word and returns its morphological breakdown.
 * Uses pattern matching for wazan detection; full WASM engine in a later phase.
 */
export function analyzeWord(word: string): MorphologyResult {
  const stripped = stripDiacritics(word)
  const { form, wazan } = detectWazan(stripped, word)

  // Simple POS guess from length and common markers
  let pos = 'N'
  if (word.endsWith('َ') || word.endsWith('َتْ')) pos = 'V' // verb-like ending
  if (stripped.startsWith('ال')) pos = 'N' // definite article → noun
  if (stripped.startsWith('ي') || stripped.startsWith('ت') || stripped.startsWith('ن') || stripped.startsWith('أ')) {
    if (stripped.length >= 4) pos = 'V' // mudari' prefix patterns
  }

  return {
    word,
    root: stripped,
    pattern: wazan,
    wazan,
    wazanForm: pos === 'V' ? form : null,
    partOfSpeech: pos,
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
