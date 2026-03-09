import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useIpc } from '../../hooks/useIpc'

// ─── Types ────────────────────────────────────────────────────────────────────

type NoteType = 'study' | 'question' | 'reflection' | 'khutbah' | 'application'

interface NoteRow {
  id: number
  resource_key: string
  content_ref: string
  type: NoteType
  body: string
  tags: string // JSON array
  created_at: string
  updated_at: string
}

// ─── Note type meta ───────────────────────────────────────────────────────────

const NOTE_TYPE_META: Record<NoteType, { label: string; icon: string; color: string }> = {
  study: { label: 'Study', icon: '📖', color: 'var(--tech-blue-500, #3b82f6)' },
  question: { label: 'Question', icon: '❓', color: 'var(--desert-orange-500, #f97316)' },
  reflection: { label: 'Reflection', icon: '💭', color: 'var(--fuchsia-500, #d946ef)' },
  khutbah: { label: 'Khutbah', icon: '🕌', color: 'var(--ae-gold-600, #d97706)' },
  application: { label: 'Application', icon: '✅', color: 'var(--ae-green-600, #16a34a)' },
}

function parseTags(tagsJson: string): string[] {
  try {
    return JSON.parse(tagsJson) as string[]
  } catch {
    return []
  }
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function exportNotesAsMarkdown(notes: NoteRow[]): void {
  const lines = notes.map((n) => {
    const tags = parseTags(n.tags)
    const tagsLine = tags.length ? `Tags: ${tags.join(', ')}\n` : ''
    return `# ${NOTE_TYPE_META[n.type]?.icon ?? ''} ${n.type.charAt(0).toUpperCase() + n.type.slice(1)} — ${n.resource_key} (${n.content_ref})

${tagsLine}${n.body}

---
`
  })
  const blob = new Blob([`# Maktabat Notes Export\n\n${lines.join('\n')}`], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'maktabat-notes.md'
  a.click()
  URL.revokeObjectURL(url)
}

// ─── NoteCard ─────────────────────────────────────────────────────────────────

function NoteCard({
  note,
  isSelected,
  onSelect,
}: {
  note: NoteRow
  isSelected: boolean
  onSelect: () => void
}): React.ReactElement {
  const typeMeta = NOTE_TYPE_META[note.type]
  const tags = parseTags(note.tags)

  return (
    <button
      onClick={onSelect}
      className={`
        w-full text-left rounded-lg border px-3 py-2.5 transition-all
        ${isSelected
          ? 'border-[var(--accent-primary)] bg-[var(--bg-secondary)] shadow-sm'
          : 'border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)] hover:border-[var(--border-color)]'}
      `}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm">{typeMeta?.icon}</span>
        <span
          className="text-xs font-medium"
          style={{ color: typeMeta?.color ?? 'var(--text-primary)' }}
        >
          {typeMeta?.label}
        </span>
        <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
          {formatDate(note.updated_at)}
        </span>
      </div>
      <p
        className="text-xs font-medium truncate mb-0.5"
        style={{ color: 'var(--text-secondary)' }}
      >
        {note.resource_key} — {note.content_ref}
      </p>
      <p className="text-sm line-clamp-2" style={{ color: 'var(--text-primary)' }}>
        {note.body}
      </p>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-1.5 py-0.5 rounded-full"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--fuchsia-600, #c026d3)',
                border: '1px solid var(--fuchsia-200, #f5d0fe)',
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </button>
  )
}

// ─── NoteEditor ───────────────────────────────────────────────────────────────

interface NoteEditorProps {
  note: NoteRow | null
  onSave: (body: string, tags: string[], type: NoteType) => void
  onDelete: () => void
  onNew: () => void
}

function NoteEditor({ note, onSave, onDelete, onNew }: NoteEditorProps): React.ReactElement {
  const [body, setBody] = useState(note?.body ?? '')
  const [type, setType] = useState<NoteType>(note?.type ?? 'study')
  const [tagsInput, setTagsInput] = useState(parseTags(note?.tags ?? '[]').join(', '))
  const [isDirty, setIsDirty] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setBody(note?.body ?? '')
    setType(note?.type ?? 'study')
    setTagsInput(parseTags(note?.tags ?? '[]').join(', '))
    setIsDirty(false)
  }, [note])

  function handleBodyChange(v: string) {
    setBody(v)
    setIsDirty(true)
  }

  function handleSave() {
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    onSave(body, tags, type)
    setIsDirty(false)
  }

  if (!note) {
    return (
      <div
        className="flex flex-col items-center justify-center h-full gap-4"
        style={{ color: 'var(--text-muted)' }}
      >
        <p className="text-4xl">📝</p>
        <p className="text-sm">Select a note to edit, or create a new one.</p>
        <button
          onClick={onNew}
          className="px-4 py-2 text-sm rounded-lg font-medium transition-colors"
          style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
        >
          + New Note
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div
        className="flex items-center gap-2 px-4 py-2 border-b flex-wrap"
        style={{ borderColor: 'var(--border-color)' }}
      >
        {/* Type selector */}
        <select
          value={type}
          onChange={(e) => { setType(e.target.value as NoteType); setIsDirty(true) }}
          className="
            text-xs rounded border px-2 py-1
            bg-[var(--bg-secondary)] border-[var(--border-color)]
            text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]
          "
        >
          {(Object.entries(NOTE_TYPE_META) as [NoteType, { label: string; icon: string }][]).map(
            ([key, meta]) => (
              <option key={key} value={key}>
                {meta.icon} {meta.label}
              </option>
            )
          )}
        </select>

        <div className="flex-1" />

        {isDirty && (
          <button
            onClick={handleSave}
            className="text-xs px-3 py-1 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
          >
            Save
          </button>
        )}
        <button
          onClick={onDelete}
          className="text-xs px-2 py-1 rounded-lg transition-colors hover:bg-[var(--ae-red-100)]"
          style={{ color: 'var(--ae-red-500, #f43f5e)' }}
          title="Delete note"
        >
          🗑
        </button>
      </div>

      {/* Source info */}
      <div
        className="px-4 py-2 text-xs border-b"
        style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
      >
        <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>
          {note.resource_key}
        </span>{' '}
        — {note.content_ref}
        <span className="ml-2">· Updated {formatDate(note.updated_at)}</span>
      </div>

      {/* Body editor (Markdown textarea) */}
      <textarea
        ref={textareaRef}
        value={body}
        onChange={(e) => handleBodyChange(e.target.value)}
        placeholder="Write your note here… Markdown is supported."
        className="
          flex-1 w-full p-4 text-sm resize-none
          bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)]
          focus:outline-none font-mono leading-relaxed
        "
        style={{ fontFamily: "'Source Serif 4', 'Georgia', serif" }}
        dir="auto"
      />

      {/* Tags row */}
      <div
        className="flex items-center gap-2 px-4 py-2 border-t"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Tags:
        </span>
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => { setTagsInput(e.target.value); setIsDirty(true) }}
          placeholder="study, quran, fiqh (comma-separated)"
          className="
            flex-1 text-xs bg-transparent
            text-[var(--text-primary)] placeholder-[var(--text-muted)]
            focus:outline-none border-b border-transparent focus:border-[var(--accent-primary)]
          "
        />
        {isDirty && (
          <button
            onClick={handleSave}
            className="text-xs px-2 py-0.5 rounded font-medium transition-colors"
            style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
          >
            Save
          </button>
        )}
      </div>
    </div>
  )
}

// ─── New Note Modal ───────────────────────────────────────────────────────────

interface NewNoteFormProps {
  onSubmit: (resourceKey: string, contentRef: string, type: NoteType, body: string, tags: string[]) => void
  onCancel: () => void
}

function NewNoteForm({ onSubmit, onCancel }: NewNoteFormProps): React.ReactElement {
  const [resourceKey, setResourceKey] = useState('notes:free')
  const [contentRef, setContentRef] = useState('general')
  const [noteType, setNoteType] = useState<NoteType>('study')
  const [body, setBody] = useState('')
  const [tagsInput, setTagsInput] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
    onSubmit(resourceKey || 'notes:free', contentRef || 'general', noteType, body, tags)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onCancel}
    >
      <form
        className="rounded-xl shadow-2xl border p-5 w-full max-w-lg"
        style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          New Note
        </h2>

        <div className="flex gap-3 mb-3">
          <div className="flex-1">
            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
              Resource
            </label>
            <input
              value={resourceKey}
              onChange={(e) => setResourceKey(e.target.value)}
              placeholder="e.g. quran:2, hadith:bukhari"
              className="w-full text-sm px-3 py-1.5 rounded border bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
              Reference
            </label>
            <input
              value={contentRef}
              onChange={(e) => setContentRef(e.target.value)}
              placeholder="e.g. 2:255, Hadith #1"
              className="w-full text-sm px-3 py-1.5 rounded border bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
            Note type
          </label>
          <div className="flex gap-2 flex-wrap">
            {(Object.entries(NOTE_TYPE_META) as [NoteType, { label: string; icon: string; color: string }][]).map(
              ([key, meta]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setNoteType(key)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${noteType === key ? 'font-medium' : 'opacity-70'}`}
                  style={{
                    borderColor: noteType === key ? meta.color : 'var(--border-color)',
                    backgroundColor: noteType === key ? `${meta.color}20` : 'transparent',
                    color: noteType === key ? meta.color : 'var(--text-secondary)',
                  }}
                >
                  {meta.icon} {meta.label}
                </button>
              )
            )}
          </div>
        </div>

        <div className="mb-3">
          <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
            Note
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your note… Markdown supported"
            rows={5}
            className="w-full text-sm px-3 py-2 rounded border bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] resize-none"
            dir="auto"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
            Tags (comma-separated)
          </label>
          <input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="study, fiqh, ayah"
            className="w-full text-sm px-3 py-1.5 rounded border bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
          />
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
            className="px-4 py-1.5 text-sm rounded-lg font-medium transition-colors"
            style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
          >
            Save Note
          </button>
        </div>
      </form>
    </div>
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export default function NotesPanel(): React.ReactElement {
  const ipc = useIpc()
  const [notes, setNotes] = useState<NoteRow[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<NoteType | 'all'>('all')
  const [showNewForm, setShowNewForm] = useState(false)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const loadNotes = useCallback(async () => {
    if (!ipc) { setLoading(false); return }
    setLoading(true)
    try {
      const data = await ipc.invoke('user:get-notes')
      setNotes(data as NoteRow[])
    } catch {
      setNotes([])
    } finally {
      setLoading(false)
    }
  }, [ipc])

  useEffect(() => {
    void loadNotes()
  }, [loadNotes])

  // Debounced FTS search
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    if (!searchQuery.trim()) {
      void loadNotes()
      return
    }
    searchTimerRef.current = setTimeout(async () => {
      if (!ipc) return
      try {
        const data = await ipc.invoke('user:search-notes', searchQuery, 100)
        setNotes(data as NoteRow[])
      } catch {
        // Fall back to client-side filter
      }
    }, 300)
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    }
  }, [searchQuery, ipc, loadNotes])

  const selectedNote = notes.find((n) => n.id === selectedId) ?? null

  const filteredNotes = notes.filter((n) => filterType === 'all' || n.type === filterType)

  async function handleSave(body: string, tags: string[], type: NoteType) {
    if (!ipc || !selectedNote) return
    try {
      await ipc.invoke('user:update-note', selectedNote.id, body, tags)
      setNotes((prev) =>
        prev.map((n) =>
          n.id === selectedNote.id
            ? { ...n, body, tags: JSON.stringify(tags), type, updated_at: new Date().toISOString() }
            : n
        )
      )
    } catch {
      // ignore
    }
  }

  async function handleDelete() {
    if (!ipc || !selectedNote) return
    try {
      await ipc.invoke('user:delete-note', selectedNote.id)
      setNotes((prev) => prev.filter((n) => n.id !== selectedNote.id))
      setSelectedId(null)
    } catch {
      // ignore
    }
  }

  async function handleNewNote(
    resourceKey: string,
    contentRef: string,
    type: NoteType,
    body: string,
    tags: string[]
  ) {
    if (!ipc) return
    try {
      const id = await ipc.invoke('user:save-note', resourceKey, contentRef, type, body, tags)
      const newNote: NoteRow = {
        id: id as number,
        resource_key: resourceKey,
        content_ref: contentRef,
        type,
        body,
        tags: JSON.stringify(tags),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setNotes((prev) => [newNote, ...prev])
      setSelectedId(newNote.id)
      setShowNewForm(false)
    } catch {
      // ignore
    }
  }

  return (
    <div
      className="flex h-full"
      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      {/* Left sidebar — note list */}
      <div
        className="flex flex-col border-r"
        style={{ width: 280, minWidth: 220, borderColor: 'var(--border-color)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-3 py-3 border-b"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div>
            <h1 className="text-sm font-semibold">Notes</h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {notes.length} note{notes.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              title="Export notes as Markdown"
              onClick={() => exportNotesAsMarkdown(filteredNotes)}
              disabled={filteredNotes.length === 0}
              className="p-1 rounded hover:bg-[var(--bg-secondary)] disabled:opacity-40"
              style={{ color: 'var(--text-secondary)' }}
            >
              ↓
            </button>
            <button
              onClick={() => setShowNewForm(true)}
              className="px-2 py-1 text-xs rounded-lg font-medium transition-colors"
              style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
            >
              + New
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 pt-2 pb-1">
          <input
            type="search"
            placeholder="Search notes…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-2 py-1 text-xs rounded border bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
          />
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-1 px-3 pb-2 flex-wrap">
          <button
            onClick={() => setFilterType('all')}
            className={`text-xs px-2 py-0.5 rounded-full border ${filterType === 'all' ? 'bg-[var(--accent-primary)] text-white border-transparent' : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'}`}
          >
            All
          </button>
          {(Object.keys(NOTE_TYPE_META) as NoteType[]).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(filterType === t ? 'all' : t)}
              className={`text-xs px-2 py-0.5 rounded-full border ${filterType === t ? 'font-medium' : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'}`}
              style={filterType === t ? { backgroundColor: `${NOTE_TYPE_META[t].color}20`, borderColor: NOTE_TYPE_META[t].color, color: NOTE_TYPE_META[t].color } : {}}
            >
              {NOTE_TYPE_META[t].icon}
            </button>
          ))}
        </div>

        {/* Note list */}
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {notes.length === 0 ? 'No notes yet' : 'No notes match'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  isSelected={note.id === selectedId}
                  onSelect={() => setSelectedId(note.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right panel — note editor */}
      <div className="flex-1 min-w-0">
        <NoteEditor
          note={selectedNote}
          onSave={(body, tags, type) => void handleSave(body, tags, type)}
          onDelete={() => void handleDelete()}
          onNew={() => setShowNewForm(true)}
        />
      </div>

      {/* New note modal */}
      {showNewForm && (
        <NewNoteForm
          onSubmit={(rk, cr, type, body, tags) => void handleNewNote(rk, cr, type, body, tags)}
          onCancel={() => setShowNewForm(false)}
        />
      )}
    </div>
  )
}
