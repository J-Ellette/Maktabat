/**
 * Arabic Verb Conjugation Engine
 *
 * Generates full conjugation tables for Forms I–X of trilateral Arabic verbs.
 * Uses a template-substitution approach: templates contain the Arabic letters
 * ف (fa), ع (ʿayn), ل (lam) as root-position placeholders that are replaced
 * by the actual root radicals at runtime.
 */

export interface ConjugationCell {
  key: string // e.g. '3.m.sg'
  person: '1st' | '2nd' | '3rd'
  gender: 'masc' | 'fem' | 'both'
  number: 'singular' | 'dual' | 'plural'
  arabic: string
}

export interface ConjugationTense {
  tense: 'past' | 'present' | 'imperative'
  label: string
  labelArabic: string
  forms: ConjugationCell[]
}

export interface ConjugationTable {
  root: string
  form: number
  formName: string
  formPattern: string // e.g. فَعَلَ
  formPatternPresent: string // e.g. يَفْعُلُ
  tenses: ConjugationTense[]
}

// ─── Template substitution ────────────────────────────────────────────────────

/** Replace ف→r1, ع→r2, ل→r3 in a template string. */
function applyRoot(template: string, r: [string, string, string]): string {
  return template
    .replace(/ف/g, r[0])
    .replace(/ع/g, r[1])
    .replace(/ل/g, r[2])
}

// ─── Form-level template definitions ─────────────────────────────────────────
//
// Each record maps a "key" (person.gender.number) → Arabic template string
// with ف, ع, ل as root placeholders.
//
// Keys used:
//   person: 3 | 2 | 1
//   gender: m | f | b (both)
//   number: sg | du | pl
//   e.g. '3.m.sg', '2.f.pl', '1.b.sg'

type Templates = Record<string, string>

// ─── Form I (فَعَلَ / يَفْعُلُ) ────────────────────────────────────────────

const F1_PAST: Templates = {
  '3.m.sg': 'فَعَلَ',
  '3.f.sg': 'فَعَلَتْ',
  '3.m.du': 'فَعَلَا',
  '3.f.du': 'فَعَلَتَا',
  '3.m.pl': 'فَعَلُوا',
  '3.f.pl': 'فَعَلْنَ',
  '2.m.sg': 'فَعَلْتَ',
  '2.f.sg': 'فَعَلْتِ',
  '2.b.du': 'فَعَلْتُمَا',
  '2.m.pl': 'فَعَلْتُمْ',
  '2.f.pl': 'فَعَلْتُنَّ',
  '1.b.sg': 'فَعَلْتُ',
  '1.b.pl': 'فَعَلْنَا',
}

const F1_PRESENT: Templates = {
  '3.m.sg': 'يَفْعُلُ',
  '3.f.sg': 'تَفْعُلُ',
  '3.m.du': 'يَفْعُلَانِ',
  '3.f.du': 'تَفْعُلَانِ',
  '3.m.pl': 'يَفْعُلُونَ',
  '3.f.pl': 'يَفْعُلْنَ',
  '2.m.sg': 'تَفْعُلُ',
  '2.f.sg': 'تَفْعُلِينَ',
  '2.b.du': 'تَفْعُلَانِ',
  '2.m.pl': 'تَفْعُلُونَ',
  '2.f.pl': 'تَفْعُلْنَ',
  '1.b.sg': 'أَفْعُلُ',
  '1.b.pl': 'نَفْعُلُ',
}

const F1_IMPERATIVE: Templates = {
  '2.m.sg': 'افْعُلْ',
  '2.f.sg': 'افْعُلِي',
  '2.b.du': 'افْعُلَا',
  '2.m.pl': 'افْعُلُوا',
  '2.f.pl': 'افْعُلْنَ',
}

// ─── Form II (فَعَّلَ / يُفَعِّلُ) ───────────────────────────────────────────

const F2_PAST: Templates = {
  '3.m.sg': 'فَعَّلَ',
  '3.f.sg': 'فَعَّلَتْ',
  '3.m.du': 'فَعَّلَا',
  '3.f.du': 'فَعَّلَتَا',
  '3.m.pl': 'فَعَّلُوا',
  '3.f.pl': 'فَعَّلْنَ',
  '2.m.sg': 'فَعَّلْتَ',
  '2.f.sg': 'فَعَّلْتِ',
  '2.b.du': 'فَعَّلْتُمَا',
  '2.m.pl': 'فَعَّلْتُمْ',
  '2.f.pl': 'فَعَّلْتُنَّ',
  '1.b.sg': 'فَعَّلْتُ',
  '1.b.pl': 'فَعَّلْنَا',
}

const F2_PRESENT: Templates = {
  '3.m.sg': 'يُفَعِّلُ',
  '3.f.sg': 'تُفَعِّلُ',
  '3.m.du': 'يُفَعِّلَانِ',
  '3.f.du': 'تُفَعِّلَانِ',
  '3.m.pl': 'يُفَعِّلُونَ',
  '3.f.pl': 'يُفَعِّلْنَ',
  '2.m.sg': 'تُفَعِّلُ',
  '2.f.sg': 'تُفَعِّلِينَ',
  '2.b.du': 'تُفَعِّلَانِ',
  '2.m.pl': 'تُفَعِّلُونَ',
  '2.f.pl': 'تُفَعِّلْنَ',
  '1.b.sg': 'أُفَعِّلُ',
  '1.b.pl': 'نُفَعِّلُ',
}

const F2_IMPERATIVE: Templates = {
  '2.m.sg': 'فَعِّلْ',
  '2.f.sg': 'فَعِّلِي',
  '2.b.du': 'فَعِّلَا',
  '2.m.pl': 'فَعِّلُوا',
  '2.f.pl': 'فَعِّلْنَ',
}

// ─── Form III (فَاعَلَ / يُفَاعِلُ) ──────────────────────────────────────────

const F3_PAST: Templates = {
  '3.m.sg': 'فَاعَلَ',
  '3.f.sg': 'فَاعَلَتْ',
  '3.m.du': 'فَاعَلَا',
  '3.f.du': 'فَاعَلَتَا',
  '3.m.pl': 'فَاعَلُوا',
  '3.f.pl': 'فَاعَلْنَ',
  '2.m.sg': 'فَاعَلْتَ',
  '2.f.sg': 'فَاعَلْتِ',
  '2.b.du': 'فَاعَلْتُمَا',
  '2.m.pl': 'فَاعَلْتُمْ',
  '2.f.pl': 'فَاعَلْتُنَّ',
  '1.b.sg': 'فَاعَلْتُ',
  '1.b.pl': 'فَاعَلْنَا',
}

const F3_PRESENT: Templates = {
  '3.m.sg': 'يُفَاعِلُ',
  '3.f.sg': 'تُفَاعِلُ',
  '3.m.du': 'يُفَاعِلَانِ',
  '3.f.du': 'تُفَاعِلَانِ',
  '3.m.pl': 'يُفَاعِلُونَ',
  '3.f.pl': 'يُفَاعِلْنَ',
  '2.m.sg': 'تُفَاعِلُ',
  '2.f.sg': 'تُفَاعِلِينَ',
  '2.b.du': 'تُفَاعِلَانِ',
  '2.m.pl': 'تُفَاعِلُونَ',
  '2.f.pl': 'تُفَاعِلْنَ',
  '1.b.sg': 'أُفَاعِلُ',
  '1.b.pl': 'نُفَاعِلُ',
}

const F3_IMPERATIVE: Templates = {
  '2.m.sg': 'فَاعِلْ',
  '2.f.sg': 'فَاعِلِي',
  '2.b.du': 'فَاعِلَا',
  '2.m.pl': 'فَاعِلُوا',
  '2.f.pl': 'فَاعِلْنَ',
}

// ─── Form IV (أَفْعَلَ / يُفْعِلُ) ───────────────────────────────────────────

const F4_PAST: Templates = {
  '3.m.sg': 'أَفْعَلَ',
  '3.f.sg': 'أَفْعَلَتْ',
  '3.m.du': 'أَفْعَلَا',
  '3.f.du': 'أَفْعَلَتَا',
  '3.m.pl': 'أَفْعَلُوا',
  '3.f.pl': 'أَفْعَلْنَ',
  '2.m.sg': 'أَفْعَلْتَ',
  '2.f.sg': 'أَفْعَلْتِ',
  '2.b.du': 'أَفْعَلْتُمَا',
  '2.m.pl': 'أَفْعَلْتُمْ',
  '2.f.pl': 'أَفْعَلْتُنَّ',
  '1.b.sg': 'أَفْعَلْتُ',
  '1.b.pl': 'أَفْعَلْنَا',
}

const F4_PRESENT: Templates = {
  '3.m.sg': 'يُفْعِلُ',
  '3.f.sg': 'تُفْعِلُ',
  '3.m.du': 'يُفْعِلَانِ',
  '3.f.du': 'تُفْعِلَانِ',
  '3.m.pl': 'يُفْعِلُونَ',
  '3.f.pl': 'يُفْعِلْنَ',
  '2.m.sg': 'تُفْعِلُ',
  '2.f.sg': 'تُفْعِلِينَ',
  '2.b.du': 'تُفْعِلَانِ',
  '2.m.pl': 'تُفْعِلُونَ',
  '2.f.pl': 'تُفْعِلْنَ',
  '1.b.sg': 'أُفْعِلُ',
  '1.b.pl': 'نُفْعِلُ',
}

const F4_IMPERATIVE: Templates = {
  '2.m.sg': 'أَفْعِلْ',
  '2.f.sg': 'أَفْعِلِي',
  '2.b.du': 'أَفْعِلَا',
  '2.m.pl': 'أَفْعِلُوا',
  '2.f.pl': 'أَفْعِلْنَ',
}

// ─── Form V (تَفَعَّلَ / يَتَفَعَّلُ) ────────────────────────────────────────

const F5_PAST: Templates = {
  '3.m.sg': 'تَفَعَّلَ',
  '3.f.sg': 'تَفَعَّلَتْ',
  '3.m.du': 'تَفَعَّلَا',
  '3.f.du': 'تَفَعَّلَتَا',
  '3.m.pl': 'تَفَعَّلُوا',
  '3.f.pl': 'تَفَعَّلْنَ',
  '2.m.sg': 'تَفَعَّلْتَ',
  '2.f.sg': 'تَفَعَّلْتِ',
  '2.b.du': 'تَفَعَّلْتُمَا',
  '2.m.pl': 'تَفَعَّلْتُمْ',
  '2.f.pl': 'تَفَعَّلْتُنَّ',
  '1.b.sg': 'تَفَعَّلْتُ',
  '1.b.pl': 'تَفَعَّلْنَا',
}

const F5_PRESENT: Templates = {
  '3.m.sg': 'يَتَفَعَّلُ',
  '3.f.sg': 'تَتَفَعَّلُ',
  '3.m.du': 'يَتَفَعَّلَانِ',
  '3.f.du': 'تَتَفَعَّلَانِ',
  '3.m.pl': 'يَتَفَعَّلُونَ',
  '3.f.pl': 'يَتَفَعَّلْنَ',
  '2.m.sg': 'تَتَفَعَّلُ',
  '2.f.sg': 'تَتَفَعَّلِينَ',
  '2.b.du': 'تَتَفَعَّلَانِ',
  '2.m.pl': 'تَتَفَعَّلُونَ',
  '2.f.pl': 'تَتَفَعَّلْنَ',
  '1.b.sg': 'أَتَفَعَّلُ',
  '1.b.pl': 'نَتَفَعَّلُ',
}

const F5_IMPERATIVE: Templates = {
  '2.m.sg': 'تَفَعَّلْ',
  '2.f.sg': 'تَفَعَّلِي',
  '2.b.du': 'تَفَعَّلَا',
  '2.m.pl': 'تَفَعَّلُوا',
  '2.f.pl': 'تَفَعَّلْنَ',
}

// ─── Form VI (تَفَاعَلَ / يَتَفَاعَلُ) ───────────────────────────────────────

const F6_PAST: Templates = {
  '3.m.sg': 'تَفَاعَلَ',
  '3.f.sg': 'تَفَاعَلَتْ',
  '3.m.du': 'تَفَاعَلَا',
  '3.f.du': 'تَفَاعَلَتَا',
  '3.m.pl': 'تَفَاعَلُوا',
  '3.f.pl': 'تَفَاعَلْنَ',
  '2.m.sg': 'تَفَاعَلْتَ',
  '2.f.sg': 'تَفَاعَلْتِ',
  '2.b.du': 'تَفَاعَلْتُمَا',
  '2.m.pl': 'تَفَاعَلْتُمْ',
  '2.f.pl': 'تَفَاعَلْتُنَّ',
  '1.b.sg': 'تَفَاعَلْتُ',
  '1.b.pl': 'تَفَاعَلْنَا',
}

const F6_PRESENT: Templates = {
  '3.m.sg': 'يَتَفَاعَلُ',
  '3.f.sg': 'تَتَفَاعَلُ',
  '3.m.du': 'يَتَفَاعَلَانِ',
  '3.f.du': 'تَتَفَاعَلَانِ',
  '3.m.pl': 'يَتَفَاعَلُونَ',
  '3.f.pl': 'يَتَفَاعَلْنَ',
  '2.m.sg': 'تَتَفَاعَلُ',
  '2.f.sg': 'تَتَفَاعَلِينَ',
  '2.b.du': 'تَتَفَاعَلَانِ',
  '2.m.pl': 'تَتَفَاعَلُونَ',
  '2.f.pl': 'تَتَفَاعَلْنَ',
  '1.b.sg': 'أَتَفَاعَلُ',
  '1.b.pl': 'نَتَفَاعَلُ',
}

const F6_IMPERATIVE: Templates = {
  '2.m.sg': 'تَفَاعَلْ',
  '2.f.sg': 'تَفَاعَلِي',
  '2.b.du': 'تَفَاعَلَا',
  '2.m.pl': 'تَفَاعَلُوا',
  '2.f.pl': 'تَفَاعَلْنَ',
}

// ─── Form VII (انْفَعَلَ / يَنْفَعِلُ) ───────────────────────────────────────

const F7_PAST: Templates = {
  '3.m.sg': 'انْفَعَلَ',
  '3.f.sg': 'انْفَعَلَتْ',
  '3.m.du': 'انْفَعَلَا',
  '3.f.du': 'انْفَعَلَتَا',
  '3.m.pl': 'انْفَعَلُوا',
  '3.f.pl': 'انْفَعَلْنَ',
  '2.m.sg': 'انْفَعَلْتَ',
  '2.f.sg': 'انْفَعَلْتِ',
  '2.b.du': 'انْفَعَلْتُمَا',
  '2.m.pl': 'انْفَعَلْتُمْ',
  '2.f.pl': 'انْفَعَلْتُنَّ',
  '1.b.sg': 'انْفَعَلْتُ',
  '1.b.pl': 'انْفَعَلْنَا',
}

const F7_PRESENT: Templates = {
  '3.m.sg': 'يَنْفَعِلُ',
  '3.f.sg': 'تَنْفَعِلُ',
  '3.m.du': 'يَنْفَعِلَانِ',
  '3.f.du': 'تَنْفَعِلَانِ',
  '3.m.pl': 'يَنْفَعِلُونَ',
  '3.f.pl': 'يَنْفَعِلْنَ',
  '2.m.sg': 'تَنْفَعِلُ',
  '2.f.sg': 'تَنْفَعِلِينَ',
  '2.b.du': 'تَنْفَعِلَانِ',
  '2.m.pl': 'تَنْفَعِلُونَ',
  '2.f.pl': 'تَنْفَعِلْنَ',
  '1.b.sg': 'أَنْفَعِلُ',
  '1.b.pl': 'نَنْفَعِلُ',
}

const F7_IMPERATIVE: Templates = {
  '2.m.sg': 'انْفَعِلْ',
  '2.f.sg': 'انْفَعِلِي',
  '2.b.du': 'انْفَعِلَا',
  '2.m.pl': 'انْفَعِلُوا',
  '2.f.pl': 'انْفَعِلْنَ',
}

// ─── Form VIII (افْتَعَلَ / يَفْتَعِلُ) ──────────────────────────────────────

const F8_PAST: Templates = {
  '3.m.sg': 'افْتَعَلَ',
  '3.f.sg': 'افْتَعَلَتْ',
  '3.m.du': 'افْتَعَلَا',
  '3.f.du': 'افْتَعَلَتَا',
  '3.m.pl': 'افْتَعَلُوا',
  '3.f.pl': 'افْتَعَلْنَ',
  '2.m.sg': 'افْتَعَلْتَ',
  '2.f.sg': 'افْتَعَلْتِ',
  '2.b.du': 'افْتَعَلْتُمَا',
  '2.m.pl': 'افْتَعَلْتُمْ',
  '2.f.pl': 'افْتَعَلْتُنَّ',
  '1.b.sg': 'افْتَعَلْتُ',
  '1.b.pl': 'افْتَعَلْنَا',
}

const F8_PRESENT: Templates = {
  '3.m.sg': 'يَفْتَعِلُ',
  '3.f.sg': 'تَفْتَعِلُ',
  '3.m.du': 'يَفْتَعِلَانِ',
  '3.f.du': 'تَفْتَعِلَانِ',
  '3.m.pl': 'يَفْتَعِلُونَ',
  '3.f.pl': 'يَفْتَعِلْنَ',
  '2.m.sg': 'تَفْتَعِلُ',
  '2.f.sg': 'تَفْتَعِلِينَ',
  '2.b.du': 'تَفْتَعِلَانِ',
  '2.m.pl': 'تَفْتَعِلُونَ',
  '2.f.pl': 'تَفْتَعِلْنَ',
  '1.b.sg': 'أَفْتَعِلُ',
  '1.b.pl': 'نَفْتَعِلُ',
}

const F8_IMPERATIVE: Templates = {
  '2.m.sg': 'افْتَعِلْ',
  '2.f.sg': 'افْتَعِلِي',
  '2.b.du': 'افْتَعِلَا',
  '2.m.pl': 'افْتَعِلُوا',
  '2.f.pl': 'افْتَعِلْنَ',
}

// ─── Form IX (افْعَلَّ / يَفْعَلُّ) — colors/physical traits ─────────────────

const F9_PAST: Templates = {
  '3.m.sg': 'افْعَلَّ',
  '3.f.sg': 'افْعَلَّتْ',
  '3.m.du': 'افْعَلَّا',
  '3.f.du': 'افْعَلَّتَا',
  '3.m.pl': 'افْعَلُّوا',
  '3.f.pl': 'افْعَلَلْنَ',
  '2.m.sg': 'افْعَلَلْتَ',
  '2.f.sg': 'افْعَلَلْتِ',
  '2.b.du': 'افْعَلَلْتُمَا',
  '2.m.pl': 'افْعَلَلْتُمْ',
  '2.f.pl': 'افْعَلَلْتُنَّ',
  '1.b.sg': 'افْعَلَلْتُ',
  '1.b.pl': 'افْعَلَلْنَا',
}

const F9_PRESENT: Templates = {
  '3.m.sg': 'يَفْعَلُّ',
  '3.f.sg': 'تَفْعَلُّ',
  '3.m.du': 'يَفْعَلَّانِ',
  '3.f.du': 'تَفْعَلَّانِ',
  '3.m.pl': 'يَفْعَلُّونَ',
  '3.f.pl': 'يَفْعَلِلْنَ',
  '2.m.sg': 'تَفْعَلُّ',
  '2.f.sg': 'تَفْعَلِّينَ',
  '2.b.du': 'تَفْعَلَّانِ',
  '2.m.pl': 'تَفْعَلُّونَ',
  '2.f.pl': 'تَفْعَلِلْنَ',
  '1.b.sg': 'أَفْعَلُّ',
  '1.b.pl': 'نَفْعَلُّ',
}

const F9_IMPERATIVE: Templates = {
  '2.m.sg': 'افْعَلَّ',
  '2.f.sg': 'افْعَلِّي',
  '2.b.du': 'افْعَلَّا',
  '2.m.pl': 'افْعَلُّوا',
  '2.f.pl': 'افْعَلِلْنَ',
}

// ─── Form X (اسْتَفْعَلَ / يَسْتَفْعِلُ) ─────────────────────────────────────

const F10_PAST: Templates = {
  '3.m.sg': 'اسْتَفْعَلَ',
  '3.f.sg': 'اسْتَفْعَلَتْ',
  '3.m.du': 'اسْتَفْعَلَا',
  '3.f.du': 'اسْتَفْعَلَتَا',
  '3.m.pl': 'اسْتَفْعَلُوا',
  '3.f.pl': 'اسْتَفْعَلْنَ',
  '2.m.sg': 'اسْتَفْعَلْتَ',
  '2.f.sg': 'اسْتَفْعَلْتِ',
  '2.b.du': 'اسْتَفْعَلْتُمَا',
  '2.m.pl': 'اسْتَفْعَلْتُمْ',
  '2.f.pl': 'اسْتَفْعَلْتُنَّ',
  '1.b.sg': 'اسْتَفْعَلْتُ',
  '1.b.pl': 'اسْتَفْعَلْنَا',
}

const F10_PRESENT: Templates = {
  '3.m.sg': 'يَسْتَفْعِلُ',
  '3.f.sg': 'تَسْتَفْعِلُ',
  '3.m.du': 'يَسْتَفْعِلَانِ',
  '3.f.du': 'تَسْتَفْعِلَانِ',
  '3.m.pl': 'يَسْتَفْعِلُونَ',
  '3.f.pl': 'يَسْتَفْعِلْنَ',
  '2.m.sg': 'تَسْتَفْعِلُ',
  '2.f.sg': 'تَسْتَفْعِلِينَ',
  '2.b.du': 'تَسْتَفْعِلَانِ',
  '2.m.pl': 'تَسْتَفْعِلُونَ',
  '2.f.pl': 'تَسْتَفْعِلْنَ',
  '1.b.sg': 'أَسْتَفْعِلُ',
  '1.b.pl': 'نَسْتَفْعِلُ',
}

const F10_IMPERATIVE: Templates = {
  '2.m.sg': 'اسْتَفْعِلْ',
  '2.f.sg': 'اسْتَفْعِلِي',
  '2.b.du': 'اسْتَفْعِلَا',
  '2.m.pl': 'اسْتَفْعِلُوا',
  '2.f.pl': 'اسْتَفْعِلْنَ',
}

// ─── Form registry ────────────────────────────────────────────────────────────

interface FormSpec {
  nameArabic: string
  nameEnglish: string
  pattern: string
  patternPresent: string
  past: Templates
  present: Templates
  imperative: Templates
}

const FORMS: FormSpec[] = [
  {
    nameArabic: 'الثُّلَاثِيُّ الْمُجَرَّد',
    nameEnglish: 'Form I',
    pattern: 'فَعَلَ',
    patternPresent: 'يَفْعُلُ',
    past: F1_PAST,
    present: F1_PRESENT,
    imperative: F1_IMPERATIVE,
  },
  {
    nameArabic: 'التَّضْعِيف',
    nameEnglish: 'Form II',
    pattern: 'فَعَّلَ',
    patternPresent: 'يُفَعِّلُ',
    past: F2_PAST,
    present: F2_PRESENT,
    imperative: F2_IMPERATIVE,
  },
  {
    nameArabic: 'الْمُفَاعَلَة',
    nameEnglish: 'Form III',
    pattern: 'فَاعَلَ',
    patternPresent: 'يُفَاعِلُ',
    past: F3_PAST,
    present: F3_PRESENT,
    imperative: F3_IMPERATIVE,
  },
  {
    nameArabic: 'الإِفْعَال',
    nameEnglish: 'Form IV',
    pattern: 'أَفْعَلَ',
    patternPresent: 'يُفْعِلُ',
    past: F4_PAST,
    present: F4_PRESENT,
    imperative: F4_IMPERATIVE,
  },
  {
    nameArabic: 'التَّفَعُّل',
    nameEnglish: 'Form V',
    pattern: 'تَفَعَّلَ',
    patternPresent: 'يَتَفَعَّلُ',
    past: F5_PAST,
    present: F5_PRESENT,
    imperative: F5_IMPERATIVE,
  },
  {
    nameArabic: 'التَّفَاعُل',
    nameEnglish: 'Form VI',
    pattern: 'تَفَاعَلَ',
    patternPresent: 'يَتَفَاعَلُ',
    past: F6_PAST,
    present: F6_PRESENT,
    imperative: F6_IMPERATIVE,
  },
  {
    nameArabic: 'الِانْفِعَال',
    nameEnglish: 'Form VII',
    pattern: 'انْفَعَلَ',
    patternPresent: 'يَنْفَعِلُ',
    past: F7_PAST,
    present: F7_PRESENT,
    imperative: F7_IMPERATIVE,
  },
  {
    nameArabic: 'الِافْتِعَال',
    nameEnglish: 'Form VIII',
    pattern: 'افْتَعَلَ',
    patternPresent: 'يَفْتَعِلُ',
    past: F8_PAST,
    present: F8_PRESENT,
    imperative: F8_IMPERATIVE,
  },
  {
    nameArabic: 'الِافْعِلَال',
    nameEnglish: 'Form IX',
    pattern: 'افْعَلَّ',
    patternPresent: 'يَفْعَلُّ',
    past: F9_PAST,
    present: F9_PRESENT,
    imperative: F9_IMPERATIVE,
  },
  {
    nameArabic: 'الِاسْتِفْعَال',
    nameEnglish: 'Form X',
    pattern: 'اسْتَفْعَلَ',
    patternPresent: 'يَسْتَفْعِلُ',
    past: F10_PAST,
    present: F10_PRESENT,
    imperative: F10_IMPERATIVE,
  },
]

// ─── Cell key → metadata ──────────────────────────────────────────────────────

interface CellMeta {
  person: '1st' | '2nd' | '3rd'
  gender: 'masc' | 'fem' | 'both'
  number: 'singular' | 'dual' | 'plural'
}

const CELL_META: Record<string, CellMeta> = {
  '3.m.sg': { person: '3rd', gender: 'masc', number: 'singular' },
  '3.f.sg': { person: '3rd', gender: 'fem', number: 'singular' },
  '3.m.du': { person: '3rd', gender: 'masc', number: 'dual' },
  '3.f.du': { person: '3rd', gender: 'fem', number: 'dual' },
  '3.m.pl': { person: '3rd', gender: 'masc', number: 'plural' },
  '3.f.pl': { person: '3rd', gender: 'fem', number: 'plural' },
  '2.m.sg': { person: '2nd', gender: 'masc', number: 'singular' },
  '2.f.sg': { person: '2nd', gender: 'fem', number: 'singular' },
  '2.b.du': { person: '2nd', gender: 'both', number: 'dual' },
  '2.m.pl': { person: '2nd', gender: 'masc', number: 'plural' },
  '2.f.pl': { person: '2nd', gender: 'fem', number: 'plural' },
  '1.b.sg': { person: '1st', gender: 'both', number: 'singular' },
  '1.b.pl': { person: '1st', gender: 'both', number: 'plural' },
}

function templatesToCells(templates: Templates, root: [string, string, string]): ConjugationCell[] {
  return Object.entries(templates).map(([key, template]) => {
    const meta = CELL_META[key] ?? { person: '3rd' as const, gender: 'masc' as const, number: 'singular' as const }
    return {
      key,
      person: meta.person,
      gender: meta.gender,
      number: meta.number,
      arabic: applyRoot(template, root),
    }
  })
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate a conjugation table for a trilateral root.
 *
 * @param root - Three Arabic letters (e.g. 'كتب' or ['ك','ت','ب'])
 * @param formNumber - 1–10; defaults to 1
 */
export function conjugateVerb(root: string, formNumber = 1): ConjugationTable {
  // Normalise root: strip diacritics, split into individual letters
  const stripped = root.replace(/[\u064B-\u065F\u0670\u0640]/g, '')
  const letters = [...stripped] // Unicode-aware split
  const r: [string, string, string] = [
    letters[0] ?? 'ف',
    letters[1] ?? 'ع',
    letters[2] ?? 'ل',
  ]

  const idx = Math.max(0, Math.min(9, formNumber - 1))
  const spec = FORMS[idx]

  if (!spec) {
    return { root, form: formNumber, formName: 'Unknown', formPattern: '', formPatternPresent: '', tenses: [] }
  }

  const tenses: ConjugationTense[] = [
    {
      tense: 'past',
      label: 'Past',
      labelArabic: 'الْمَاضِي',
      forms: templatesToCells(spec.past, r),
    },
    {
      tense: 'present',
      label: 'Present',
      labelArabic: 'الْمُضَارِع',
      forms: templatesToCells(spec.present, r),
    },
    {
      tense: 'imperative',
      label: 'Imperative',
      labelArabic: 'الأَمْر',
      forms: templatesToCells(spec.imperative, r),
    },
  ]

  return {
    root,
    form: formNumber,
    formName: spec.nameEnglish,
    formPattern: applyRoot(spec.pattern, r),
    formPatternPresent: applyRoot(spec.patternPresent, r),
    tenses,
  }
}

/** Generate tables for all 10 forms. */
export function conjugateAllForms(root: string): ConjugationTable[] {
  return Array.from({ length: 10 }, (_, i) => conjugateVerb(root, i + 1))
}

/** Return just the pattern strings (citation forms) for all 10 forms. */
export function getFormPatterns(): Array<{ form: number; nameEnglish: string; nameArabic: string; pattern: string; patternPresent: string }> {
  return FORMS.map((s, i) => ({
    form: i + 1,
    nameEnglish: s.nameEnglish,
    nameArabic: s.nameArabic,
    pattern: s.pattern,
    patternPresent: s.patternPresent,
  }))
}
