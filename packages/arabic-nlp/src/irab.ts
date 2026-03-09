/**
 * Arabic I'rab (Grammatical Parsing) Analysis
 *
 * Provides grammatical role analysis for Arabic words based on
 * part-of-speech tags, case markers, and positional heuristics.
 */

export interface IrabAnalysis {
  role: GrammaticalRole
  roleLabel: string
  roleLabelArabic: string
  caseLabel: string
  caseLabelArabic: string
  explanation: string
  color: string
}

export type GrammaticalRole =
  | 'subject'      // فاعل / مبتدأ
  | 'predicate'    // خبر
  | 'object'       // مفعول به
  | 'prep-phrase'  // شبه جملة
  | 'conjunction'  // حرف عطف / حرف
  | 'verb'         // فعل
  | 'particle'     // حرف
  | 'adjective'    // صفة / نعت
  | 'apposition'   // بدل
  | 'genitive'     // مضاف إليه
  | 'vocative'     // منادى
  | 'other'

/** Color palette for grammatical roles (matches build_sheet spec). */
export const ROLE_COLORS: Record<GrammaticalRole, string> = {
  subject:      '#3b82f6', // Tech Blue
  predicate:    '#16a34a', // AEGreen
  object:       '#ea580c', // Desert Orange
  'prep-phrase':'#d946ef', // Fuchsia
  conjunction:  '#94a3b8', // Slate
  verb:         '#d97706', // AEGold
  particle:     '#94a3b8', // Slate
  adjective:    '#0d9488', // Teal
  apposition:   '#7c3aed', // Violet
  genitive:     '#be123c', // Rose
  vocative:     '#0369a1', // Sky Blue
  other:        '#d97706', // AEGold (default)
}

const ROLE_LABELS: Record<GrammaticalRole, { en: string; ar: string; explanation: string }> = {
  subject:       { en: 'Subject',           ar: 'فاعل / مبتدأ',   explanation: 'The subject of the sentence, in the nominative case (مرفوع).' },
  predicate:     { en: 'Predicate',         ar: 'خبر',             explanation: 'The predicate of a nominal sentence, describing the subject.' },
  object:        { en: 'Object',            ar: 'مفعول به',        explanation: 'The direct object of a verb, in the accusative case (منصوب).' },
  'prep-phrase': { en: 'Prepositional Phr.',ar: 'شبه جملة',        explanation: 'A prepositional phrase (حرف جر + مجرور) functioning adverbially.' },
  conjunction:   { en: 'Conjunction',       ar: 'حرف عطف',         explanation: 'A coordinating conjunction linking two parts of the sentence.' },
  verb:          { en: 'Verb',              ar: 'فعل',             explanation: 'The main verb of the sentence, carrying tense and aspect.' },
  particle:      { en: 'Particle',          ar: 'حرف',             explanation: 'A grammatical particle with syntactic or semantic function.' },
  adjective:     { en: 'Adjective',         ar: 'نعت / صفة',       explanation: 'A descriptive modifier agreeing with its noun in case, gender, and number.' },
  apposition:    { en: 'Apposition',        ar: 'بدل',             explanation: 'A word in apposition restating or clarifying the preceding noun.' },
  genitive:      { en: 'Genitive',          ar: 'مضاف إليه',       explanation: 'A noun in the genitive case following another noun in a construct (إضافة).' },
  vocative:      { en: 'Vocative',          ar: 'منادى',           explanation: 'A word addressed directly, introduced by يا or similar.' },
  other:         { en: 'Other',             ar: 'أخرى',            explanation: 'A word whose grammatical role is undetermined.' },
}

const CASE_LABELS: Record<string, { en: string; ar: string }> = {
  nom: { en: 'Nominative', ar: 'مرفوع' },
  acc: { en: 'Accusative', ar: 'منصوب' },
  gen: { en: 'Genitive',   ar: 'مجرور' },
  jus: { en: 'Jussive',    ar: 'مجزوم' },
}

function getCaseFromMarker(caseMarker: string | null | undefined): string {
  if (!caseMarker) return 'nom'
  const m = caseMarker.toLowerCase()
  if (m.includes('u') || m.includes('nom') || m.includes('raf')) return 'nom'
  if (m.includes('a') || m.includes('acc') || m.includes('nas')) return 'acc'
  if (m.includes('i') || m.includes('gen') || m.includes('jar')) return 'gen'
  if (m.includes('jus') || m.includes('jaz')) return 'jus'
  return 'nom'
}

/**
 * Assign a grammatical role to a word based on its POS, case marker, and
 * its position relative to other words in the verse.
 *
 * This is a heuristic implementation; a full parser would be needed for
 * production-quality i'rab.
 *
 * @param pos - Part-of-speech code (N, V, P, CONJ, PRON, etc.)
 * @param caseMarker - Optional case marker string
 * @param precedingPos - POS of the immediately preceding word
 */
export function analyzeIrab(
  pos: string,
  caseMarker?: string | null,
  precedingPos?: string | null
): IrabAnalysis {
  const grammaticalCase = getCaseFromMarker(caseMarker)
  const caseInfo = CASE_LABELS[grammaticalCase] ?? CASE_LABELS['nom'] ?? { en: 'Nominative', ar: 'مرفوع' }

  let role: GrammaticalRole = 'other'

  switch (pos.toUpperCase()) {
    case 'V':
    case 'IMPV': // imperative verb
      role = 'verb'
      break

    case 'CONJ':
      role = 'conjunction'
      break

    case 'P': // preposition
      role = 'particle'
      break

    case 'PART':
    case 'NEG':
    case 'FUT':
    case 'COND':
    case 'PREV':
    case 'RES':
    case 'EMPH':
    case 'DET':
    case 'INL':
      role = 'particle'
      break

    case 'N':
    case 'PN': // proper noun
    case 'PRON':
      if (precedingPos?.toUpperCase() === 'P') {
        // After preposition = part of prepositional phrase
        role = 'prep-phrase'
      } else if (grammaticalCase === 'nom') {
        // Nominative noun/pronoun = subject or mubtada
        role = 'subject'
      } else if (grammaticalCase === 'acc') {
        // Accusative = object or khabar of kana
        role = 'object'
      } else if (grammaticalCase === 'gen') {
        // Genitive = mudaf ilayh
        role = 'genitive'
      } else {
        role = 'subject'
      }
      break

    case 'ADJ':
      role = 'adjective'
      break

    case 'ADV':
    case 'T': // time
    case 'LOC': // location
      role = 'other'
      break

    default:
      role = 'other'
  }

  const info = ROLE_LABELS[role] ?? ROLE_LABELS['other']

  return {
    role,
    roleLabel: info.en,
    roleLabelArabic: info.ar,
    caseLabel: caseInfo.en,
    caseLabelArabic: caseInfo.ar,
    explanation: info.explanation,
    color: ROLE_COLORS[role],
  }
}

/**
 * Assign grammatical roles to all words in a verse, taking positional
 * context into account.
 */
export function analyzeVerseIrab(
  words: Array<{ pos: string; caseMarker?: string | null }>
): IrabAnalysis[] {
  return words.map((word, i) => {
    const precedingPos = i > 0 ? (words[i - 1]?.pos ?? null) : null
    return analyzeIrab(word.pos, word.caseMarker, precedingPos)
  })
}
