import React from 'react'
import { Panel, Group, Separator } from 'react-resizable-panels'
import { useAppStore } from '../../store/app-store'
import AppRoutes from '../../routes'

/**
 * A single panel with its tab bar and content area.
 */
function PanelContent({ panelId }: { panelId: string }): React.ReactElement {
  const panels = useAppStore((s) => s.panels)
  const setActivePanelTab = useAppStore((s) => s.setActivePanelTab)
  const closePanelTab = useAppStore((s) => s.closePanelTab)

  const panelState = panels.find((p) => p.id === panelId)
  if (!panelState) return <div />

  const { tabs, activeTabId } = panelState

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tab bar — only shown when more than one tab */}
      {tabs.length > 1 && (
        <div
          className="flex items-center border-b border-[var(--border-color)] bg-[var(--bg-primary)] overflow-x-auto"
          role="tablist"
        >
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId
            return (
              <div
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm cursor-pointer border-b-2 transition-colors flex-shrink-0 ${
                  isActive
                    ? 'border-[var(--accent-primary)] text-[var(--accent-primary)] bg-[var(--bg-primary)]'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                }`}
                onClick={() => setActivePanelTab(panelId, tab.id)}
              >
                <span className="truncate max-w-[140px]">{tab.title}</span>
                <button
                  aria-label={`Close ${tab.title} tab`}
                  className="w-4 h-4 rounded flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                  onClick={(e) => {
                    e.stopPropagation()
                    closePanelTab(panelId, tab.id)
                  }}
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  >
                    <line x1="1" y1="1" x2="9" y2="9" />
                    <line x1="9" y1="1" x2="1" y2="9" />
                  </svg>
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <AppRoutes />
      </div>
    </div>
  )
}

/**
 * Drag handle rendered between panels.
 */
function ResizeHandle(): React.ReactElement {
  return (
    <Separator className="group relative flex items-center justify-center w-1.5 bg-[var(--border-color)] hover:bg-[var(--accent-primary)] transition-colors cursor-col-resize">
      <div className="w-0.5 h-8 rounded-full bg-[var(--ae-black-300)] group-hover:bg-white transition-colors" />
    </Separator>
  )
}

/**
 * The main workspace: renders 1, 2, or 3 resizable panels based on layout.
 */
export default function PanelWorkspace(): React.ReactElement {
  const panels = useAppStore((s) => s.panels)

  return (
    <Group orientation="horizontal" className="flex-1 h-full">
      {panels.map((panel, index) => (
        <React.Fragment key={panel.id}>
          {index > 0 && <ResizeHandle />}
          <Panel defaultSize={panel.defaultSize} minSize={15} id={panel.id}>
            <PanelContent panelId={panel.id} />
          </Panel>
        </React.Fragment>
      ))}
    </Group>
  )
}
