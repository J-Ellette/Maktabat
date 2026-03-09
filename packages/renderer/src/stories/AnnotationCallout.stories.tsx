import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// TafsirAnnotation — Passage highlight callout
// Displays scholarly annotations (key rulings, ijaz markers, disputed points,
// linguistic notes, historical context) as colored callout boxes.
// ─────────────────────────────────────────────────────────────────────────────

type AnnotationType = 'key_ruling' | 'ijaz' | 'disputed' | 'linguistic_note' | 'historical_context'

interface AnnotationCalloutProps {
  type: AnnotationType
  label: string
  note: string
}

const ANNOTATION_CONFIG: Record<AnnotationType, { label: string; icon: string; colorClass: string }> = {
  key_ruling: {
    label: 'Key Ruling',
    icon: '⚖️',
    colorClass: 'bg-amber-50 border-amber-300 text-amber-800',
  },
  ijaz: {
    label: 'Linguistic Miracle',
    icon: '✨',
    colorClass: 'bg-emerald-50 border-emerald-300 text-emerald-800',
  },
  disputed: {
    label: 'Disputed Point',
    icon: '⚠️',
    colorClass: 'bg-orange-50 border-orange-300 text-orange-800',
  },
  linguistic_note: {
    label: 'Linguistic Note',
    icon: '📝',
    colorClass: 'bg-blue-50 border-blue-300 text-blue-800',
  },
  historical_context: {
    label: 'Historical Context',
    icon: '🕌',
    colorClass: 'bg-slate-50 border-slate-300 text-slate-700',
  },
}

function AnnotationCallout({ type, label, note }: AnnotationCalloutProps) {
  const config = ANNOTATION_CONFIG[type]
  return (
    <div className={`p-3 rounded-lg border text-sm ${config.colorClass}`}>
      <div className="flex items-center gap-1.5 font-semibold mb-1 text-xs uppercase tracking-wide">
        <span>{config.icon}</span>
        <span>{config.label}</span>
        {label && (
          <>
            <span className="opacity-40">·</span>
            <span className="normal-case tracking-normal">{label}</span>
          </>
        )}
      </div>
      <p className="leading-relaxed">{note}</p>
    </div>
  )
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof AnnotationCallout> = {
  title: 'Tafsir/AnnotationCallout',
  component: AnnotationCallout,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Scholarly annotation callout for tafsir passages. Displays key rulings (ahkam), ' +
          'linguistic miracles (ijaz), disputed points, linguistic notes, and historical context ' +
          'as color-coded blocks below the tafsir text.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['key_ruling', 'ijaz', 'disputed', 'linguistic_note', 'historical_context'],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 520 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof AnnotationCallout>

export const KeyRuling: Story = {
  args: {
    type: 'key_ruling',
    label: 'Basmalah Ruling',
    note: "Scholars differ on whether the Basmalah is a verse of Al-Fatiha or a separate verse; Imam al-Shafi'i held it is a verse, while Imam Malik did not.",
  },
}

export const LinguisticMiracle: Story = {
  args: {
    type: 'ijaz',
    label: 'Concise Praise',
    note: 'Ibn Kathir notes the miraculous brevity of this verse: all forms of praise are attributed to Allah without restriction.',
  },
}

export const DisputedPoint: Story = {
  args: {
    type: 'disputed',
    label: 'Names of Allah',
    note: 'Al-Razi and others discuss whether "al-Rahman" and "al-Rahim" are synonyms or have distinct meanings; the majority hold they differ in degree of mercy.',
  },
}

export const LinguisticNote: Story = {
  args: {
    type: 'linguistic_note',
    label: "Iyyaka \u2014 Fronting for Emphasis",
    note: "The object \"You alone\" is fronted before the verb \"we worship\" to express exclusivity \u2014 a classical Arabic rhetorical device (taqdim al-ma\u02bfmul).",
  },
}

export const HistoricalContext: Story = {
  args: {
    type: 'historical_context',
    label: 'The Three Paths',
    note: 'Ibn Kathir identifies "those blessed" as prophets and the righteous; "those who earned anger" as those who knew the truth but rejected it; "those who went astray" as those without knowledge.',
  },
}

export const AllTypes: Story = {
  render: () => (
    <div className="space-y-3 w-[520px]">
      <AnnotationCallout type="key_ruling" label="Fiqh Ruling" note="This verse establishes the obligation of reciting Al-Fatiha in every prayer rak'ah." />
      <AnnotationCallout type="ijaz" label="Rhetorical Miracle" note="The brevity and comprehensiveness of the opening surah is considered a hallmark of Quranic eloquence." />
      <AnnotationCallout type="disputed" label="Scholarly Dispute" note="Ibn Taymiyyah and al-Ash'ari differ on the exact interpretation of divine attributes in this verse." />
      <AnnotationCallout type="linguistic_note" label="Root Analysis" note="The root ر-ح-م carries the meaning of womb (rahim), symbolizing deep, encompassing mercy." />
      <AnnotationCallout type="historical_context" label="Revelation Context" note="This surah was among the first revealed in its complete form in Mecca, before the Hijra." />
    </div>
  ),
  parameters: {
    docs: {
      description: { story: 'All five annotation types displayed together for design review.' },
    },
  },
}
