import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

const Dashboard = lazy(() => import('../components/dashboard/Dashboard'))
const SettingsPanel = lazy(() => import('../components/settings/SettingsPanel'))
const QuranReader = lazy(() => import('../components/quran/QuranReader'))
const TafsirViewer = lazy(() => import('../components/tafsir/TafsirViewer'))
const PlaceholderRoute = lazy(() => import('./PlaceholderRoute'))

function RouteSpinner() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function AppRoutes(): React.ReactElement {
  return (
    <Suspense fallback={<RouteSpinner />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/settings" element={<SettingsPanel />} />
        <Route path="/settings/:section" element={<SettingsPanel />} />
        {/* Quran reading module */}
        <Route path="/quran" element={<QuranReader />} />
        <Route path="/quran/:surah" element={<QuranReader />} />
        <Route path="/quran/:surah/:ayah" element={<QuranReader />} />
        {/* Placeholder routes for future phases */}
        <Route path="/hadith" element={<PlaceholderRoute title="Hadith" />} />
        <Route path="/hadith/:collection" element={<PlaceholderRoute title="Hadith" />} />
        <Route path="/hadith/:collection/:number" element={<PlaceholderRoute title="Hadith" />} />
        {/* Tafsir module — Phase 4 */}
        <Route path="/tafsir/:surah/:ayah" element={<TafsirViewer />} />
        <Route path="/search" element={<PlaceholderRoute title="Search" />} />
        <Route path="/library" element={<PlaceholderRoute title="Library Manager" />} />
        <Route path="/reading-plans" element={<PlaceholderRoute title="Reading Plans" />} />
        <Route path="/bookmarks" element={<PlaceholderRoute title="Bookmarks" />} />
        <Route path="/notes" element={<PlaceholderRoute title="Notes" />} />
        <Route path="/factbook" element={<PlaceholderRoute title="Factbook" />} />
        <Route path="/atlas" element={<PlaceholderRoute title="Atlas" />} />
        <Route path="/khutbah" element={<PlaceholderRoute title="Khutbah Builder" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
