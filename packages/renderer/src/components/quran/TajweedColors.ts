/**
 * Tajweed rule color system using the UAE Design System palette.
 * Each rule maps to a distinct color token from the AE palette.
 *
 * Note: Full tajweed rendering requires pre-computed tajweed annotations
 * stored per word in the database. This module defines the visual mapping.
 */

export type TajweedRule =
  | 'izhar' // Clear pronunciation — AEGreen
  | 'idgham' // Merging — Tech Blue
  | 'iqlab' // Conversion — Fuchsia
  | 'ikhfa' // Hiding — Camel Yellow
  | 'ghunna' // Nasal sound — AEGold
  | 'qalqalah' // Echoing — Desert Orange
  | 'madd' // Elongation — Sea Blue
  | 'shaddah' // Doubling — AERed

/** CSS color value for each tajweed rule */
export const TAJWEED_COLORS: Record<TajweedRule, string> = {
  izhar: 'var(--ae-green-600)',
  idgham: 'var(--tech-blue-500)',
  iqlab: 'var(--fuchsia-500)',
  ikhfa: 'var(--camel-yellow-500)',
  ghunna: 'var(--ae-gold-500)',
  qalqalah: 'var(--desert-orange-500)',
  madd: 'var(--sea-blue-500)',
  shaddah: 'var(--ae-red-500)',
}

/** Human-readable name for each tajweed rule */
export const TAJWEED_RULE_NAMES: Record<
  TajweedRule,
  { arabic: string; english: string; description: string }
> = {
  izhar: {
    arabic: 'إظهار',
    english: 'Izhar',
    description: 'Clear pronunciation of noon sakinah or tanween',
  },
  idgham: {
    arabic: 'إدغام',
    english: 'Idgham',
    description: 'Merging of noon sakinah or tanween into the following letter',
  },
  iqlab: {
    arabic: 'إقلاب',
    english: 'Iqlab',
    description: 'Conversion of noon sakinah or tanween to meem',
  },
  ikhfa: {
    arabic: 'إخفاء',
    english: 'Ikhfa',
    description: 'Hiding — partial pronunciation between Izhar and Idgham',
  },
  ghunna: {
    arabic: 'غُنَّة',
    english: 'Ghunna',
    description: 'Nasal sound held for two counts',
  },
  qalqalah: {
    arabic: 'قلقلة',
    english: 'Qalqalah',
    description: 'Echoing sound of letters ق ط ب ج د when sukoon',
  },
  madd: {
    arabic: 'مَدّ',
    english: 'Madd',
    description: 'Elongation of vowel sounds',
  },
  shaddah: {
    arabic: 'شَدَّة',
    english: 'Shaddah',
    description: 'Doubled consonant — gemination',
  },
}

export const TAJWEED_RULES: TajweedRule[] = Object.keys(TAJWEED_COLORS) as TajweedRule[]
