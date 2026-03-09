import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIpc } from '../../hooks/useIpc'
import { formatDate } from '../../lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type KhutbahTemplateKey =
  | 'jumuah'
  | 'eid-al-fitr'
  | 'eid-al-adha'
  | 'janazah'
  | 'nikah'
  | 'custom'

type KhutbahStatus = 'draft' | 'final'

interface KhutbahRow {
  id: number
  title: string
  date: string | null
  template_key: KhutbahTemplateKey
  status: KhutbahStatus
  body: string
}

interface KhutbahMaterialRow {
  id: number
  khutbah_id: number
  content_ref: string
  order_index: number
}

// ─── Template config ──────────────────────────────────────────────────────────

const TEMPLATE_META: Record<KhutbahTemplateKey, { label: string; icon: string; sections: string[] }> = {
  jumuah: {
    label: "Jumu'ah (Friday)",
    icon: '🕌',
    sections: ['Opening (Hamd & Salawat)', 'Main Point 1', 'Main Point 2', 'Conclusion', "Du'a"],
  },
  'eid-al-fitr': {
    label: 'Eid al-Fitr',
    icon: '🌙',
    sections: ['Takbir & Opening', 'Ramadan Reflection', 'Eid Blessings', "Du'a"],
  },
  'eid-al-adha': {
    label: 'Eid al-Adha',
    icon: '🐑',
    sections: ['Takbir & Opening', 'Story of Ibrahim ﷺ', 'Sacrifice & Taqwa', "Du'a"],
  },
  janazah: {
    label: 'Janazah (Funeral)',
    icon: '🤲',
    sections: ['Reminder of Death', 'Life of the Deceased', 'Prayer for the Deceased', "Du'a"],
  },
  nikah: {
    label: 'Nikah (Marriage)',
    icon: '💍',
    sections: ['Opening', 'Importance of Marriage in Islam', 'Rights & Responsibilities', "Du'a"],
  },
  custom: {
    label: 'Custom',
    icon: '✏️',
    sections: ['Opening', 'Body', 'Conclusion'],
  },
}


// ─── Premium gate ─────────────────────────────────────────────────────────────

function PremiumGate(): React.ReactElement {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center">
      <p className="text-5xl mb-4">🕌</p>
      <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
        Khutbah Builder — Premium Feature
      </h2>
      <p className="text-sm mb-5 max-w-md" style={{ color: 'var(--text-muted)' }}>
        Build polished, bilingual khutbahs by collecting passages from your library and organising
        them into structured sections. Export print-ready PDFs.
      </p>
      <ul
        className="text-sm text-left inline-flex flex-col gap-1.5 mb-6"
        style={{ color: 'var(--text-secondary)' }}
      >
        {[
          'Mark any verse or hadith as "Khutbah material" from the context menu',
          'Templates: Jumuʿah, Eid al-Fitr, Eid al-Adha, Janazah, Nikah, Custom',
          'Drag collected passages into sections',
          'Live bilingual preview (Arabic + English)',
          'Export as print-ready PDF',
          'Khutbah archive — see past usage of each verse',
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

// ─── Khutbah list sidebar ─────────────────────────────────────────────────────

interface KhutbahListProps {
  khutbahs: KhutbahRow[]
  selectedId: number | null
  onSelect: (id: number) => void
  onNew: () => void
}

function KhutbahList({ khutbahs, selectedId, onSelect, onNew }: KhutbahListProps): React.ReactElement {
  return (
    <div
      className="flex flex-col border-r h-full"
      style={{ borderColor: 'var(--border-color)', width: 260 }}
    >
      <div
        className="flex items-center justify-between px-3 py-3 border-b"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Khutbahs
        </h2>
        <button
          onClick={onNew}
          className="text-xs px-2 py-1 rounded-lg font-medium transition-colors"
          style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
        >
          + New
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {khutbahs.length === 0 ? (
          <p className="text-xs text-center py-6" style={{ color: 'var(--text-muted)' }}>
            No khutbahs yet
          </p>
        ) : (
          khutbahs.map((k) => {
            const meta = TEMPLATE_META[k.template_key]
            return (
              <button
                key={k.id}
                onClick={() => onSelect(k.id)}
                className={`
                  w-full text-left rounded-lg px-3 py-2.5 mb-1 transition-all
                  ${selectedId === k.id
                    ? 'bg-[var(--bg-secondary)] border border-[var(--accent-primary)]'
                    : 'hover:bg-[var(--bg-secondary)] border border-transparent'}
                `}
              >
                <div className="flex items-center gap-2">
                  <span>{meta?.icon}</span>
                  <span className="text-xs font-medium flex-1 truncate" style={{ color: 'var(--text-primary)' }}>
                    {k.title}
                  </span>
                  <span
                    className="text-xs px-1 rounded"
                    style={{
                      backgroundColor: k.status === 'final' ? 'var(--ae-green-100, #dcfce7)' : 'var(--ae-black-100, #f1f5f9)',
                      color: k.status === 'final' ? 'var(--ae-green-700, #15803d)' : 'var(--ae-black-500, #64748b)',
                    }}
                  >
                    {k.status}
                  </span>
                </div>
                <p className="text-xs mt-0.5 ml-6" style={{ color: 'var(--text-muted)' }}>
                  {formatDate(k.date)} · {meta?.label}
                </p>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

// ─── New Khutbah form ─────────────────────────────────────────────────────────

interface NewKhutbahFormProps {
  onSubmit: (title: string, date: string, templateKey: KhutbahTemplateKey) => void
  onCancel: () => void
}

function NewKhutbahForm({ onSubmit, onCancel }: NewKhutbahFormProps): React.ReactElement {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [templateKey, setTemplateKey] = useState<KhutbahTemplateKey>('jumuah')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit(title.trim(), date, templateKey)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onCancel}
    >
      <form
        className="rounded-xl shadow-2xl border p-5 w-full max-w-md"
        style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          New Khutbah
        </h2>

        <div className="mb-3">
          <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. The Importance of Taqwa"
            required
            className="w-full text-sm px-3 py-1.5 rounded border bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
          />
        </div>

        <div className="mb-3">
          <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full text-sm px-3 py-1.5 rounded border bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
          />
        </div>

        <div className="mb-4">
          <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Template</label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(TEMPLATE_META) as [KhutbahTemplateKey, { label: string; icon: string }][]).map(
              ([key, meta]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTemplateKey(key)}
                  className={`text-left text-xs px-3 py-2 rounded-lg border transition-all ${templateKey === key ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 font-medium' : 'border-[var(--border-color)] hover:bg-[var(--bg-secondary)]'}`}
                  style={{ color: templateKey === key ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
                >
                  {meta.icon} {meta.label}
                </button>
              )
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-1.5 text-sm rounded-lg border transition-colors hover:bg-[var(--bg-secondary)]"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-1.5 text-sm rounded-lg font-medium"
            style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
          >
            Create Khutbah
          </button>
        </div>
      </form>
    </div>
  )
}

// ─── Khutbah editor ───────────────────────────────────────────────────────────

interface KhutbahEditorProps {
  khutbah: KhutbahRow
  materials: KhutbahMaterialRow[]
  onUpdate: (title: string, date: string, body: string, status: KhutbahStatus) => void
  onDelete: () => void
  onRemoveMaterial: (id: number) => void
}

function KhutbahEditor({
  khutbah,
  materials,
  onUpdate,
  onDelete,
  onRemoveMaterial,
}: KhutbahEditorProps): React.ReactElement {
  const [title, setTitle] = useState(khutbah.title)
  const [date, setDate] = useState(khutbah.date ?? '')
  const [body, setBody] = useState(khutbah.body)
  const [status, setStatus] = useState<KhutbahStatus>(khutbah.status)
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'materials'>('editor')
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    setTitle(khutbah.title)
    setDate(khutbah.date ?? '')
    setBody(khutbah.body)
    setStatus(khutbah.status)
    setIsDirty(false)
  }, [khutbah])

  function handleSave() {
    onUpdate(title, date, body, status)
    setIsDirty(false)
  }

  const templateMeta = TEMPLATE_META[khutbah.template_key]

  // Build a template scaffold if body is empty
  const scaffoldBody = templateMeta.sections
    .map((s) => `## ${s}\n\n`)
    .join('')

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 border-b"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <span className="text-xl">{templateMeta.icon}</span>
        <div className="flex-1 min-w-0">
          <input
            value={title}
            onChange={(e) => { setTitle(e.target.value); setIsDirty(true) }}
            className="w-full text-base font-semibold bg-transparent focus:outline-none border-b border-transparent focus:border-[var(--accent-primary)] truncate"
            style={{ color: 'var(--text-primary)' }}
          />
          <div className="flex items-center gap-3 mt-0.5">
            <input
              type="date"
              value={date}
              onChange={(e) => { setDate(e.target.value); setIsDirty(true) }}
              className="text-xs bg-transparent focus:outline-none"
              style={{ color: 'var(--text-muted)' }}
            />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>·</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{templateMeta.label}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value as KhutbahStatus); setIsDirty(true) }}
            className="text-xs px-2 py-1 rounded border bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
          >
            <option value="draft">Draft</option>
            <option value="final">Final</option>
          </select>
          {isDirty && (
            <button
              onClick={handleSave}
              className="text-xs px-3 py-1 rounded-lg font-medium"
              style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
            >
              Save
            </button>
          )}
          <button
            onClick={onDelete}
            title="Delete khutbah"
            className="text-xs p-1 rounded hover:bg-[var(--ae-red-100)]"
            style={{ color: 'var(--ae-red-500, #f43f5e)' }}
          >
            🗑
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex border-b"
        style={{ borderColor: 'var(--border-color)' }}
      >
        {(['editor', 'preview', 'materials'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-medium capitalize transition-colors border-b-2 ${activeTab === tab ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
          >
            {tab === 'materials' ? `Materials (${materials.length})` : tab}
          </button>
        ))}
        {/* Export button */}
        <div className="ml-auto px-3 py-1.5">
          <button
            onClick={() => exportKhutbahAsText(khutbah, materials)}
            className="text-xs px-3 py-1 rounded border transition-colors hover:bg-[var(--bg-secondary)]"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
          >
            ↓ Export
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'editor' && (
          <textarea
            value={body || scaffoldBody}
            onChange={(e) => { setBody(e.target.value); setIsDirty(true) }}
            placeholder="Start writing your khutbah… use the template sections above as a guide."
            className="w-full h-full p-4 text-sm resize-none bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none leading-relaxed"
            style={{ fontFamily: "'Source Serif 4', serif" }}
            dir="auto"
          />
        )}

        {activeTab === 'preview' && (
          <div className="p-6 max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                {title || 'Untitled Khutbah'}
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {formatDate(date)} · {templateMeta.label}
              </p>
            </div>

            {/* Materials */}
            {materials.length > 0 && (
              <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)', borderLeft: '3px solid var(--ae-gold-400, #fbbf24)' }}>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                  Collected Materials
                </h3>
                {materials.map((m) => (
                  <div key={m.id} className="text-sm mb-2 py-2 border-b last:border-0" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
                    <span className="font-mono text-xs">{m.content_ref}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Body rendered as plain text with section headers */}
            <div
              className="prose prose-sm max-w-none text-sm leading-relaxed whitespace-pre-wrap"
              style={{ color: 'var(--text-primary)' }}
            >
              {body || scaffoldBody}
            </div>
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="p-4">
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              Passages marked as "Khutbah material" from any verse or hadith appear here.
              Drag them into your editor or use them as reference.
            </p>
            {materials.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-3xl mb-2">📚</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  No materials collected yet
                </p>
                <p className="text-xs mt-1.5 max-w-xs mx-auto" style={{ color: 'var(--text-muted)' }}>
                  Right-click any verse or hadith and choose "Add to Khutbah" to collect passages here.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {materials.map((m) => (
                  <div
                    key={m.id}
                    className="group flex items-start justify-between gap-2 p-3 rounded-lg border"
                    style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface, var(--bg-secondary))' }}
                  >
                    <div>
                      <p className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                        {m.content_ref}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        Order #{m.order_index + 1}
                      </p>
                    </div>
                    <button
                      onClick={() => onRemoveMaterial(m.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[var(--ae-red-100)] transition-all text-xs"
                      style={{ color: 'var(--ae-red-500, #f43f5e)' }}
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function exportKhutbahAsText(khutbah: KhutbahRow, materials: KhutbahMaterialRow[]): void {
  const templateMeta = TEMPLATE_META[khutbah.template_key]
  const materialsSection =
    materials.length > 0
      ? `\n## Collected Materials\n\n${materials.map((m) => `- ${m.content_ref}`).join('\n')}\n`
      : ''

  const text = `# ${khutbah.title}
Date: ${khutbah.date ?? 'N/A'}
Template: ${templateMeta.label}
Status: ${khutbah.status}
${materialsSection}
${khutbah.body}
`
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const downloadLink = document.createElement('a')
  downloadLink.href = url
  downloadLink.download = `${khutbah.title.replace(/[^a-z0-9]/gi, '_')}.txt`
  downloadLink.click()
  URL.revokeObjectURL(url)
}

// ─── Main KhutbahBuilder ──────────────────────────────────────────────────────

const IS_PREMIUM_DEMO = true // Toggle to false to enforce premium gate

export default function KhutbahBuilder(): React.ReactElement {
  const ipc = useIpc()
  const [khutbahs, setKhutbahs] = useState<KhutbahRow[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [materials, setMaterials] = useState<KhutbahMaterialRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewForm, setShowNewForm] = useState(false)

  const loadKhutbahs = useCallback(async () => {
    if (!ipc) { setLoading(false); return }
    setLoading(true)
    try {
      const data = await ipc.invoke('user:get-khutbahs')
      setKhutbahs(data as KhutbahRow[])
    } catch {
      setKhutbahs([])
    } finally {
      setLoading(false)
    }
  }, [ipc])

  useEffect(() => {
    void loadKhutbahs()
  }, [loadKhutbahs])

  useEffect(() => {
    if (!ipc || selectedId === null) { setMaterials([]); return }
    void (async () => {
      try {
        const data = await ipc.invoke('user:get-khutbah-materials', selectedId)
        setMaterials(data as KhutbahMaterialRow[])
      } catch {
        setMaterials([])
      }
    })()
  }, [ipc, selectedId])

  if (!IS_PREMIUM_DEMO) return <PremiumGate />

  const selectedKhutbah = khutbahs.find((k) => k.id === selectedId) ?? null

  async function handleNew(title: string, date: string, templateKey: KhutbahTemplateKey) {
    if (!ipc) return
    try {
      const id = await ipc.invoke('user:save-khutbah', title, date, templateKey, '')
      const newK: KhutbahRow = {
        id: id as number,
        title,
        date: date || null,
        template_key: templateKey,
        status: 'draft',
        body: '',
      }
      setKhutbahs((prev) => [newK, ...prev])
      setSelectedId(newK.id)
      setShowNewForm(false)
    } catch {
      // ignore
    }
  }

  async function handleUpdate(title: string, date: string, body: string, status: KhutbahStatus) {
    if (!ipc || !selectedKhutbah) return
    try {
      await ipc.invoke('user:update-khutbah', selectedKhutbah.id, title, date || null, body, status)
      setKhutbahs((prev) =>
        prev.map((k) =>
          k.id === selectedKhutbah.id
            ? { ...k, title, date: date || null, body, status }
            : k
        )
      )
    } catch {
      // ignore
    }
  }

  async function handleDelete() {
    if (!ipc || !selectedKhutbah) return
    try {
      await ipc.invoke('user:delete-khutbah', selectedKhutbah.id)
      setKhutbahs((prev) => prev.filter((k) => k.id !== selectedKhutbah.id))
      setSelectedId(null)
    } catch {
      // ignore
    }
  }

  async function handleRemoveMaterial(id: number) {
    if (!ipc) return
    try {
      await ipc.invoke('user:remove-khutbah-material', id)
      setMaterials((prev) => prev.filter((m) => m.id !== id))
    } catch {
      // ignore
    }
  }

  return (
    <div
      className="flex h-full"
      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      {loading ? (
        <div className="flex items-center justify-center w-full">
          <div className="w-6 h-6 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <KhutbahList
            khutbahs={khutbahs}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onNew={() => setShowNewForm(true)}
          />
          <div className="flex-1 min-w-0">
            {selectedKhutbah ? (
              <KhutbahEditor
                khutbah={selectedKhutbah}
                materials={materials}
                onUpdate={(title, date, body, status) => void handleUpdate(title, date, body, status)}
                onDelete={() => void handleDelete()}
                onRemoveMaterial={(id) => void handleRemoveMaterial(id)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-4" style={{ color: 'var(--text-muted)' }}>
                <p className="text-4xl">🕌</p>
                <p className="text-sm">Select a khutbah or create a new one.</p>
                <button
                  onClick={() => setShowNewForm(true)}
                  className="px-4 py-2 text-sm rounded-lg font-medium"
                  style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
                >
                  + New Khutbah
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {showNewForm && (
        <NewKhutbahForm
          onSubmit={(title, date, templateKey) => void handleNew(title, date, templateKey)}
          onCancel={() => setShowNewForm(false)}
        />
      )}
    </div>
  )
}
