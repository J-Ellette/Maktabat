import type { Meta, StoryObj } from '@storybook/react'

// ─────────────────────────────────────────────────────────────────────────────
// GradeBadge — Hadith authenticity grade indicator
// Extracted here as a standalone presentational component for design QA.
// ─────────────────────────────────────────────────────────────────────────────

interface GradeBadgeProps {
  grade: string
  size?: 'sm' | 'md'
}

const GRADE_STYLES: Record<string, string> = {
  sahih: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
  hasan: 'bg-green-100 text-green-700 border border-green-300',
  'hasan li-ghayrihi': 'bg-amber-100 text-amber-700 border border-amber-300',
  "da'if": 'bg-red-100 text-red-700 border border-red-300',
  "mawdu'": 'bg-red-200 text-red-900 border border-red-400 font-bold',
}

function GradeBadge({ grade, size = 'md' }: GradeBadgeProps) {
  const normalized = grade.toLowerCase()
  const cls = GRADE_STYLES[normalized] ?? 'bg-slate-100 text-slate-700 border border-slate-300'
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'
  return (
    <span className={`inline-flex items-center rounded-full font-medium capitalize ${cls} ${sizeClass}`}>
      {grade}
    </span>
  )
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof GradeBadge> = {
  title: 'Hadith/GradeBadge',
  component: GradeBadge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Color-coded badge showing the authenticity grade of a hadith. ' +
          'Uses AE palette colors: green for sahih/hasan, amber for borderline, red for weak/fabricated.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    grade: {
      control: 'select',
      options: ['Sahih', 'Hasan', 'Hasan li-ghayrihi', "Da'if", "Mawdu'", 'Unknown'],
      description: 'The authenticity grade of the hadith',
    },
    size: {
      control: 'radio',
      options: ['sm', 'md'],
    },
  },
}

export default meta
type Story = StoryObj<typeof GradeBadge>

export const Sahih: Story = {
  args: { grade: 'Sahih', size: 'md' },
}

export const Hasan: Story = {
  args: { grade: 'Hasan', size: 'md' },
}

export const HasanLiGhayrihi: Story = {
  args: { grade: 'Hasan li-ghayrihi', size: 'md' },
}

export const Daif: Story = {
  args: { grade: "Da'if", size: 'md' },
}

export const Mawdu: Story = {
  args: { grade: "Mawdu'", size: 'md' },
}

export const AllGrades: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2 p-4">
      {["Sahih", "Hasan", "Hasan li-ghayrihi", "Da'if", "Mawdu'", "Unknown"].map((g) => (
        <GradeBadge key={g} grade={g} />
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All grade types displayed together for design review.',
      },
    },
  },
}

export const SmallVariant: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2 p-4">
      {["Sahih", "Hasan", "Da'if"].map((g) => (
        <GradeBadge key={g} grade={g} size="sm" />
      ))}
    </div>
  ),
}
