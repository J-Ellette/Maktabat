export type HadithTradition = 'sunni' | 'shia' | 'ibadi'
export type HadithTier = 'primary' | 'secondary' | 'commentary'
export type HadithGradeValue = 'sahih' | 'hasan' | 'hasan-li-ghayrihi' | 'daif' | 'mawdu'

export interface HadithCollection {
  id: number
  key: string
  nameArabic: string
  nameEnglish: string
  tradition: HadithTradition
  tier: HadithTier
  compiler: string
  century: number
}

export interface Hadith {
  id: number
  collectionId: number
  bookId: number
  chapterId: number
  hadithNumber: string
  arabicText: string
  englishText: string
}

export interface HadithGrade {
  id: number
  hadithId: number
  grade: HadithGradeValue
  grader: string
  source: string
}

export interface HadithNarrator {
  id: number
  nameArabic: string
  nameEnglish: string
  birthYear?: number
  deathYear?: number
  reliability: 'thiqah' | 'sadooq' | 'daif' | 'unknown'
}

export interface IsnadEntry {
  id: number
  hadithId: number
  position: number
  narratorId: number
}
