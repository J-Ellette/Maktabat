import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

const Dashboard = lazy(() => import('../components/dashboard/Dashboard'))
const SettingsPanel = lazy(() => import('../components/settings/SettingsPanel'))
const QuranReader = lazy(() => import('../components/quran/QuranReader'))
const TafsirViewer = lazy(() => import('../components/tafsir/TafsirViewer'))
const HadithBrowser = lazy(() => import('../components/hadith/HadithBrowser'))
const SearchPanel = lazy(() => import('../components/search/SearchPanel'))
const WordStudyPanel = lazy(() => import('../components/linguistics/WordStudyPanel'))
const IrabViewer = lazy(() => import('../components/linguistics/IrabViewer'))
const ConjugationTable = lazy(() => import('../components/linguistics/ConjugationTable'))
const NotesPanel = lazy(() => import('../components/annotations/NotesPanel'))
const HighlightsPanel = lazy(() => import('../components/annotations/HighlightsPanel'))
const KhutbahBuilder = lazy(() => import('../components/khutbah/KhutbahBuilder'))
const StudyTemplates = lazy(() => import('../components/study-templates/StudyTemplates'))
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
        {/* Hadith module — Phase 5 */}
        <Route path="/hadith" element={<HadithBrowser />} />
        <Route path="/hadith/:collection" element={<HadithBrowser />} />
        <Route path="/hadith/:collection/:number" element={<HadithBrowser />} />
        {/* Tafsir module — Phase 4 */}
        <Route path="/tafsir/:surah/:ayah" element={<TafsirViewer />} />
        {/* Search module — Phase 6 */}
        <Route path="/search" element={<SearchPanel />} />
        {/* Linguistics module — Phase 7 */}
        <Route path="/word-study" element={<WordStudyPanel />} />
        <Route path="/irab/:surah/:ayah" element={<IrabViewer />} />
        <Route path="/conjugation" element={<ConjugationTable />} />
        {/* Phase 8 — Notes, Annotations & Khutbah */}
        <Route path="/notes" element={<NotesPanel />} />
        <Route path="/bookmarks" element={<HighlightsPanel />} />
        <Route path="/khutbah" element={<KhutbahBuilder />} />
        <Route path="/study-templates" element={<StudyTemplates />} />
        <Route path="/library" element={<PlaceholderRoute title="Library Manager" />} />
        <Route path="/reading-plans" element={<PlaceholderRoute title="Reading Plans" />} />
        <Route path="/factbook" element={<PlaceholderRoute title="Factbook" />} />
        <Route path="/atlas" element={<PlaceholderRoute title="Atlas" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
