import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// ─── Types ────────────────────────────────────────────────────────────────────

type TemplateId =
  | 'verse-deep-dive'
  | 'topical-study'
  | 'character-study'
  | 'word-study'
  | 'comparative-madhab'
  | 'historical-event'
  | 'custom'

interface StudyTemplate {
  id: TemplateId
  name: string
  icon: string
  description: string
  steps: { label: string; panel: string; description: string }[]
}

// ─── Template definitions ─────────────────────────────────────────────────────

const TEMPLATES: StudyTemplate[] = [
  {
    id: 'verse-deep-dive',
    name: 'Verse Deep-Dive',
    icon: '📖',
    description:
      'Comprehensive study of a single Quranic verse — Arabic text, translations, tafsir, related hadith, fiqh rulings, and personal application.',
    steps: [
      {
        label: 'Arabic Text',
        panel: 'Quran',
        description: 'Read the verse in Arabic with word-by-word morphology.',
      },
      {
        label: 'Translations',
        panel: 'Quran',
        description: 'Compare up to 4 English translations side-by-side.',
      },
      {
        label: 'Tafsir Commentary',
        panel: 'Tafsir',
        description: 'Read classical commentary from Ibn Kathir, Tabari, or others.',
      },
      {
        label: 'Related Hadith',
        panel: 'Hadith',
        description: 'Find ahadith that explain or expand on this verse.',
      },
      {
        label: 'Fiqh Rulings',
        panel: 'Library',
        description: 'Note any legal rulings derived from this verse.',
      },
      {
        label: 'Application',
        panel: 'Notes',
        description: 'Write personal reflections and applications.',
      },
    ],
  },
  {
    id: 'topical-study',
    name: 'Topical Study',
    icon: '🗂️',
    description:
      'Research a topic across all resources — Quran verses, hadith, scholarly opinions, and fiqh rulings.',
    steps: [
      {
        label: 'Define the Topic',
        panel: 'Notes',
        description: 'Write a clear definition of the topic.',
      },
      { label: 'Quran Search', panel: 'Search', description: 'Find all relevant Quranic verses.' },
      { label: 'Hadith Search', panel: 'Search', description: 'Find relevant ahadith.' },
      { label: 'Scholarly Views', panel: 'Library', description: 'Survey scholarly commentary.' },
      {
        label: 'Summary',
        panel: 'Notes',
        description: 'Write a synthesised summary of the topic.',
      },
    ],
  },
  {
    id: 'character-study',
    name: 'Character Study',
    icon: '👤',
    description:
      'In-depth study of a Prophet or Companion — Quranic mentions, hadith, sirah, and character traits.',
    steps: [
      {
        label: 'Quran Mentions',
        panel: 'Search',
        description: 'Find all Quranic references to this person.',
      },
      {
        label: 'Hadith',
        panel: 'Search',
        description: 'Find hadith about or narrated by this person.',
      },
      { label: 'Sirah Context', panel: 'Library', description: 'Read the biographical account.' },
      {
        label: 'Key Lessons',
        panel: 'Notes',
        description: 'Document key character traits and lessons.',
      },
    ],
  },
  {
    id: 'word-study',
    name: 'Word Study',
    icon: '🔤',
    description:
      'Deep linguistic analysis of an Arabic word — root, morphology, conjugation, all Quran occurrences, and classical dictionary entries.',
    steps: [
      {
        label: 'Morphological Analysis',
        panel: 'Word Study',
        description: 'Analyze root, pattern, POS, and case.',
      },
      {
        label: 'Quran Occurrences',
        panel: 'Word Study',
        description: 'See all uses in the Quran.',
      },
      { label: 'Conjugation Table', panel: 'Conjugation', description: 'Study all verb forms.' },
      {
        label: 'Dictionary',
        panel: 'Word Study',
        description: 'Read classical dictionary definitions.',
      },
      { label: 'Notes', panel: 'Notes', description: 'Record insights about this word.' },
    ],
  },
  {
    id: 'comparative-madhab',
    name: 'Comparative Madhab',
    icon: '⚖️',
    description:
      'Compare the rulings of the four Sunni schools of jurisprudence on a specific issue.',
    steps: [
      {
        label: 'Define the Issue',
        panel: 'Notes',
        description: 'Clearly state the fiqh question.',
      },
      { label: 'Hanafi Position', panel: 'Library', description: 'Find the Hanafi ruling.' },
      { label: 'Maliki Position', panel: 'Library', description: 'Find the Maliki ruling.' },
      { label: "Shafi'i Position", panel: 'Library', description: "Find the Shafi'i ruling." },
      { label: 'Hanbali Position', panel: 'Library', description: 'Find the Hanbali ruling.' },
      { label: 'Analysis', panel: 'Notes', description: 'Compare and analyze the positions.' },
    ],
  },
  {
    id: 'historical-event',
    name: 'Historical Event',
    icon: '📜',
    description:
      'Study a significant Islamic historical event — Quran revelation context, hadith, sirah narrative, and scholarly analysis.',
    steps: [
      { label: 'Quranic Context', panel: 'Search', description: 'Find related Quranic verses.' },
      {
        label: 'Hadith Account',
        panel: 'Search',
        description: 'Find hadith describing the event.',
      },
      { label: 'Sirah Narrative', panel: 'Library', description: 'Read the sirah account.' },
      { label: 'Timeline', panel: 'Atlas', description: 'Locate on the Islamic atlas timeline.' },
      { label: 'Lessons', panel: 'Notes', description: 'Document lessons from the event.' },
    ],
  },
  {
    id: 'custom',
    name: 'Custom',
    icon: '✏️',
    description: 'Build your own study template with custom steps and panels.',
    steps: [
      { label: 'Step 1', panel: 'Notes', description: 'Define your first step.' },
      { label: 'Step 2', panel: 'Library', description: 'Define your second step.' },
      { label: 'Step 3', panel: 'Notes', description: 'Define your third step.' },
    ],
  },
]

// ─── Premium gate ─────────────────────────────────────────────────────────────

function PremiumGate(): React.ReactElement {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center">
      <p className="text-5xl mb-4">📋</p>
      <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
        Study Templates — Premium Feature
      </h2>
      <p className="text-sm mb-5 max-w-md" style={{ color: 'var(--text-muted)' }}>
        Pre-built study workflows that guide you through a structured, multi-resource study of any
        verse, topic, character, word, or jurisprudential question.
      </p>
      <ul
        className="text-sm text-left inline-flex flex-col gap-1.5 mb-6"
        style={{ color: 'var(--text-secondary)' }}
      >
        {[
          '7 template types: Verse Deep-Dive, Topical, Character, Word, Madhab, Historical, Custom',
          'Step-by-step guidance with linked panels',
          'Auto-populates linked resources from anchor verse/topic',
          'Save completed studies to your library',
          'Share studies with other scholars',
        ].map((f) => (
          <li key={f} className="flex items-start gap-2">
            <span style={{ color: 'var(--ae-green-600, #16a34a)' }}>✓</span>
            {f}
          </li>
        ))}
      </ul>
      <button
        onClick={() => void navigate('/settings/account')}
        className="px-5 py-2 text-sm font-semibold rounded-lg transition-colors"
        style={{ backgroundColor: 'var(--ae-gold-500, #f59e0b)', color: '#fff' }}
      >
        Upgrade to Premium
      </button>
    </div>
  )
}

// ─── TemplateCard ─────────────────────────────────────────────────────────────

function TemplateCard({
  template,
  onSelect,
}: {
  template: StudyTemplate
  onSelect: () => void
}): React.ReactElement {
  return (
    <button
      onClick={onSelect}
      className="
        group text-left rounded-xl border p-4 transition-all
        hover:shadow-md hover:border-[var(--accent-primary)]
      "
      style={{
        borderColor: 'var(--border-subtle)',
        backgroundColor: 'var(--bg-surface, var(--bg-secondary))',
      }}
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl">{template.icon}</span>
        <div>
          <h3
            className="text-sm font-semibold group-hover:text-[var(--accent-primary)] transition-colors"
            style={{ color: 'var(--text-primary)' }}
          >
            {template.name}
          </h3>
          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {template.description}
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {template.steps.slice(0, 4).map((s) => (
              <span
                key={s.label}
                className="text-xs px-1.5 py-0.5 rounded"
                style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
              >
                {s.label}
              </span>
            ))}
            {template.steps.length > 4 && (
              <span
                className="text-xs px-1.5 py-0.5 rounded"
                style={{ color: 'var(--text-muted)' }}
              >
                +{template.steps.length - 4} more
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

// ─── Template runner ──────────────────────────────────────────────────────────

interface TemplateRunnerProps {
  template: StudyTemplate
  onBack: () => void
}

function TemplateRunner({ template, onBack }: TemplateRunnerProps): React.ReactElement {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [anchorValue, setAnchorValue] = useState('')
  const [stepNotes, setStepNotes] = useState<Record<number, string>>({})
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const step = template.steps[currentStep]

  function handleComplete() {
    setCompletedSteps((prev) => new Set([...prev, currentStep]))
    if (currentStep < template.steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  function handleNavigateToPanel() {
    const panel = step.panel.toLowerCase()
    if (panel === 'quran')
      void navigate(anchorValue ? `/quran/${anchorValue.replace(':', '/')}` : '/quran')
    else if (panel === 'tafsir' && anchorValue) {
      const [s, a] = anchorValue.split(':')
      void navigate(`/tafsir/${s ?? '1'}/${a ?? '1'}`)
    } else if (panel === 'hadith') void navigate('/hadith')
    else if (panel === 'search') void navigate(`/search?q=${encodeURIComponent(anchorValue)}`)
    else if (panel === 'notes') void navigate('/notes')
    else if (panel === 'library') void navigate('/library')
    else if (panel === 'word study')
      void navigate(
        anchorValue ? `/word-study?word=${encodeURIComponent(anchorValue)}` : '/word-study'
      )
    else if (panel === 'conjugation') void navigate('/conjugation')
    else if (panel === 'atlas') void navigate('/atlas')
  }

  const progressPct = Math.round((completedSteps.size / template.steps.length) * 100)

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <button
          onClick={onBack}
          className="text-sm hover:text-[var(--accent-primary)] transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          ← Templates
        </button>
        <span style={{ color: 'var(--text-muted)' }}>·</span>
        <span className="text-sm font-semibold">
          {template.icon} {template.name}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-24 h-1.5 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progressPct}%`, backgroundColor: 'var(--ae-green-500, #22c55e)' }}
            />
          </div>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {completedSteps.size}/{template.steps.length}
          </span>
        </div>
      </div>

      {/* Anchor input */}
      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
          Anchor (verse reference, topic, word, etc.)
        </label>
        <input
          value={anchorValue}
          onChange={(e) => setAnchorValue(e.target.value)}
          placeholder="e.g. 2:255, Taqwa, Ibrahim, كتب"
          className="w-full text-sm px-3 py-1.5 rounded border bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
          dir="auto"
        />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Step list */}
        <div
          className="border-r py-3 overflow-y-auto"
          style={{ width: 200, borderColor: 'var(--border-color)' }}
        >
          {template.steps.map((s, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`
                w-full text-left px-3 py-2 flex items-center gap-2 transition-colors
                ${i === currentStep ? 'bg-[var(--bg-secondary)]' : 'hover:bg-[var(--bg-secondary)]'}
              `}
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                style={{
                  backgroundColor: completedSteps.has(i)
                    ? 'var(--ae-green-500, #22c55e)'
                    : i === currentStep
                      ? 'var(--accent-primary)'
                      : 'var(--bg-secondary)',
                  color: completedSteps.has(i) || i === currentStep ? '#fff' : 'var(--text-muted)',
                  border:
                    completedSteps.has(i) || i === currentStep
                      ? 'none'
                      : '1px solid var(--border-color)',
                }}
              >
                {completedSteps.has(i) ? '✓' : i + 1}
              </span>
              <span
                className="text-xs truncate"
                style={{
                  color:
                    i === currentStep
                      ? 'var(--text-primary)'
                      : completedSteps.has(i)
                        ? 'var(--ae-green-600, #16a34a)'
                        : 'var(--text-secondary)',
                  fontWeight: i === currentStep ? 500 : 400,
                }}
              >
                {s.label}
              </span>
            </button>
          ))}
        </div>

        {/* Step content */}
        <div className="flex-1 p-5 overflow-y-auto">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs px-2 py-0.5 rounded"
                style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
              >
                {step.panel}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Step {currentStep + 1} of {template.steps.length}
              </span>
            </div>
            <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              {step.label}
            </h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              {step.description}
            </p>

            <button
              onClick={handleNavigateToPanel}
              className="
                flex items-center gap-2 text-sm px-4 py-2 rounded-lg border mb-4
                hover:bg-[var(--bg-secondary)] transition-colors
              "
              style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}
            >
              Open {step.panel} ↗
            </button>

            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                Notes for this step
              </label>
              <textarea
                value={stepNotes[currentStep] ?? ''}
                onChange={(e) =>
                  setStepNotes((prev) => ({ ...prev, [currentStep]: e.target.value }))
                }
                placeholder="Write your findings for this step…"
                rows={6}
                className="w-full text-sm px-3 py-2 rounded border bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] resize-none"
                dir="auto"
              />
            </div>

            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleComplete}
                className="px-4 py-2 text-sm rounded-lg font-medium transition-colors"
                style={{ backgroundColor: 'var(--ae-green-600, #16a34a)', color: '#fff' }}
              >
                ✓ Mark Complete & Continue
              </button>
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-3 py-2 text-sm rounded-lg border transition-colors hover:bg-[var(--bg-secondary)]"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                >
                  ← Back
                </button>
              )}
            </div>

            {completedSteps.size === template.steps.length && (
              <div
                className="mt-6 p-4 rounded-lg border"
                style={{
                  borderColor: 'var(--ae-green-200, #bbf7d0)',
                  backgroundColor: 'var(--ae-green-50, #f0fdf4)',
                }}
              >
                <p
                  className="text-sm font-medium"
                  style={{ color: 'var(--ae-green-800, #166534)' }}
                >
                  🎉 Study complete!
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--ae-green-700, #15803d)' }}>
                  All steps completed. You can save your notes to the Notes panel.
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <button
                    onClick={() => void navigate('/notes')}
                    className="text-xs px-3 py-1 rounded-lg font-medium"
                    style={{ backgroundColor: 'var(--ae-green-600, #16a34a)', color: '#fff' }}
                  >
                    Go to Notes
                  </button>
                  <button
                    onClick={() => {
                      const data = {
                        template: { id: template.id, name: template.name },
                        anchor: anchorValue,
                        completedAt: new Date().toISOString(),
                        steps: template.steps.map((s, i) => ({
                          index: i,
                          label: s.label,
                          panel: s.panel,
                          notes: stepNotes[i] ?? '',
                          completed: completedSteps.has(i),
                        })),
                      }
                      const blob = new Blob([JSON.stringify(data, null, 2)], {
                        type: 'application/json',
                      })
                      const url = window.URL.createObjectURL(blob)
                      const downloadLink = document.createElement('a')
                      downloadLink.href = url
                      downloadLink.download = `${template.id}-${Date.now()}.mkt-study.json`
                      downloadLink.click()
                      window.URL.revokeObjectURL(url)
                    }}
                    className="text-xs px-3 py-1 rounded-lg font-medium border transition-colors hover:opacity-80"
                    style={{
                      borderColor: 'var(--ae-green-600, #16a34a)',
                      color: 'var(--ae-green-700, #15803d)',
                    }}
                  >
                    📥 Download Study
                  </button>
                  <button
                    onClick={() => {
                      const lines: string[] = [
                        `📖 Study: ${template.name}`,
                        anchorValue ? `Anchor: ${anchorValue}` : '',
                        `Completed: ${new Date().toLocaleString()}`,
                        '',
                        ...template.steps.map((s, i) =>
                          [
                            `Step ${i + 1}: ${s.label}`,
                            stepNotes[i] ? `Notes: ${stepNotes[i]}` : '',
                          ]
                            .filter(Boolean)
                            .join('\n')
                        ),
                      ]
                      void navigator.clipboard.writeText(lines.join('\n'))
                    }}
                    className="text-xs px-3 py-1 rounded-lg font-medium border transition-colors hover:opacity-80"
                    style={{
                      borderColor: 'var(--ae-green-600, #16a34a)',
                      color: 'var(--ae-green-700, #15803d)',
                    }}
                  >
                    📋 Copy to Clipboard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main StudyTemplates ──────────────────────────────────────────────────────

const IS_PREMIUM_DEMO = true // Toggle to false to enforce premium gate

export default function StudyTemplates(): React.ReactElement {
  const [selected, setSelected] = useState<StudyTemplate | null>(null)

  if (!IS_PREMIUM_DEMO) return <PremiumGate />

  if (selected) {
    return <TemplateRunner template={selected} onBack={() => setSelected(null)} />
  }

  return (
    <div
      className="flex flex-col h-full overflow-auto"
      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <h1 className="text-base font-semibold">Study Templates</h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Structured workflows to guide deep study of any topic, verse, word, or jurisprudential
          question.
        </p>
      </div>

      {/* Template grid */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 gap-3 max-w-3xl">
          {TEMPLATES.map((t) => (
            <TemplateCard key={t.id} template={t} onSelect={() => setSelected(t)} />
          ))}
        </div>
      </div>
    </div>
  )
}
