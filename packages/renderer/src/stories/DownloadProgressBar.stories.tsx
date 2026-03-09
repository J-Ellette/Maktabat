import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// DownloadProgressBar — Resource download progress indicator
// Shows download progress with animated progress bar, percentage, and status.
// ─────────────────────────────────────────────────────────────────────────────

interface DownloadProgressBarProps {
  resourceName: string
  percentage: number
  status: 'downloading' | 'installed' | 'error'
  message?: string
}

function DownloadProgressBar({ resourceName, percentage, status, message }: DownloadProgressBarProps) {
  return (
    <div className="p-3 rounded-xl border border-gray-200 bg-white flex items-center gap-3 min-w-[320px]">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{resourceName}</p>
        <div className="mt-2 flex flex-col gap-1">
          {status === 'downloading' && (
            <>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{message ?? `Downloading… ${percentage}%`}</span>
                <span>{percentage}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </>
          )}
          {status === 'installed' && (
            <p className="text-xs text-emerald-600 font-medium">✅ Download complete</p>
          )}
          {status === 'error' && (
            <p className="text-xs text-red-600 font-medium">⚠️ {message ?? 'Download failed'}</p>
          )}
        </div>
      </div>
      {status === 'downloading' && (
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
      )}
    </div>
  )
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof DownloadProgressBar> = {
  title: 'Library/DownloadProgressBar',
  component: DownloadProgressBar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Progress bar shown when a resource is being downloaded from the CDN. ' +
          'Receives incremental progress updates via the `resource:download-progress` IPC channel ' +
          'and updates in real-time.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    percentage: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
    status: {
      control: 'select',
      options: ['downloading', 'installed', 'error'],
    },
  },
}

export default meta
type Story = StoryObj<typeof DownloadProgressBar>

export const InProgress: Story = {
  args: {
    resourceName: 'Tafsir Ibn Kathir (English)',
    percentage: 42,
    status: 'downloading',
    message: 'Downloading Tafsir Ibn Kathir… 42%',
  },
}

export const NearComplete: Story = {
  args: {
    resourceName: 'Sahih al-Bukhari',
    percentage: 89,
    status: 'downloading',
    message: 'Downloading Sahih al-Bukhari… 89%',
  },
}

export const Complete: Story = {
  args: {
    resourceName: 'Al-Arba\'in al-Nawawiyyah',
    percentage: 100,
    status: 'installed',
    message: '"Al-Arba\'in al-Nawawiyyah" downloaded successfully.',
  },
}

export const Error: Story = {
  args: {
    resourceName: 'Tafsir al-Tabari (Arabic)',
    percentage: 33,
    status: 'error',
    message: 'Connection lost. Please try again.',
  },
}
