/**
 * Arabic Transliteration
 * Supports ALA-LC and Buckwalter systems
 */

// Buckwalter transliteration map
const BUCKWALTER_MAP: Record<string, string> = {
  ا: 'A',
  ب: 'b',
  ت: 't',
  ث: 'v',
  ج: 'j',
  ح: 'H',
  خ: 'x',
  د: 'd',
  ذ: '*',
  ر: 'r',
  ز: 'z',
  س: 's',
  ش: '$',
  ص: 'S',
  ض: 'D',
  ط: 'T',
  ظ: 'Z',
  ع: 'E',
  غ: 'g',
  ف: 'f',
  ق: 'q',
  ك: 'k',
  ل: 'l',
  م: 'm',
  ن: 'n',
  ه: 'h',
  و: 'w',
  ي: 'y',
  ء: "'",
  ى: 'Y',
  ة: 'p',
  آ: '|',
  أ: '>',
  إ: '<',
  ؤ: '&',
  ئ: '}',
  // Diacritics
  '\u064E': 'a', // fatha
  '\u0650': 'i', // kasra
  '\u064F': 'u', // damma
  '\u064B': 'F', // fathatan
  '\u064D': 'K', // kasratan
  '\u064C': 'N', // dammatan
  '\u0652': 'o', // sukun
  '\u0651': '~', // shadda
  '\u0670': '`', // superscript alef
}

// ALA-LC transliteration map (simplified for common characters)
const ALA_LC_MAP: Record<string, string> = {
  ا: 'ā',
  ب: 'b',
  ت: 't',
  ث: 'th',
  ج: 'j',
  ح: 'ḥ',
  خ: 'kh',
  د: 'd',
  ذ: 'dh',
  ر: 'r',
  ز: 'z',
  س: 's',
  ش: 'sh',
  ص: 'ṣ',
  ض: 'ḍ',
  ط: 'ṭ',
  ظ: 'ẓ',
  ع: 'ʿ',
  غ: 'gh',
  ف: 'f',
  ق: 'q',
  ك: 'k',
  ل: 'l',
  م: 'm',
  ن: 'n',
  ه: 'h',
  و: 'w',
  ي: 'y',
  ء: 'ʾ',
  ى: 'ā',
  ة: 'a',
}

export type TransliterationSystem = 'buckwalter' | 'ala-lc' | 'simple'

export function transliterate(arabicText: string, system: TransliterationSystem = 'ala-lc'): string {
  const map = system === 'buckwalter' ? BUCKWALTER_MAP : ALA_LC_MAP

  return arabicText
    .split('')
    .map((char) => map[char] ?? char)
    .join('')
}
