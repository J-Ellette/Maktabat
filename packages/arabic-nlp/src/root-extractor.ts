/**
 * Arabic Root Extractor
 *
 * Implements basic Arabic root extraction using a pattern-matching approach.
 * The full morphological analysis will use WASM-compiled Qalsadi in a later phase.
 */

// Common Arabic prefixes to strip — sorted longest-first for greedy matching
const PREFIXES = ['لل', 'يت', 'مت', 'ست', 'يس', 'تس', 'ال', 'و', 'ف', 'ب', 'ك', 'ل'].sort(
  (a, b) => b.length - a.length
)

// Common Arabic suffixes to strip — sorted longest-first for greedy matching
const SUFFIXES = [
  'ون', 'ان', 'ين', 'ات', 'ها', 'هم', 'هن', 'نا', 'كم', 'كن', 'تم', 'تن',
  'ة', 'ت', 'ن', 'ي', 'ه',
].sort((a, b) => b.length - a.length)

/**
 * Attempts to extract the trilateral root from an Arabic word.
 * This is a simplified heuristic approach.
 */
export function extractRoot(word: string): string {
  let stem = word

  // Strip diacritics first
  stem = stem.replace(/[\u064B-\u065F\u0670\u0640]/g, '')

  // Try stripping known prefixes (pre-sorted longest first)
  for (const prefix of PREFIXES) {
    if (stem.startsWith(prefix) && stem.length - prefix.length >= 3) {
      stem = stem.slice(prefix.length)
      break
    }
  }

  // Try stripping known suffixes (pre-sorted longest first)
  for (const suffix of SUFFIXES) {
    if (stem.endsWith(suffix) && stem.length - suffix.length >= 3) {
      stem = stem.slice(0, stem.length - suffix.length)
      break
    }
  }

  return stem.length >= 3 ? stem : word
}
