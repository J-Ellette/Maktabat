import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// SurahCard — individual surah entry in the navigator
// Extracted as a standalone presentational component for design QA.
// ─────────────────────────────────────────────────────────────────────────────

interface SurahInfo {
  id: number
  number: number
  arabic_name: string
  transliterated_name: string
  english_name: string
  revelation_type: 'meccan' | 'medinan'
  verse_count: number
}

interface SurahCardProps {
  surah: SurahInfo
  isActive: boolean
  onClick: () => void
}

function SurahCard({ surah, isActive, onClick }: SurahCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors
        ${isActive
          ? 'bg-amber-100 border border-amber-400'
          : 'hover:bg-gray-50 border border-transparent'
        }
      `}
    >
      <div
        className={`
          flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold
          ${isActive
            ? 'bg-amber-500 text-white'
            : 'bg-gray-100 text-gray-600'
          }
        `}
      >
        {surah.number}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className="text-sm font-medium text-gray-800 truncate">
            {surah.transliterated_name}
          </span>
          <span
            dir="rtl"
            className="text-base text-amber-600 flex-shrink-0"
            style={{ fontFamily: "'Amiri', serif" }}
          >
            {surah.arabic_name}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-500">{surah.english_name}</span>
          <span className="text-xs text-gray-400">·</span>
          <span className={`text-xs ${surah.revelation_type === 'meccan' ? 'text-emerald-600' : 'text-blue-500'}`}>
            {surah.revelation_type === 'meccan' ? 'Meccan' : 'Medinan'}
          </span>
          <span className="text-xs text-gray-400">·</span>
          <span className="text-xs text-gray-500">{surah.verse_count} verses</span>
        </div>
      </div>
    </button>
  )
}

// ─── Sample data ──────────────────────────────────────────────────────────────

const SAMPLE_SURAHS: SurahInfo[] = [
  { id: 1, number: 1, arabic_name: 'الفاتحة', transliterated_name: 'Al-Fatiha', english_name: 'The Opening', revelation_type: 'meccan', verse_count: 7 },
  { id: 2, number: 2, arabic_name: 'البقرة', transliterated_name: 'Al-Baqarah', english_name: 'The Cow', revelation_type: 'medinan', verse_count: 286 },
  { id: 3, number: 3, arabic_name: 'آل عمران', transliterated_name: "Ali 'Imran", english_name: 'Family of Imran', revelation_type: 'medinan', verse_count: 200 },
  { id: 36, number: 36, arabic_name: 'يس', transliterated_name: 'Ya-Sin', english_name: 'Ya Sin', revelation_type: 'meccan', verse_count: 83 },
  { id: 112, number: 112, arabic_name: 'الإخلاص', transliterated_name: 'Al-Ikhlas', english_name: 'Sincerity', revelation_type: 'meccan', verse_count: 4 },
]

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof SurahCard> = {
  title: 'Quran/SurahCard',
  component: SurahCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Individual surah entry card in the Quran Navigator. Shows surah number badge, ' +
          'transliterated name, Arabic name, English name, revelation type badge, and verse count. ' +
          'Active state highlights with AE Gold.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof SurahCard>

export const Default: Story = {
  args: {
    surah: SAMPLE_SURAHS[0],
    isActive: false,
    onClick: () => alert('Surah selected!'),
  },
}

export const Active: Story = {
  args: {
    surah: SAMPLE_SURAHS[0],
    isActive: true,
    onClick: () => {},
  },
}

export const MedianinanSurah: Story = {
  args: {
    surah: SAMPLE_SURAHS[1],
    isActive: false,
    onClick: () => {},
  },
}

export const AllSurahs: Story = {
  render: () => (
    <div className="w-[360px] bg-white p-2 space-y-1 rounded-xl border border-gray-200">
      {SAMPLE_SURAHS.map((s, i) => (
        <SurahCard
          key={s.id}
          surah={s}
          isActive={i === 0}
          onClick={() => {}}
        />
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: { story: 'Multiple surah cards in a navigator, with first one in active state.' },
    },
  },
}
