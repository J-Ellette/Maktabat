import React from 'react'
import { useParams } from 'react-router-dom'

interface PlaceholderRouteProps {
  title: string
}

export default function PlaceholderRoute({ title }: PlaceholderRouteProps): React.ReactElement {
  const params = useParams()
  const paramList = Object.entries(params)

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
      <div className="text-5xl">📚</div>
      <h2 className="font-latin-display text-2xl font-semibold text-[var(--accent-primary)]">
        {title}
      </h2>
      {paramList.length > 0 && (
        <div className="font-mono text-sm text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-4 py-2 rounded-md">
          {paramList.map(([key, val]) => (
            <div key={key}>
              {key}: <span className="text-[var(--accent-primary)]">{val}</span>
            </div>
          ))}
        </div>
      )}
      <p className="font-latin-body text-[var(--text-secondary)] max-w-md">
        This module will be implemented in a future phase. The routing and navigation infrastructure
        is ready to receive it.
      </p>
    </div>
  )
}
