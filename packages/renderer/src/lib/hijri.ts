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
  const gregorianYear = date.getFullYear()
  const gregorianMonth = date.getMonth() + 1
  const gregorianDay = date.getDate()

  // Julian Day Number
  const jdn =
    Math.floor((1461 * (gregorianYear + 4800 + Math.floor((gregorianMonth - 14) / 12))) / 4) +
    Math.floor((367 * (gregorianMonth - 2 - 12 * Math.floor((gregorianMonth - 14) / 12))) / 12) -
    Math.floor((3 * Math.floor((gregorianYear + 4900 + Math.floor((gregorianMonth - 14) / 12)) / 100)) / 4) +
    gregorianDay -
    32075

  const hijriL = jdn - 1948440 + 10632
  const hijriCycle = Math.floor((hijriL - 1) / 10631)
  const hijriL2 = hijriL - 10631 * hijriCycle + 354
  const hijriJ =
    Math.floor((10985 - hijriL2) / 5316) * Math.floor((50 * hijriL2) / 17719) +
    Math.floor(hijriL2 / 5670) * Math.floor((43 * hijriL2) / 15238)
  const hijriL3 =
    hijriL2 -
    Math.floor((30 - hijriJ) / 15) * Math.floor((17719 * hijriJ) / 50) -
    Math.floor(hijriJ / 16) * Math.floor((15238 * hijriJ) / 43) +
    29
  const month = Math.floor((24 * hijriL3) / 709)
  const day = hijriL3 - Math.floor((709 * month) / 24)
  const year = 30 * hijriCycle + hijriJ - 30

  const months = lang === 'ar' ? HIJRI_MONTHS_AR : HIJRI_MONTHS
  return { year, month, day, monthName: months[month - 1] ?? '' }
}

/**
 * Format a Hijri date as a string.
 * @example formatHijri(toHijri(new Date())) → "15 Ramadan 1446 AH"
 */
export function formatHijri(hijriDate: HijriDate, lang: 'en' | 'ar' = 'en'): string {
  if (lang === 'ar') {
    return `${hijriDate.day} ${hijriDate.monthName} ${hijriDate.year} هـ`
  }
  return `${hijriDate.day} ${hijriDate.monthName} ${hijriDate.year} AH`
}

/**
 * Format a number using Arabic-Indic numerals.
 * @example toArabicIndic(1446) → "١٤٤٦"
 */
export function toArabicIndic(num: number): string {
  return num.toString().replace(/[0-9]/g, (digit) => String.fromCharCode(0x0660 + parseInt(digit)))
}
