import React, { useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'sepia'

function ThemeProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('maktabat-theme') as Theme) ?? 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark', 'sepia')
    root.classList.add(theme)
    localStorage.setItem('maktabat-theme', theme)
  }, [theme])

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="flex gap-2 p-2 justify-end">
        <button
          onClick={() => setTheme('light')}
          className={`px-3 py-1 rounded text-sm border border-[var(--border-color)] ${theme === 'light' ? 'bg-[var(--accent-primary)] text-white' : ''}`}
        >
          Light
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={`px-3 py-1 rounded text-sm border border-[var(--border-color)] ${theme === 'dark' ? 'bg-[var(--accent-primary)] text-white' : ''}`}
        >
          Dark
        </button>
        <button
          onClick={() => setTheme('sepia')}
          className={`px-3 py-1 rounded text-sm border border-[var(--border-color)] ${theme === 'sepia' ? 'bg-[var(--accent-primary)] text-white' : ''}`}
        >
          Sepia
        </button>
      </div>
      {children}
    </div>
  )
}

export default function App(): React.ReactElement {
  return (
    <ThemeProvider>
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-3rem)] gap-6 p-8">
        <h1 className="font-arabic-display text-4xl font-bold text-[var(--accent-primary)]">
          Maktabat — مكتبة
        </h1>
        <p className="font-latin-body text-lg text-[var(--text-secondary)]">
          Phase 0: Foundation complete. Phase 1 coming soon.
        </p>
        <div className="quran-text text-center max-w-2xl">
          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </div>
      </main>
    </ThemeProvider>
  )
}
