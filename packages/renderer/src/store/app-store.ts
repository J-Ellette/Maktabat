import { create } from 'zustand'

export type PanelLayout = 'single' | 'two-column' | 'three-column'
export type SidebarSection =
  | 'library'
  | 'bookmarks'
  | 'notes'
  | 'reading-plans'
  | 'factbook'
  | 'atlas'

export interface PanelTab {
  id: string
  title: string
  route: string
  icon?: string
}

export interface PanelState {
  id: string
  tabs: PanelTab[]
  activeTabId: string | null
  defaultSize: number
}

export interface AppState {
  // Layout
  layout: PanelLayout
  sidebarOpen: boolean
  sidebarSection: SidebarSection
  panels: PanelState[]

  // Command palette
  commandPaletteOpen: boolean

  // Address bar
  addressBarValue: string

  // Navigation history
  historyStack: string[]
  historyIndex: number

  // Dashboard view
  dashboardView: 'everything' | 'reference'

  // Actions
  setLayout: (layout: PanelLayout) => void
  toggleSidebar: () => void
  setSidebarSection: (section: SidebarSection) => void
  openCommandPalette: () => void
  closeCommandPalette: () => void
  setAddressBarValue: (value: string) => void
  navigateTo: (route: string) => void
  navigateBack: () => void
  navigateForward: () => void
  setDashboardView: (view: 'everything' | 'reference') => void
  addPanelTab: (panelId: string, tab: PanelTab) => void
  setActivePanelTab: (panelId: string, tabId: string) => void
  closePanelTab: (panelId: string, tabId: string) => void
}

const defaultPanels: PanelState[] = [
  {
    id: 'main',
    tabs: [{ id: 'dashboard', title: 'Dashboard', route: '/', icon: 'home' }],
    activeTabId: 'dashboard',
    defaultSize: 100,
  },
]

export const useAppStore = create<AppState>((set, get) => ({
  layout: 'single',
  sidebarOpen: true,
  sidebarSection: 'library',
  panels: defaultPanels,
  commandPaletteOpen: false,
  addressBarValue: '',
  historyStack: ['/'],
  historyIndex: 0,
  dashboardView: 'everything',

  setLayout: (layout) => {
    const panels: PanelState[] = []
    const count = layout === 'single' ? 1 : layout === 'two-column' ? 2 : 3
    const existingPanels = get().panels
    for (let i = 0; i < count; i++) {
      panels.push(
        existingPanels[i] ?? {
          id: `panel-${i}`,
          tabs: [
            {
              id: `dashboard-${i}`,
              title: 'Dashboard',
              route: '/',
              icon: 'home',
            },
          ],
          activeTabId: `dashboard-${i}`,
          // Distribute sizes so they always sum to exactly 100
          defaultSize:
            i === count - 1 ? 100 - Math.floor(100 / count) * (count - 1) : Math.floor(100 / count),
        }
      )
    }
    set({ layout, panels })
  },

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarSection: (sidebarSection) => set({ sidebarSection }),
  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),
  setAddressBarValue: (addressBarValue) => set({ addressBarValue }),

  navigateTo: (route) => {
    const { historyStack, historyIndex } = get()
    const newStack = [...historyStack.slice(0, historyIndex + 1), route]
    set({
      historyStack: newStack,
      historyIndex: newStack.length - 1,
      addressBarValue: route,
    })
  },

  navigateBack: () => {
    const { historyIndex, historyStack } = get()
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      set({
        historyIndex: newIndex,
        addressBarValue: historyStack[newIndex] ?? '',
      })
    }
  },

  navigateForward: () => {
    const { historyIndex, historyStack } = get()
    if (historyIndex < historyStack.length - 1) {
      const newIndex = historyIndex + 1
      set({
        historyIndex: newIndex,
        addressBarValue: historyStack[newIndex] ?? '',
      })
    }
  },

  setDashboardView: (dashboardView) => set({ dashboardView }),

  addPanelTab: (panelId, tab) =>
    set((state) => ({
      panels: state.panels.map((p) =>
        p.id === panelId ? { ...p, tabs: [...p.tabs, tab], activeTabId: tab.id } : p
      ),
    })),

  setActivePanelTab: (panelId, tabId) =>
    set((state) => ({
      panels: state.panels.map((p) => (p.id === panelId ? { ...p, activeTabId: tabId } : p)),
    })),

  closePanelTab: (panelId, tabId) =>
    set((state) => ({
      panels: state.panels.map((p) => {
        if (p.id !== panelId) return p
        const remaining = p.tabs.filter((t) => t.id !== tabId)
        const activeTabId =
          p.activeTabId === tabId ? (remaining[remaining.length - 1]?.id ?? null) : p.activeTabId
        return { ...p, tabs: remaining, activeTabId }
      }),
    })),
}))
