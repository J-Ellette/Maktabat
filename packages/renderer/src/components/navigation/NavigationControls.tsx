import React from 'react'
import { useAppStore } from '../../store/app-store'

export default function NavigationControls(): React.ReactElement {
  const historyIndex = useAppStore((s) => s.historyIndex)
  const historyStack = useAppStore((s) => s.historyStack)
  const navigateBack = useAppStore((s) => s.navigateBack)
  const navigateForward = useAppStore((s) => s.navigateForward)

  const canBack = historyIndex > 0
  const canForward = historyIndex < historyStack.length - 1

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={navigateBack}
        disabled={!canBack}
        aria-label="Go back"
        className="p-1.5 rounded hover:bg-[var(--bg-secondary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-[var(--text-secondary)]"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 12L6 8l4-4" />
        </svg>
      </button>
      <button
        onClick={navigateForward}
        disabled={!canForward}
        aria-label="Go forward"
        className="p-1.5 rounded hover:bg-[var(--bg-secondary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-[var(--text-secondary)]"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 4l4 4-4 4" />
        </svg>
      </button>
    </div>
  )
}
