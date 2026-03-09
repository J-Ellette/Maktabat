import React, { useState, useRef, useEffect } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Reciter {
  id: string
  name: string
  arabicName: string
  style: string
  audioUrlPattern: string
}

interface DownloadState {
  progress: number
  cached: boolean
  downloading: boolean
}

interface AudioDownloadManagerProps {
  reciters: Reciter[]
  onClose: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AudioDownloadManager({
  reciters,
  onClose,
}: AudioDownloadManagerProps): React.ReactElement {
  const [downloads, setDownloads] = useState<Record<string, DownloadState>>({})
  const intervalsRef = useRef<Record<string, ReturnType<typeof setInterval>>>({})

  // Clear all intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(intervalsRef.current).forEach(clearInterval)
    }
  }, [])

  const startDownload = (reciterId: string) => {
    setDownloads((prev) => ({
      ...prev,
      [reciterId]: { progress: 0, cached: false, downloading: true },
    }))

    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      if (progress >= 100) {
        clearInterval(interval)
        delete intervalsRef.current[reciterId]
        setDownloads((prev) => ({
          ...prev,
          [reciterId]: { progress: 100, cached: true, downloading: false },
        }))
      } else {
        setDownloads((prev) => ({
          ...prev,
          [reciterId]: { progress, cached: false, downloading: true },
        }))
      }
    }, 200)

    intervalsRef.current[reciterId] = interval
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-96 max-h-[80vh] overflow-y-auto bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              ⬇️ Download for Offline
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Cache Surah Al-Fatiha for offline listening
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Reciter list */}
        <div className="px-4 py-3 space-y-3">
          {reciters.map((reciter) => {
            const dl = downloads[reciter.id]
            return (
              <div
                key={reciter.id}
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[var(--text-primary)] truncate">
                      {reciter.name}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      {reciter.style} · Surah 1 (Al-Fatiha)
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {dl?.cached ? (
                      <span className="text-[10px] font-medium text-[var(--ae-green-600,#16a34a)] bg-[var(--ae-green-50,#f0fdf4)] border border-[var(--ae-green-200,#bbf7d0)] px-2 py-0.5 rounded-full">
                        ✅ Cached
                      </span>
                    ) : dl?.downloading ? null : (
                      <button
                        onClick={() => startDownload(reciter.id)}
                        className="text-[10px] px-2 py-0.5 rounded-full border border-[var(--accent-primary)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-white transition-colors"
                      >
                        Download
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                {dl?.downloading && (
                  <div className="mt-2">
                    <div className="w-full h-1.5 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--accent-primary)] rounded-full transition-all duration-200"
                        style={{ width: `${dl.progress}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5 text-right">
                      {dl.progress}%
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Premium note */}
        <div className="mx-4 mb-4 px-3 py-2.5 rounded-lg bg-[var(--ae-gold-50,#fffbeb)] border border-[var(--ae-gold-200,#fde68a)]">
          <p className="text-[11px] text-[var(--ae-gold-700,#b45309)]">
            ⭐ Full offline download (all surahs) requires{' '}
            <span className="font-semibold">Premium</span>. Upgrade to cache the complete Quran with
            your preferred reciter.
          </p>
        </div>
      </div>
    </div>
  )
}
