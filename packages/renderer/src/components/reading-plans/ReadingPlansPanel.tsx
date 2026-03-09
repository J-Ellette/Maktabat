import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIpc } from '../../hooks/useIpc'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReadingPlanRow {
  id: number
  plan_key: string
  start_date: string
  target_date: string
  progress_data: string
  created_at: string
}

interface ProgressData {
  completedDays: Record<string, boolean>
  streak: number
  lastCompletedDate: string | null
}

// ─── Built-in plan definitions ─────────────────────────────────────────────────

interface DayAssignment {
  label: string
  route?: string
}

interface PlanDefinition {
  key: string
  name: string
  description: string
  icon: string
  totalDays: number
  category: 'quran' | 'hadith' | 'custom'
  getDayAssignment: (day: number) => DayAssignment
}

// Quran 30-day plan: one juz per day
function getQuran30DayAssignment(day: number): DayAssignment {
  const juz = ((day - 1) % 30) + 1
  return {
    label: `Juz' ${juz}`,
    route: `/quran/${juzStartSurah(juz)}`,
  }
}

// Rough mapping of juz to starting surah
function juzStartSurah(juz: number): number {
  const starts = [
    1, 2, 2, 3, 4, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 18, 21, 23, 25, 27, 29, 33, 36, 39, 41, 46, 51,
    58, 67, 78,
  ]
  return starts[juz - 1] ?? 1
}

function getQuran60DayAssignment(day: number): DayAssignment {
  // 2 days per juz
  const juz = Math.ceil(day / 2)
  const half = day % 2 === 1 ? 'first half' : 'second half'
  return {
    label: `Juz' ${juz} (${half})`,
    route: `/quran/${juzStartSurah(juz)}`,
  }
}

function getQuran1YearAssignment(day: number): DayAssignment {
  // ~1.6 pages/day; we'll just say which surah group each week targets
  const weekNum = Math.ceil(day / 7)
  return {
    label: `Week ${weekNum} — ${Math.ceil(day / 52)} pages today`,
    route: `/quran/1`,
  }
}

function get40HadithAssignment(day: number): DayAssignment {
  return {
    label: `Hadith ${day} of Al-Nawawi's 40`,
    route: `/hadith/nawawi/${day}`,
  }
}

function getRiyadhAssignment(day: number): DayAssignment {
  const chapter = Math.ceil(day / 2)
  return {
    label: `Riyadh al-Salihin — Chapter ${chapter}`,
    route: `/hadith/riyadh/${day}`,
  }
}

const BUILT_IN_PLANS: PlanDefinition[] = [
  {
    key: 'quran-30',
    name: 'Quran in 30 Days',
    description: 'Complete the entire Quran in one month — one juz per day.',
    icon: '📖',
    totalDays: 30,
    category: 'quran',
    getDayAssignment: getQuran30DayAssignment,
  },
  {
    key: 'quran-60',
    name: 'Quran in 60 Days',
    description: 'Complete the Quran in two months — half a juz per day.',
    icon: '📗',
    totalDays: 60,
    category: 'quran',
    getDayAssignment: getQuran60DayAssignment,
  },
  {
    key: 'quran-365',
    name: 'Quran in 1 Year',
    description: 'A relaxed year-long journey through the entire Quran.',
    icon: '🗓️',
    totalDays: 365,
    category: 'quran',
    getDayAssignment: getQuran1YearAssignment,
  },
  {
    key: 'nawawi-40',
    name: "Al-Nawawi's 40 Hadith",
    description: 'One hadith each day for 40 days — the foundational collection.',
    icon: '📜',
    totalDays: 40,
    category: 'hadith',
    getDayAssignment: get40HadithAssignment,
  },
  {
    key: 'riyadh-365',
    name: 'Riyadh al-Salihin (1 Year)',
    description: 'Read through the Garden of the Righteous over one year.',
    icon: '🌿',
    totalDays: 365,
    category: 'hadith',
    getDayAssignment: getRiyadhAssignment,
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function today(): string {
  return new Date().toISOString().split('T')[0] ?? ''
}

function addDays(dateStr: string, days: number): string {
  const dateObj = new Date(dateStr)
  dateObj.setDate(dateObj.getDate() + days)
  return dateObj.toISOString().split('T')[0] ?? ''
}

function daysBetween(start: string, end: string): number {
  const startDateObj = new Date(start)
  const endDateObj = new Date(end)
  return Math.max(0, Math.round((endDateObj.getTime() - startDateObj.getTime()) / 86_400_000))
}

function parseProgress(raw: string): ProgressData {
  try {
    const parsed = JSON.parse(raw) as Partial<ProgressData>
    return {
      completedDays: parsed.completedDays ?? {},
      streak: parsed.streak ?? 0,
      lastCompletedDate: parsed.lastCompletedDate ?? null,
    }
  } catch {
    return { completedDays: {}, streak: 0, lastCompletedDate: null }
  }
}

function computeStreak(completedDays: Record<string, boolean>): number {
  let streak = 0
  let current = today()
  // Walk backwards from today
  for (let i = 0; i < 3650; i++) {
    if (completedDays[current]) {
      streak++
      current = addDays(current, -1)
    } else {
      break
    }
  }
  return streak
}

function daysCompleted(completedDays: Record<string, boolean>): number {
  return Object.values(completedDays).filter(Boolean).length
}

function currentDayNumber(startDate: string): number {
  return Math.max(1, daysBetween(startDate, today()) + 1)
}

// ─── Progress Ring ────────────────────────────────────────────────────────────

function ProgressRing({
  percent,
  size = 80,
  strokeWidth = 6,
  color = 'var(--accent-primary)',
}: {
  percent: number
  size?: number
  strokeWidth?: number
  color?: string
}) {
  const ringRadius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * ringRadius
  const offset = circumference - (percent / 100) * circumference

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={ringRadius}
        fill="none"
        stroke="var(--border-color)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={ringRadius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
    </svg>
  )
}

// ─── Plan Card ────────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  row,
  onSelect,
  onStart,
}: {
  plan: PlanDefinition
  row: ReadingPlanRow | null
  onSelect: () => void
  onStart: (planKey: string) => void
}) {
  const progress = row ? parseProgress(row.progress_data) : null
  const completed = progress ? daysCompleted(progress.completedDays) : 0
  const percent = progress ? Math.round((completed / plan.totalDays) * 100) : 0
  const streak = progress ? computeStreak(progress.completedDays) : 0
  const isActive = row !== null

  return (
    <div
      className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-5 flex flex-col gap-3 cursor-pointer hover:border-[var(--accent-primary)] transition-colors"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{plan.icon}</span>
          <div>
            <h3 className="font-latin-display font-semibold text-[var(--text-primary)]">
              {plan.name}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">{plan.description}</p>
          </div>
        </div>
        {isActive && (
          <div className="relative flex-shrink-0">
            <ProgressRing percent={percent} />
            <div className="absolute inset-0 flex items-center justify-center rotate-90">
              <span className="text-xs font-bold text-[var(--accent-primary)]">{percent}%</span>
            </div>
          </div>
        )}
      </div>

      {row && progress ? (
        <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
          <span>
            📅 Day {currentDayNumber(row.start_date)} of {plan.totalDays}
          </span>
          <span>✅ {completed} completed</span>
          {streak > 0 && (
            <span className="text-orange-500 font-semibold">🔥 {streak}-day streak</span>
          )}
        </div>
      ) : (
        <button
          className="mt-1 px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity self-start"
          onClick={(e) => {
            e.stopPropagation()
            onStart(plan.key)
          }}
        >
          Start Plan
        </button>
      )}
    </div>
  )
}

// ─── Active Plan Detail ───────────────────────────────────────────────────────

function ActivePlanDetail({
  plan,
  row,
  onMarkDay,
  onDelete,
  onBack,
}: {
  plan: PlanDefinition
  row: ReadingPlanRow
  onMarkDay: (planKey: string, dayKey: string, done: boolean) => void
  onDelete: (planKey: string) => void
  onBack: () => void
}) {
  const navigate = useNavigate()
  const progress = parseProgress(row.progress_data)
  const streak = computeStreak(progress.completedDays)
  const completed = daysCompleted(progress.completedDays)
  const percent = Math.round((completed / plan.totalDays) * 100)
  const dayNum = currentDayNumber(row.start_date)
  const todayKey = today()
  const todayDone = progress.completedDays[todayKey] === true
  const assignment = plan.getDayAssignment(dayNum)

  function handleExportCert() {
    const isComplete = percent >= 100
    const lines = [
      `CERTIFICATE OF COMPLETION`,
      ``,
      `This certifies that the plan`,
      `"${plan.name}"`,
      `has been ${isComplete ? 'completed' : `${percent}% completed`}.`,
      ``,
      `Started: ${row.start_date}`,
      `Target: ${row.target_date}`,
      `Days completed: ${completed} of ${plan.totalDays}`,
      `Streak: ${streak} days`,
      ``,
      isComplete
        ? `Alhamdulillah — may Allah accept this effort. آمين`
        : `Keep going — every step counts!`,
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const downloadLink = document.createElement('a')
    downloadLink.href = url
    downloadLink.download = `${plan.key}-progress.txt`
    downloadLink.click()
    URL.revokeObjectURL(url)
  }

  // Build last 14 days calendar
  const calendarDays: { dateKey: string; label: string; done: boolean; isFuture: boolean }[] = []
  for (let i = -13; i <= 0; i++) {
    const dk = addDays(todayKey, i)
    const dateObj = new Date(dk)
    calendarDays.push({
      dateKey: dk,
      label: dateObj.getDate().toString(),
      done: progress.completedDays[dk] === true,
      isFuture: false,
    })
  }

  return (
    <div className="flex flex-col gap-5 p-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-[var(--accent-primary)] hover:underline text-sm flex items-center gap-1"
        >
          ← Back
        </button>
        <span className="text-[var(--text-secondary)]">/</span>
        <h2 className="font-latin-display text-lg font-semibold text-[var(--text-primary)]">
          {plan.icon} {plan.name}
        </h2>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-6 flex-wrap">
        <div className="relative">
          <ProgressRing percent={percent} size={96} strokeWidth={8} />
          <div className="absolute inset-0 flex flex-col items-center justify-center rotate-90">
            <span className="text-lg font-bold text-[var(--accent-primary)]">{percent}%</span>
            <span className="text-xs text-[var(--text-secondary)]">done</span>
          </div>
        </div>
        <div className="flex flex-col gap-1 text-sm text-[var(--text-secondary)]">
          <span>
            📅 Day <strong className="text-[var(--text-primary)]">{dayNum}</strong> of{' '}
            <strong>{plan.totalDays}</strong>
          </span>
          <span>
            ✅ <strong className="text-[var(--text-primary)]">{completed}</strong> days completed
          </span>
          {streak > 0 && (
            <span className="text-orange-500 font-semibold">🔥 {streak}-day streak</span>
          )}
          <span>🗓️ Started {row.start_date}</span>
          <span>🎯 Target {row.target_date}</span>
        </div>
      </div>

      {/* Today's assignment */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-4 flex flex-col gap-3">
        <h3 className="font-latin-display font-semibold text-[var(--text-primary)]">
          Today's Reading — {assignment.label}
        </h3>
        <div className="flex gap-3 flex-wrap">
          {assignment.route && (
            <button
              className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
              onClick={() => void navigate(assignment.route!)}
            >
              Open in Reader →
            </button>
          )}
          <button
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              todayDone
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--accent-primary)] hover:text-white'
            }`}
            onClick={() => onMarkDay(plan.key, todayKey, !todayDone)}
          >
            {todayDone ? '✅ Marked Complete' : '⬜ Mark as Complete'}
          </button>
        </div>
      </div>

      {/* 14-day calendar strip */}
      <div>
        <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-2">Last 14 days</h4>
        <div className="flex gap-1 flex-wrap">
          {calendarDays.map((cd) => (
            <button
              key={cd.dateKey}
              title={cd.dateKey}
              className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                cd.done
                  ? 'bg-green-500 text-white'
                  : cd.dateKey === todayKey
                    ? 'border-2 border-[var(--accent-primary)] text-[var(--accent-primary)]'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
              }`}
              onClick={() => onMarkDay(plan.key, cd.dateKey, !cd.done)}
            >
              {cd.label}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        <button
          className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-colors"
          onClick={handleExportCert}
        >
          📄 Export Progress Certificate
        </button>
        <button
          className="px-4 py-2 bg-[var(--bg-secondary)] border border-red-400 rounded-lg text-sm text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
          onClick={() => {
            if (window.confirm(`Remove the "${plan.name}" plan? Your progress will be lost.`)) {
              onDelete(plan.key)
            }
          }}
        >
          🗑️ Remove Plan
        </button>
      </div>
    </div>
  )
}

// ─── Custom Plan Builder ──────────────────────────────────────────────────────

function CustomPlanBuilder({
  onSave,
  onCancel,
}: {
  onSave: (key: string, name: string, days: number, startDate: string) => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [days, setDays] = useState(30)
  const [startDate, setStartDate] = useState(today())

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || days < 1) return
    const key = `custom-${Date.now()}`
    onSave(key, name.trim(), days, startDate)
  }

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-5 max-w-md">
      <h3 className="font-latin-display font-semibold text-[var(--text-primary)] mb-4">
        🛠️ Custom Plan Builder
      </h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">Plan Name</label>
          <input
            className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
            placeholder="My Custom Reading Plan"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={80}
          />
        </div>
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">
            Total Days: {days}
          </label>
          <input
            type="range"
            min={1}
            max={365}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-full accent-[var(--accent-primary)]"
          />
          <div className="flex justify-between text-xs text-[var(--text-secondary)] mt-1">
            <span>1 day</span>
            <span>365 days</span>
          </div>
        </div>
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">Start Date</label>
          <input
            type="date"
            className="px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Create Plan
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-lg text-sm hover:bg-[var(--border-color)] transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ReadingPlansPanel(): React.ReactElement {
  const ipc = useIpc()
  const [planRows, setPlanRows] = useState<ReadingPlanRow[]>([])
  const [selectedPlanKey, setSelectedPlanKey] = useState<string | null>(null)
  const [showCustomBuilder, setShowCustomBuilder] = useState(false)
  const [customPlans, setCustomPlans] = useState<PlanDefinition[]>([])

  // Combine built-in + custom plans
  const allPlans: PlanDefinition[] = [...BUILT_IN_PLANS, ...customPlans]

  const loadPlans = useCallback(async () => {
    if (!ipc) return
    try {
      const rows = (await ipc.invoke('user:get-all-reading-plans')) as ReadingPlanRow[]
      setPlanRows(rows ?? [])
      // Reconstruct custom plans from DB rows that don't match built-in keys
      const builtInKeys = new Set(BUILT_IN_PLANS.map((p) => p.key))
      const customRows = rows.filter((r) => !builtInKeys.has(r.plan_key))
      setCustomPlans(
        customRows.map((r) => {
          // Extract user-provided name from progress_data metadata
          let customName = 'Custom Plan'
          try {
            const rawPd = JSON.parse(r.progress_data) as Record<string, unknown>
            if (typeof rawPd.planName === 'string' && rawPd.planName.trim()) {
              customName = rawPd.planName.trim()
            }
          } catch {
            /* ignore */
          }
          const total = daysBetween(r.start_date, r.target_date) + 1
          return {
            key: r.plan_key,
            name: customName,
            description: `${total}-day custom reading plan`,
            icon: '📋',
            totalDays: Math.max(1, total),
            category: 'custom' as const,
            getDayAssignment: (day: number) => ({ label: `Day ${day}` }),
          }
        })
      )
    } catch {
      // DB not available in dev; silently ignore
    }
  }, [ipc])

  useEffect(() => {
    void loadPlans()
  }, [loadPlans])

  function getRowForPlan(planKey: string): ReadingPlanRow | null {
    return planRows.find((r) => r.plan_key === planKey) ?? null
  }

  async function handleStartPlan(planKey: string) {
    if (!ipc) return
    const plan = allPlans.find((p) => p.key === planKey)
    if (!plan) return
    const start = today()
    const target = addDays(start, plan.totalDays - 1)
    const initProgress: ProgressData = {
      completedDays: {},
      streak: 0,
      lastCompletedDate: null,
    }
    await ipc.invoke('user:save-reading-plan', planKey, start, target, initProgress)
    await loadPlans()
    setSelectedPlanKey(planKey)
  }

  async function handleMarkDay(planKey: string, dayKey: string, done: boolean) {
    if (!ipc) return
    const row = getRowForPlan(planKey)
    if (!row) return
    const progress = parseProgress(row.progress_data)
    progress.completedDays[dayKey] = done
    progress.streak = computeStreak(progress.completedDays)
    progress.lastCompletedDate = done ? dayKey : progress.lastCompletedDate
    await ipc.invoke('user:update-reading-plan-progress', planKey, progress)
    await loadPlans()
  }

  async function handleDeletePlan(planKey: string) {
    if (!ipc) return
    await ipc.invoke('user:delete-reading-plan', planKey)
    setSelectedPlanKey(null)
    await loadPlans()
  }

  async function handleCreateCustom(key: string, name: string, days: number, startDate: string) {
    if (!ipc) return
    const target = addDays(startDate, days - 1)
    const initProgress: ProgressData = {
      completedDays: {},
      streak: 0,
      lastCompletedDate: null,
    }
    // Store name in progress_data metadata
    await ipc.invoke('user:save-reading-plan', key, startDate, target, {
      ...initProgress,
      planName: name,
    })
    setShowCustomBuilder(false)
    await loadPlans()
    setSelectedPlanKey(key)
  }

  // Derive the active plans and available plans from planRows
  const activePlanKeys = new Set(planRows.map((r) => r.plan_key))
  const selectedPlan = selectedPlanKey ? allPlans.find((p) => p.key === selectedPlanKey) : null
  const selectedRow = selectedPlanKey ? getRowForPlan(selectedPlanKey) : null

  if (selectedPlan && selectedRow) {
    return (
      <div className="flex-1 overflow-auto">
        <ActivePlanDetail
          plan={selectedPlan}
          row={selectedRow}
          onMarkDay={(pk, dk, done) => void handleMarkDay(pk, dk, done)}
          onDelete={(pk) => void handleDeletePlan(pk)}
          onBack={() => setSelectedPlanKey(null)}
        />
      </div>
    )
  }

  // Overall stats
  const totalActive = activePlanKeys.size
  const totalStreak = planRows.reduce((max, r) => {
    const planProgress = parseProgress(r.progress_data)
    return Math.max(max, computeStreak(planProgress.completedDays))
  }, 0)

  return (
    <div className="flex-1 overflow-auto p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-latin-display text-2xl font-bold text-[var(--text-primary)]">
            📚 Reading Plans
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Build consistent habits through structured daily reading.
          </p>
        </div>
        {totalActive > 0 && (
          <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
            <span>
              📋 <strong className="text-[var(--text-primary)]">{totalActive}</strong> active plan
              {totalActive !== 1 ? 's' : ''}
            </span>
            {totalStreak > 0 && (
              <span className="text-orange-500 font-semibold">
                🔥 Best streak: {totalStreak} days
              </span>
            )}
          </div>
        )}
      </div>

      {/* Active plans section */}
      {totalActive > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
            Active Plans
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allPlans
              .filter((p) => activePlanKeys.has(p.key))
              .map((plan) => (
                <PlanCard
                  key={plan.key}
                  plan={plan}
                  row={getRowForPlan(plan.key)}
                  onSelect={() => setSelectedPlanKey(plan.key)}
                  onStart={(pk) => void handleStartPlan(pk)}
                />
              ))}
          </div>
        </section>
      )}

      {/* Available plans section */}
      {allPlans.some((p) => !activePlanKeys.has(p.key)) && (
        <section>
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
            {totalActive > 0 ? 'Add Another Plan' : 'Choose a Plan to Begin'}
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allPlans
              .filter((p) => !activePlanKeys.has(p.key))
              .map((plan) => (
                <PlanCard
                  key={plan.key}
                  plan={plan}
                  row={null}
                  onSelect={() => void handleStartPlan(plan.key)}
                  onStart={(pk) => void handleStartPlan(pk)}
                />
              ))}
          </div>
        </section>
      )}

      {/* Custom plan builder */}
      {showCustomBuilder ? (
        <CustomPlanBuilder
          onSave={(key, name, days, start) => void handleCreateCustom(key, name, days, start)}
          onCancel={() => setShowCustomBuilder(false)}
        />
      ) : (
        <button
          className="self-start px-4 py-2 bg-[var(--bg-secondary)] border border-dashed border-[var(--accent-primary)] rounded-xl text-sm text-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-white transition-colors"
          onClick={() => setShowCustomBuilder(true)}
        >
          + Create Custom Plan
        </button>
      )}
    </div>
  )
}
