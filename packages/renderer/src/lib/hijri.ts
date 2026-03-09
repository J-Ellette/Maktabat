/**
 * Simple Hijri calendar conversion utility.
 * Uses the Kuwaiti algorithm for Gregorian ↔ Hijri conversion.
 */

export interface HijriDate {
  year: number
  month: number
  day: number
  monthName: string
}

const HIJRI_MONTHS = [
  'Muharram',
  'Safar',
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  'Jumada al-Ula',
  'Jumada al-Thani',
  'Rajab',
  "Sha'ban",
  'Ramadan',
  'Shawwal',
  "Dhu al-Qi'dah",
  'Dhu al-Hijjah',
]

const HIJRI_MONTHS_AR = [
  'محرم',
  'صفر',
  'ربيع الأول',
  'ربيع الثاني',
  'جمادى الأولى',
  'جمادى الثانية',
  'رجب',
  'شعبان',
  'رمضان',
  'شوال',
  'ذو القعدة',
  'ذو الحجة',
]

/**
 * Convert a Gregorian date to Hijri using the Kuwaiti algorithm.
 */
export function toHijri(date: Date, lang: 'en' | 'ar' = 'en'): HijriDate {
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()

  // Julian Day Number
  const jdn =
    Math.floor((1461 * (y + 4800 + Math.floor((m - 14) / 12))) / 4) +
    Math.floor((367 * (m - 2 - 12 * Math.floor((m - 14) / 12))) / 12) -
    Math.floor((3 * Math.floor((y + 4900 + Math.floor((m - 14) / 12)) / 100)) / 4) +
    d -
    32075

  const l = jdn - 1948440 + 10632
  const n = Math.floor((l - 1) / 10631)
  const l2 = l - 10631 * n + 354
  const j =
    Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) +
    Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238)
  const l3 =
    l2 -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29
  const month = Math.floor((24 * l3) / 709)
  const day = l3 - Math.floor((709 * month) / 24)
  const year = 30 * n + j - 30

  const months = lang === 'ar' ? HIJRI_MONTHS_AR : HIJRI_MONTHS
  return { year, month, day, monthName: months[month - 1] ?? '' }
}

/**
 * Format a Hijri date as a string.
 * @example formatHijri(toHijri(new Date())) → "15 Ramadan 1446 AH"
 */
export function formatHijri(h: HijriDate, lang: 'en' | 'ar' = 'en'): string {
  if (lang === 'ar') {
    return `${h.day} ${h.monthName} ${h.year} هـ`
  }
  return `${h.day} ${h.monthName} ${h.year} AH`
}

/**
 * Format a number using Arabic-Indic numerals.
 * @example toArabicIndic(1446) → "١٤٤٦"
 */
export function toArabicIndic(n: number): string {
  return n.toString().replace(/[0-9]/g, (d) => String.fromCharCode(0x0660 + parseInt(d)))
}
