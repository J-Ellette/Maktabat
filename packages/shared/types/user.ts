export type HighlightColor =
  | 'gold'
  | 'green'
  | 'red'
  | 'blue'
  | 'yellow'
  | 'orange'
  | 'fuchsia'
  | 'slate'

export type NoteType = 'study' | 'question' | 'reflection' | 'khutbah' | 'application'

export interface Highlight {
  id: number
  resourceKey: string
  contentRef: string
  color: HighlightColor
  createdAt: string
}

export interface Note {
  id: number
  resourceKey: string
  contentRef: string
  type: NoteType
  body: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface Bookmark {
  id: number
  resourceKey: string
  contentRef: string
  label: string
  createdAt: string
}

export interface ReadingHistory {
  id: number
  resourceKey: string
  position: string
  lastVisited: string
}

export interface ReadingPlan {
  id: number
  planKey: string
  startDate: string
  targetDate: string
  progressData: Record<string, boolean>
}

export interface Khutbah {
  id: number
  title: string
  date: string
  templateKey: 'jumuah' | 'eid-al-fitr' | 'eid-al-adha' | 'janazah' | 'nikah' | 'custom'
  status: 'draft' | 'final'
  body: string
}

export interface KhutbahMaterial {
  id: number
  khutbahId: number
  contentRef: string
  orderIndex: number
}
