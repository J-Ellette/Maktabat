import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/app-store'

/**
 * Resource address bar.
 *
 * Parses natural-language-style addresses:
 *   "Quran 2:255"   → /quran/2/255
 *   "Quran 1"       → /quran/1
 *   "Bukhari 1"     → /hadith/bukhari/1
 *   "/settings"     → /settings  (direct paths passed through)
 */
function parseAddress(raw: string): string {
  const input = raw.trim()
  if (!input) return '/'

  // Already a path
  if (input.startsWith('/')) return input

  // Quran reference: "Quran 2:255" or "Quran 2"
  const quranMatch = input.match(/^quran\s+(\d+)(?::(\d+))?$/i)
  if (quranMatch) {
    const surah = quranMatch[1]
    const ayah = quranMatch[2]
    return ayah ? `/quran/${surah}/${ayah}` : `/quran/${surah}`
  }

  // Surah reference: "Surah 2:5" or "Al-Fatiha 1"
  const surahMatch = input.match(/^(?:surah\s+)?(\d+)(?::(\d+))?$/i)
  if (surahMatch) {
    const surah = surahMatch[1]
    const ayah = surahMatch[2]
    return ayah ? `/quran/${surah}/${ayah}` : `/quran/${surah}`
  }

  // Hadith collections
  const hadithCollections: Record<string, string> = {
    bukhari: 'bukhari',
    muslim: 'muslim',
    'abu dawood': 'abu-dawood',
    'abu-dawood': 'abu-dawood',
    tirmidhi: 'tirmidhi',
    nasai: 'nasai',
    "nasa'i": 'nasai',
    'ibn majah': 'ibn-majah',
    'ibn-majah': 'ibn-majah',
    muwatta: 'muwatta',
    riyadh: 'riyadh-al-salihin',
  }

  for (const [key, slug] of Object.entries(hadithCollections)) {
    const re = new RegExp(`^${key}\\s+(\\d+)$`, 'i')
    const m = input.match(re)
    if (m) return `/hadith/${slug}/${m[1]}`
  }

  // Fall back to search
  return `/search?q=${encodeURIComponent(input)}`
}

export default function AddressBar(): React.ReactElement {
  const navigate = useNavigate()
  const storeValue = useAppStore((s) => s.addressBarValue)
  const setAddressBarValue = useAppStore((s) => s.setAddressBarValue)
  const navigateTo = useAppStore((s) => s.navigateTo)

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(storeValue)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync display when external navigation changes the store value
  useEffect(() => {
    if (!editing) setDraft(storeValue)
  }, [storeValue, editing])

  function handleFocus() {
    setEditing(true)
    setDraft(storeValue)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  function handleBlur() {
    setEditing(false)
    setDraft(storeValue)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const resolved = parseAddress(draft)
    navigateTo(resolved)
    setAddressBarValue(resolved)
    void navigate(resolved)
    inputRef.current?.blur()
    setEditing(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 min-w-0" aria-label="Resource address bar">
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="Navigate to… Quran 2:255, Bukhari 1, /settings"
        aria-label="Navigate to resource"
        className="w-full h-7 px-3 text-sm rounded-md border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-colors font-mono"
      />
    </form>
  )
}
