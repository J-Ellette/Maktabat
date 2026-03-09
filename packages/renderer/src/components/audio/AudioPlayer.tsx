import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Reciter {
  id: string
  name: string
  arabicName: string
  style: string
  audioUrlPattern: string
}

type RepeatMode = 'none' | 'verse' | 'surah'

// ─── Reciters ─────────────────────────────────────────────────────────────────

export const RECITERS: Reciter[] = [
  {
    id: 'mishary',
    name: 'Mishary Rashid Al-Afasy',
    arabicName: 'مشاري راشد العفاسي',
    style: 'Murattal',
    audioUrlPattern: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/{verse}.mp3',
  },
  {
    id: 'husary',
    name: 'Mahmoud Khalil Al-Husary',
    arabicName: 'محمود خليل الحصري',
    style: 'Murattal',
    audioUrlPattern: 'https://cdn.islamic.network/quran/audio/128/ar.husary/{verse}.mp3',
  },
  {
    id: 'abdul-basit',
    name: 'Abdul Basit Abdul Samad',
    arabicName: 'عبد الباسط عبد الصمد',
    style: 'Mujawwad',
    audioUrlPattern:
      'https://cdn.islamic.network/quran/audio/128/ar.abdulbasitmurattal/{verse}.mp3',
  },
  {
    id: 'minshawi',
    name: 'Mohamed Siddiq El-Minshawi',
    arabicName: 'محمد صديق المنشاوي',
    style: 'Murattal',
    audioUrlPattern: 'https://cdn.islamic.network/quran/audio/128/ar.minshawi/{verse}.mp3',
  },
  {
    id: 'sudais',
    name: 'Abdur-Rahman Al-Sudais',
    arabicName: 'عبد الرحمن السديس',
    style: 'Murattal',
    audioUrlPattern: 'https://cdn.islamic.network/quran/audio/128/ar.sudais/{verse}.mp3',
  },
]

// Convert surah + ayah to global verse number (1-6236)
const AYAH_COUNTS: number[] = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135, 112,
  78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37,
  35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52,
  44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8,
  8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6,
]

function getVerseNumber(surah: number, ayah: number): number {
  const base = AYAH_COUNTS.slice(0, surah - 1).reduce((a, b) => a + b, 0)
  return base + ayah
}

function buildAudioUrl(reciter: Reciter, surah: number, ayah: number): string {
  const verse = getVerseNumber(surah, ayah)
  return reciter.audioUrlPattern.replace('{verse}', String(verse))
}

// ─── AudioState ───────────────────────────────────────────────────────────────

export interface AudioState {
  isPlaying: boolean
  surah: number
  ayah: number
  reciterId: string
  speed: number
  repeatMode: RepeatMode
  sleepMinutes: number | null
  visible: boolean
  minimized: boolean
  currentTime: number
  duration: number
}

const DEFAULT_STATE: AudioState = {
  isPlaying: false,
  surah: 1,
  ayah: 1,
  reciterId: 'mishary',
  speed: 1.0,
  repeatMode: 'none',
  sleepMinutes: null,
  visible: false,
  minimized: false,
  currentTime: 0,
  duration: 0,
}

// ─── Global play trigger ──────────────────────────────────────────────────────

let globalPlayTrigger: ((surah: number, ayah: number) => void) | null = null

export function playAyah(surah: number, ayah: number): void {
  if (globalPlayTrigger) globalPlayTrigger(surah, ayah)
}

// ─── AudioPlayer component ────────────────────────────────────────────────────

export default function AudioPlayer(): React.ReactElement | null {
  const navigate = useNavigate()
  const [state, setState] = useState<AudioState>(DEFAULT_STATE)
  const [showReciterMenu, setShowReciterMenu] = useState(false)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const reciter = RECITERS.find((r) => r.id === state.reciterId) ?? RECITERS[0]
  const totalAyahs = AYAH_COUNTS[state.surah - 1] ?? 7

  // Register global trigger
  useEffect(() => {
    globalPlayTrigger = (surah, ayah) => {
      setState((s) => ({ ...s, surah, ayah, visible: true, minimized: false }))
    }
    return () => {
      globalPlayTrigger = null
    }
  }, [])

  // Load audio when surah/ayah/reciter changes
  useEffect(() => {
    if (!state.visible) return
    const url = buildAudioUrl(reciter, state.surah, state.ayah)
    if (!audioRef.current) {
      audioRef.current = new Audio()
    }
    const audio = audioRef.current
    audio.src = url
    audio.playbackRate = state.speed
    if (state.isPlaying) {
      void audio.play().catch(() => setState((s) => ({ ...s, isPlaying: false })))
    }
    audio.ontimeupdate = () =>
      setState((s) => ({ ...s, currentTime: audio.currentTime, duration: audio.duration || 0 }))
    audio.onended = () => {
      if (state.repeatMode === 'verse') {
        void audio.play()
      } else {
        const nextAyah =
          state.ayah < totalAyahs ? state.ayah + 1 : state.repeatMode === 'surah' ? 1 : null
        if (nextAyah !== null) {
          setState((s) => ({ ...s, ayah: nextAyah }))
        } else {
          setState((s) => ({ ...s, isPlaying: false }))
        }
      }
    }
    // Load only when track identity changes; intentionally omits state.isPlaying and state.speed
    // to avoid reloading audio on every play/pause or speed toggle.
  }, [state.surah, state.ayah, state.reciterId, state.visible])

  // Speed change
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = state.speed
  }, [state.speed])

  // Play/pause
  useEffect(() => {
    if (!audioRef.current) return
    if (state.isPlaying) {
      void audioRef.current.play().catch(() => setState((s) => ({ ...s, isPlaying: false })))
    } else {
      audioRef.current.pause()
    }
  }, [state.isPlaying])

  // Sleep timer
  useEffect(() => {
    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current)
    if (state.sleepMinutes) {
      sleepTimerRef.current = setTimeout(() => {
        setState((s) => ({ ...s, isPlaying: false, sleepMinutes: null }))
        if (audioRef.current) audioRef.current.pause()
      }, state.sleepMinutes * 60_000)
    }
    return () => {
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current)
    }
  }, [state.sleepMinutes])

  const toggle = useCallback(() => setState((s) => ({ ...s, isPlaying: !s.isPlaying })), [])

  const seek = (pct: number) => {
    if (!audioRef.current || !state.duration) return
    audioRef.current.currentTime = pct * state.duration
    setState((s) => ({ ...s, currentTime: pct * s.duration }))
  }

  const prevVerse = () => {
    if (state.ayah > 1) setState((s) => ({ ...s, ayah: s.ayah - 1 }))
    else if (state.surah > 1)
      setState((s) => ({ ...s, surah: s.surah - 1, ayah: AYAH_COUNTS[s.surah - 2] ?? 1 }))
  }

  const nextVerse = () => {
    if (state.ayah < totalAyahs) setState((s) => ({ ...s, ayah: s.ayah + 1 }))
    else if (state.surah < 114) setState((s) => ({ ...s, surah: s.surah + 1, ayah: 1 }))
    else setState((s) => ({ ...s, isPlaying: false }))
  }

  const cycleRepeat = () => {
    const modes: RepeatMode[] = ['none', 'verse', 'surah']
    setState((s) => ({ ...s, repeatMode: modes[(modes.indexOf(s.repeatMode) + 1) % modes.length] }))
  }

  const SPEEDS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0]

  const repeatIcon =
    state.repeatMode === 'verse' ? '🔂' : state.repeatMode === 'surah' ? '🔁' : '➡️'
  const progress = state.duration ? state.currentTime / state.duration : 0

  if (!state.visible) return null

  if (state.minimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-full shadow-xl px-4 py-2">
        <button onClick={toggle} className="text-[var(--accent-primary)] text-xl">
          {state.isPlaying ? '⏸' : '▶️'}
        </button>
        <span className="text-xs text-[var(--text-secondary)]">
          {state.surah}:{state.ayah}
        </span>
        <button
          onClick={() => setState((s) => ({ ...s, minimized: false }))}
          className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          ⬆
        </button>
        <button
          onClick={() => {
            setState((s) => ({ ...s, visible: false, isPlaying: false }))
            audioRef.current?.pause()
          }}
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm"
        >
          ✕
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--bg-panel)] border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎙️</span>
          <div>
            <div className="text-xs font-semibold text-[var(--text-primary)]">Quran Recitation</div>
            <button
              onClick={() => setShowReciterMenu((s) => !s)}
              className="text-[10px] text-[var(--accent-primary)] hover:underline"
            >
              {reciter.name}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setState((s) => ({ ...s, minimized: true }))}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 text-sm"
          >
            ⬇
          </button>
          <button
            onClick={() => {
              setState((s) => ({ ...s, visible: false, isPlaying: false }))
              audioRef.current?.pause()
            }}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Reciter picker */}
      {showReciterMenu && (
        <div className="px-3 py-2 bg-[var(--bg-panel)] border-b border-[var(--border-subtle)] space-y-1">
          {RECITERS.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                setState((s) => ({ ...s, reciterId: r.id }))
                setShowReciterMenu(false)
              }}
              className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                r.id === state.reciterId
                  ? 'bg-[var(--accent-primary)] text-white'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <span className="font-medium">{r.name}</span>
              <span className="ml-1 opacity-70">· {r.style}</span>
            </button>
          ))}
        </div>
      )}

      {/* Now playing */}
      <div className="px-4 py-3 text-center">
        <button
          onClick={() => void navigate(`/quran/${state.surah}/${state.ayah}`)}
          className="text-sm font-medium text-[var(--accent-primary)] hover:underline"
        >
          Surah {state.surah} — Verse {state.ayah}
        </button>
        <div className="text-xs text-[var(--text-muted)]">of {totalAyahs} verses</div>
      </div>

      {/* Progress bar */}
      <div className="px-4 pb-1">
        <div
          className="w-full h-1.5 bg-[var(--bg-hover)] rounded-full cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            seek((e.clientX - rect.left) / rect.width)
          }}
        >
          <div
            className="h-full bg-[var(--accent-primary)] rounded-full transition-all"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-0.5">
          <span>
            {Math.floor(state.currentTime / 60)}:
            {String(Math.floor(state.currentTime % 60)).padStart(2, '0')}
          </span>
          <span>
            {Math.floor(state.duration / 60)}:
            {String(Math.floor(state.duration % 60)).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 px-4 py-2">
        <button
          onClick={prevVerse}
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xl"
          title="Previous verse"
        >
          ⏮
        </button>
        <button
          onClick={toggle}
          className="w-10 h-10 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center text-lg hover:opacity-90 transition-opacity"
        >
          {state.isPlaying ? '⏸' : '▶'}
        </button>
        <button
          onClick={nextVerse}
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xl"
          title="Next verse"
        >
          ⏭
        </button>
      </div>

      {/* Extra controls */}
      <div className="flex items-center justify-between px-4 pb-3">
        {/* Repeat */}
        <button
          onClick={cycleRepeat}
          title={`Repeat: ${state.repeatMode}`}
          className={`text-sm px-2 py-0.5 rounded ${state.repeatMode !== 'none' ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}`}
        >
          {repeatIcon}
        </button>

        {/* Speed */}
        <div className="relative">
          <button
            onClick={() => setShowSpeedMenu((s) => !s)}
            className="text-xs px-2 py-0.5 rounded border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
          >
            {state.speed}×
          </button>
          {showSpeedMenu && (
            <div className="absolute bottom-8 right-0 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg shadow-xl overflow-hidden">
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setState((prev) => ({ ...prev, speed: s }))
                    setShowSpeedMenu(false)
                  }}
                  className={`block w-full px-4 py-1.5 text-xs text-left hover:bg-[var(--bg-hover)] ${s === state.speed ? 'text-[var(--accent-primary)] font-medium' : 'text-[var(--text-secondary)]'}`}
                >
                  {s}×
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sleep timer */}
        <div className="flex items-center gap-1">
          <span className="text-sm">🌙</span>
          {state.sleepMinutes ? (
            <button
              onClick={() => setState((s) => ({ ...s, sleepMinutes: null }))}
              className="text-xs text-[var(--accent-primary)]"
            >
              {state.sleepMinutes}m ✕
            </button>
          ) : (
            <select
              onChange={(e) =>
                setState((s) => ({ ...s, sleepMinutes: Number(e.target.value) || null }))
              }
              className="text-[10px] bg-transparent text-[var(--text-muted)] border-none outline-none cursor-pointer"
              defaultValue=""
            >
              <option value="">Sleep</option>
              <option value="15">15 min</option>
              <option value="30">30 min</option>
              <option value="45">45 min</option>
              <option value="60">60 min</option>
            </select>
          )}
        </div>
      </div>
    </div>
  )
}
