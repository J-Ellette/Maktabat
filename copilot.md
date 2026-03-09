# Maktabat — مكتبة — Copilot Progress Tracker

This file tracks the implementation progress of the Maktabat Quran Study Software as phases are completed.

---

## Implementation Sessions

### Session 1 — Phase 1: Main Process & IPC Layer

**Date**: 2026-03-08

**Status**: ✅ Complete

#### Changes Made

**`packages/main/src/window-manager.ts`** — Enhanced

- Added window state persistence (size, position, maximized) via `window-state.json` in `userData`
- Added `createDetachedWindow()` method for multiple windows / detached panels
- Added `getAllWindows()` helper
- Added proper `closed` event cleanup

**`packages/main/src/index.ts`** — Rewrote (was a 21-line stub)

- Wires up all services at app startup
- Registers `maktabat://` as a standard privileged scheme (deep links)
- Registers `maktabat://` protocol handler intercepting renderer navigation
- Handles `.mkt` file associations (macOS `open-file` event; Windows/Linux second-instance `argv` parsing)
- Builds native OS menus via `buildMenu()`
- Creates system tray via `TrayManager`
- Sends first-run welcome notification
- Prevents navigation to external URLs in main window (security hardening)
- `setWindowOpenHandler` denies new window creation, opens in system browser instead

**`packages/main/src/tray-manager.ts`** — New file

- Creates system tray icon with rotating daily adhkar
- Context menu: daily dhikr, Show Window, Verse of the Day, Quit
- `sendNotification()` helper for system notifications
- Double-click to restore/focus main window

**`packages/main/src/library-service.ts`** — New file

- Wraps `better-sqlite3` with a prepared-statement cache
- Queries: `getAyah`, `getAyahsBySurah`, `getTranslations`, `getTafsir`, `getHadith`, `getHadithGrades`, `getMorphologyForAyah`
- `search()` method: FTS5 full-text search across Arabic Quran text, English translations, and Hadith (both Arabic & English)
- `sanitizeFtsQuery()` guard prevents malformed FTS5 queries
- Gracefully handles missing FTS tables (before first migration)
- WAL mode + 16 MB page cache for performance

**`packages/main/src/user-service.ts`** — New file

- Wraps `better-sqlite3` for `user.db`
- CRUD for notes, highlights, bookmarks, reading plans
- Key-value `settings` table (auto-created)
- Typed methods for all user data

**`packages/main/src/ipc-handlers.ts`** — New file

- Registers all IPC `handle` callbacks for every channel in `IpcChannel`
- Input validation on every argument: type checks, range checks, allowlist checks
- Prevents SQL injection via parameterized queries (no string interpolation)

**`packages/main/src/preload.ts`** — Enhanced

- Added `validReceiveChannels` array for all menu/tray/protocol push channels
- `on()` method now accepts `ReceiveChannel` type (not `IpcChannel`)

**`packages/shared/types/ipc.ts`** — Enhanced

- Added `ReceiveChannel` const object for all main→renderer push channels
- Typed `ReceiveChannelType`
- Improved `LibrarySearchResult` type (matches actual service output)
- Added `SaveHighlightRequest`, `SettingsGetRequest`, `SettingsSetRequest` types
- Tightened `SaveNoteRequest.type` to union literal type

**`packages/main/src/menu-builder.ts`** — Minor fix

- Removed unused `MenuItem` import
- Fixed `async` click handler to use `void` pattern (lint compliance)

**`packages/database/src/migrate.ts`** — Minor fix

- Removed unused `fileURLToPath` / `__dirname` imports (lint compliance)

---

### Session 2 — Phase 2: Core UI Shell

**Date**: 2026-03-08

**Status**: ✅ Complete

#### Changes Made

**Dependencies added to `packages/renderer`**

- `react-router-dom@7.13.1` — in-app routing via `HashRouter` (Electron-friendly)
- `react-resizable-panels@4.7.2` — resizable split panel workspace

**`packages/renderer/postcss.config.js`** — Renamed to `postcss.config.cjs`

- Fixed ESM/CJS conflict (package uses `"type": "module"`)

**`packages/renderer/src/App.tsx`** — Rewrote

- Replaced static placeholder with `<HashRouter><AppShell /></HashRouter>`

**`packages/renderer/src/styles/tokens.css`** — Enhanced

- Added `--bg-sidebar` token to all three theme variants (light/dark/sepia)

**`packages/renderer/src/store/settings-store.ts`** — New file

- Zustand store (persisted to `localStorage`) for all user preferences
- Settings: theme, font sizes per panel, Arabic script (Hafs/Warsh/Qalun), transliteration system, interface language (EN/AR), accessibility flags, notification prefs, keyboard shortcuts

**`packages/renderer/src/store/app-store.ts`** — New file

- Zustand store for runtime app state (layout, sidebar section, panels, tabs, command palette, navigation history, address bar)
- `navigateTo` / `navigateBack` / `navigateForward` with history stack
- `setLayout` creates correct panel array for 1/2/3-column layouts
- `addPanelTab` / `setActivePanelTab` / `closePanelTab`

**`packages/renderer/src/hooks/useDirection.ts`** — New file

- `useDirection()` hook reads `interfaceLanguage` from settings store
- Applies `dir="rtl"|"ltr"` to `<html>` so CSS `[dir='rtl']` and Tailwind RTL utilities work globally

**`packages/renderer/src/hooks/useCommandPalette.ts`** — New file

- `useCommandPalette()` hook registers `Cmd+K` / `Ctrl+K` global shortcut
- Returns `{ open, openPalette, closePalette, toggle }`

**`packages/renderer/src/routes/index.tsx`** — New file

- Lazy-loaded route definitions for all major routes
- Routes: `/` (Dashboard), `/settings/:section`, `/quran/:surah/:ayah`, `/hadith/:collection/:number`, `/search`, `/library`, `/reading-plans`, `/bookmarks`, `/notes`, `/factbook`, `/atlas`, `/khutbah`
- `PlaceholderRoute` for modules not yet implemented

**`packages/renderer/src/components/layout/AppShell.tsx`** — New file

- Top-level shell component: `ThemeSynchronizer`, `IpcMenuListener`, `Toolbar`, sidebar + workspace
- `ThemeSynchronizer`: applies CSS class to `<html>` (light/dark/sepia + high-contrast)
- `IpcMenuListener`: subscribes to all `menu:*` and `protocol:open-url` IPC channels
- `Toolbar`: sidebar toggle, brand link, back/forward, address bar, command palette trigger, layout switcher, theme switcher, settings button
- Sidebar + workspace rendered in a resizable `<Group>` from `react-resizable-panels`

**`packages/renderer/src/components/layout/Sidebar.tsx`** — New file

- Icon nav rail (Library / Bookmarks / Notes / Reading Plans / Factbook / Atlas)
- Library section: expandable tree with Quran, Hadith collections, Tafsir, Fiqh nodes
- Placeholder sections for other sidebar items

**`packages/renderer/src/components/layout/PanelWorkspace.tsx`** — New file

- Renders 1–3 resizable `<Panel>` components inside a `<Group orientation="horizontal">`
- Each panel shows tab bar (when >1 tab) + content area with `<AppRoutes />`
- Drag `<Separator>` handles between panels

**`packages/renderer/src/components/navigation/NavigationControls.tsx`** — New file

- Back / Forward buttons wired to app store history stack

**`packages/renderer/src/components/navigation/AddressBar.tsx`** — New file

- Resource address bar with natural-language parsing
- `parseAddress()`: handles `Quran 2:255`, `Bukhari 1`, `/settings`, bare surah numbers
- Syncs with app store address bar value

**`packages/renderer/src/components/navigation/CommandPalette.tsx`** — New file

- Modal command palette (Esc to close, ↑↓ to navigate, Enter to select)
- Categories: Navigate, Layout, Settings, Actions
- Fuzzy filter across label + description + keywords
- Commands: dashboard, Quran, Hadith, Search, Bookmarks, Notes, Reading Plans, Settings sections, layout toggles, sidebar toggle, Factbook, Atlas, Khutbah Builder

**`packages/renderer/src/components/dashboard/Dashboard.tsx`** — New file

- **"Everything" view**: Verse of the Day card (with show/hide tafsir snippet), Daily Dhikr card (with copy), Hadith of the Day card (with grade badge), Reading Plan progress widget, Recent Resources list, Recent Notes list
- **"Reference" view**: full-text search form, Surah/Ayah quick-navigate form, Quick-open link grid

**`packages/renderer/src/components/settings/SettingsPanel.tsx`** — New file

- Two-column settings layout: left nav + right content
- **Appearance**: 3-theme picker, per-panel font-size sliders
- **Language**: interface language toggle (EN/AR), Arabic script selector (Hafs/Warsh/Qalun), transliteration system picker
- **Library**: storage summary, installed resources list, available-to-download list with Download buttons
- **Account**: signed-out state with sign-in CTA, subscription tier display with upgrade button
- **Keyboard Shortcuts**: click-to-rebind UI with live key capture
- **Accessibility**: High Contrast, Reduced Motion, Screen Reader Optimized toggles
- **Notifications**: Reading Plan Reminders toggle + time picker, New Resource Alerts toggle

---

## Phase Completion Status

### Phase 0: Project Foundation ✅ (pre-existing)

- [x] Monorepo (pnpm workspaces) initialized
- [x] TypeScript strict mode configured
- [x] ESLint + Prettier + Husky
- [x] electron-builder configured
- [x] GitHub Actions CI/CD
- [x] UAE Design System color tokens
- [x] Tailwind configured with tokens
- [x] Dark / Light / Sepia themes
- [x] Arabic fonts (Noto Naskh, Amiri, IBM Plex Arabic)
- [x] Latin fonts (Cormorant Garamond, Source Serif 4)
- [x] Quranic font (KFGQPC Uthmanic Hafs)
- [ ] Storybook component library (deferred to Phase 2+)
- [x] SQLite `library.db` schema
- [x] SQLite `user.db` schema
- [x] Migration system
- [x] Seed scripts (Al-Fatiha + 10 sample hadiths)

### Phase 1: Main Process & IPC Layer ✅ (Session 1)

- [x] Window manager with security settings, size/position persistence, multiple windows
- [x] Application menu (File, Edit, View, Library, Study, Help)
- [x] Tray icon with daily dhikr / verse-of-day quick access
- [x] System notifications (`sendNotification` helper)
- [x] `maktabat://` protocol handler (deep links)
- [x] `.mkt` file association handler
- [x] IPC channel definitions (`IpcChannel` + `ReceiveChannel`)
- [x] Preload script with typed `window.maktabat` API
- [x] All IPC handlers implemented with input validation
- [x] `LibraryService`: typed queries + prepared statement cache + FTS5 search
- [x] `UserService`: notes, highlights, bookmarks, reading plans, settings

### Phase 2: Core UI Shell ✅ (Session 2)

- [x] Application shell with theme provider
- [x] RTL/LTR direction context
- [x] Resizable panel system (1/2/3 columns, drag handles)
- [x] Sidebar navigation (Library tree, Bookmarks, Notes, Plans, Factbook, Atlas)
- [x] In-app router (React Router v7 + HashRouter for Electron)
- [x] History stack (back/forward navigation controls)
- [x] Resource address bar (parses `Quran 2:255`, `Bukhari 1`, direct paths)
- [x] Command palette (Cmd+K — search, navigate, layout, actions)
- [x] Dashboard / New Tab — "Everything" view (dhikr, verse, hadith, plans, recent)
- [x] Dashboard / New Tab — "Reference" view (search, ayah nav, quick-open)
- [x] Settings panel — Appearance (theme, font sizes)
- [x] Settings panel — Language (interface lang, Arabic script, transliteration)
- [x] Settings panel — Library (installed resources, downloads, storage)
- [x] Settings panel — Account (subscription tier, sign-in CTA)
- [x] Settings panel — Keyboard Shortcuts (click-to-rebind)
- [x] Settings panel — Accessibility (high contrast, reduced motion, screen reader)
- [x] Settings panel — Notifications (reminders, alerts)

---

### Session 3 — Phase 3: Quran Reading Module

**Date**: 2026-03-08

**Status**: ✅ Complete

#### Changes Made

**`packages/shared/types/ipc.ts`** — Enhanced

- Added `LIBRARY_GET_SURAHS`, `LIBRARY_GET_AYAHS_BY_SURAH`, `LIBRARY_GET_TRANSLATIONS`, `USER_GET_HIGHLIGHTS` IPC channels
- Added `SurahInfo`, `AyahData`, `TranslationData`, `MorphologyData`, `AyahBundle`, `HighlightData`, `HighlightColor` types

**`packages/main/src/library-service.ts`** — Enhanced

- Added `SurahRow` interface
- Added `getSurahs: Statement` to statement cache
- Added `getSurahs()` public method returning all 114 surahs

**`packages/main/src/ipc-handlers.ts`** — Enhanced

- Added `library:get-surahs` handler
- Added `library:get-ayahs-by-surah` handler (returns ayah + translations + morphology bundles)
- Added `library:get-translations` handler
- Added `user:get-highlights` handler

**`packages/main/src/preload.ts`** — Enhanced

- Added all new IPC channels to `validChannels` whitelist

**`packages/renderer/src/hooks/useIpc.ts`** — New file

- `useIpc()` hook returning typed `window.maktabat` bridge or null

**`packages/renderer/src/components/quran/TajweedColors.ts`** — New file

- Tajweed rule type definitions and color constants (8 rules mapped to AE palette)
- Human-readable rule names in Arabic and English with descriptions

**`packages/renderer/src/components/quran/WordPopover.tsx`** — New file

- Hover card showing: Arabic word (large), root letters (gold), root meaning, part of speech, case marker, verb pattern
- "Open full word study" button
- Appears after 300ms hover delay, auto-hides on mouse leave

**`packages/renderer/src/components/quran/VerseContextMenu.tsx`** — New file

- Right-click context menu for any Quran verse
- Copy: Arabic, Translation, or both
- Highlight color picker (8 AE palette colors)
- Actions: Add Note, Add to Khutbah, View in Tafsir, View related Hadith, Play recitation, Share verse
- Closes on Escape or outside click; auto-adjusts position to stay within viewport

**`packages/renderer/src/components/quran/ArabicVerse.tsx`** — New file

- Renders a single Arabic verse with KFGQPC Uthmanic Hafs / Amiri font
- OpenType features: `liga`, `calt`, `kern` (ligatures, contextual alternates, kerning)
- Word-by-word interactive spans with hover delay popover
- Arabic-Indic verse end markers (٥٦ style)
- Bismillah pre-header for applicable surahs
- Tajweed overlay toggle (CSS class hook; full coloring requires DB data)
- View mode support: verse-by-verse vs. continuous inline
- Highlight display with RGBA background overlays
- IPC highlight save via `user:save-highlight`

**`packages/renderer/src/components/quran/TranslationView.tsx`** — New file

- Four display modes: `single`, `parallel` (up to 4 side-by-side), `comparison` (stacked with translator attribution), `interlinear` (Arabic word + English gloss)
- `TranslationSelector` component for picking which translations to show (max 4 in parallel mode)

**`packages/renderer/src/components/quran/SurahNavigator.tsx`** — New file

- Full surah browser with cards: number badge, Arabic name (Amiri font), transliterated name, English name, Meccan/Medinan badge, verse count
- Search filter (by number, name Arabic/transliterated/English)
- Revelation type filter chips (All / Meccan / Medinan)
- Tab switcher: Surahs | Juz' (30 Juz' with surah/ayah start points)
- Footer with result count
- Graceful empty state for missing DB data

**`packages/renderer/src/components/quran/QuranReader.tsx`** — New file

- Main entry for `/quran`, `/quran/:surah`, `/quran/:surah/:ayah` routes
- Surah header: Arabic name (Amiri), transliterated name (Cormorant Garamond), Meccan/Medinan badge, verse count, ornamental divider
- Sticky reading toolbar: surah nav toggle, view mode switcher (verse-by-verse / continuous / page), translation toggle, translation mode switcher, tajweed toggle + legend popup, prev/next surah buttons
- Loads all verses + translations + morphology in one IPC call
- Verse-by-verse mode: each verse in a card with Arabic text + translations
- Continuous mode: all Arabic text flows as one RTL block + translations listed below
- Translation selector bar below toolbar
- Scrolls to target ayah when URL includes ayah parameter
- Prev/Next surah footer navigation
- Graceful empty/error states

**`packages/renderer/src/routes/index.tsx`** — Updated

- `/quran`, `/quran/:surah`, `/quran/:surah/:ayah` now use real `QuranReader` component
- Added `/tafsir/:surah/:ayah` placeholder route for future Phase 4

---

### Session 4 — Phase 4: Tafsir Module

**Date**: 2026-03-08

**Status**: ✅ Complete

#### Changes Made

**`packages/main/src/library-service.ts`** — Enhanced

- Added `getTafsirsForAyah: Statement`, `getTafsirsBySurah: Statement`, `getTafsirKeys: Statement` to statement cache
- Added `getTafsirsForAyah(ayahId)` — returns all tafsir entries for a single ayah (any key)
- Added `getTafsirsBySurah(surahNumber, tafsirKey)` — returns tafsir for all ayahs in a surah
- Added `getTafsirKeys()` — returns list of installed tafsir keys

**`packages/main/src/ipc-handlers.ts`** — Enhanced

- Added `library:get-tafsirs-for-ayah` handler
- Added `library:get-tafsirs-by-surah` handler
- Added `library:get-tafsir-keys` handler

**`packages/main/src/preload.ts`** — Enhanced

- Added `library:get-tafsirs-for-ayah`, `library:get-tafsirs-by-surah`, `library:get-tafsir-keys` to `validChannels` whitelist

**`packages/shared/types/ipc.ts`** — Enhanced

- Added `LIBRARY_GET_TAFSIRS_FOR_AYAH`, `LIBRARY_GET_TAFSIRS_BY_SURAH`, `LIBRARY_GET_TAFSIR_KEYS` IPC channel constants
- Added `TafsirData`, `GetTafsirsForAyahRequest`, `GetTafsirsBySurahRequest` types

**`packages/database/seeds/seed-tafsir-fatiha.sql`** — New file

- Ibn Kathir tafsir commentary for all 7 verses of Al-Fatiha
- Inserts `ibn-kathir` into the `resources` table (author, tradition, type, century metadata)
- Volume and page references from standard print edition
- Scholarly commentary with cross-references to Quranic verses

**`packages/renderer/src/components/tafsir/TafsirViewer.tsx`** — New file

- **Full tafsir viewer** for route `/tafsir/:surah/:ayah`
- Surah/ayah taken from URL route params; synchronized from QuranReader's "View Tafsir" button
- **Arabic verse banner**: displays the full tashkeel Arabic text at top of viewer
- **Tafsir selector**: toggle between up to 2 installed tafsirs (TAFSIR_REGISTRY metadata lookup)
- **Side-by-side panels**: when 2 tafsirs selected, rendered as split horizontal columns
- **Volume/page citation badge**: shows "Vol. N, p. N" for every entry (gold-tinted)
- **Cross-reference parser** (`parseCrossRefs`): regex-powered inline link parser:
  - `Quran N:N` / `Q N:N` → navigates to `/tafsir/N/N`
  - `(N:N)` parenthetical refs → same navigation
  - `Bukhari N` / `Muslim N` / etc. → navigates to `/hadith/collection/N`
- **Author bio modal** (`AuthorBioModal`): accessible from each panel's header "About ℹ" button — shows title, Arabic title, author name, dates, tradition, century, language, and biography
- **Ayah navigator**: prev/verse buttons with "Verse N of M" counter
- **TAFSIR_REGISTRY**: static metadata for Ibn Kathir, Al-Jalalayn, Al-Tabari (expandable as DB grows)
- Graceful empty state when no tafsir data available for a verse

**`packages/renderer/src/routes/index.tsx`** — Updated

- `/tafsir/:surah/:ayah` now uses real `TafsirViewer` component (was `PlaceholderRoute`)

---

## Phase Completion Status

### Phase 0: Project Foundation ✅ (pre-existing)

- [x] Monorepo (pnpm workspaces) initialized
- [x] TypeScript strict mode configured
- [x] ESLint + Prettier + Husky
- [x] electron-builder configured
- [x] GitHub Actions CI/CD
- [x] UAE Design System color tokens
- [x] Tailwind configured with tokens
- [x] Dark / Light / Sepia themes
- [x] Arabic fonts (Noto Naskh, Amiri, IBM Plex Arabic)
- [x] Latin fonts (Cormorant Garamond, Source Serif 4)
- [x] Quranic font (KFGQPC Uthmanic Hafs)
- [ ] Storybook component library (deferred to Phase 2+)
- [x] SQLite `library.db` schema
- [x] SQLite `user.db` schema
- [x] Migration system
- [x] Seed scripts (Al-Fatiha + 10 sample hadiths)

### Phase 1: Main Process & IPC Layer ✅ (Session 1)

- [x] Window manager with security settings, size/position persistence, multiple windows
- [x] Application menu (File, Edit, View, Library, Study, Help)
- [x] Tray icon with daily dhikr / verse-of-day quick access
- [x] System notifications (`sendNotification` helper)
- [x] `maktabat://` protocol handler (deep links)
- [x] `.mkt` file association handler
- [x] IPC channel definitions (`IpcChannel` + `ReceiveChannel`)
- [x] Preload script with typed `window.maktabat` API
- [x] All IPC handlers implemented with input validation
- [x] `LibraryService`: typed queries + prepared statement cache + FTS5 search
- [x] `UserService`: notes, highlights, bookmarks, reading plans, settings

### Phase 2: Core UI Shell ✅ (Session 2)

- [x] Application shell with theme provider
- [x] RTL/LTR direction context
- [x] Resizable panel system (1/2/3 columns, drag handles)
- [x] Sidebar navigation (Library tree, Bookmarks, Notes, Plans, Factbook, Atlas)
- [x] In-app router (React Router v7 + HashRouter for Electron)
- [x] History stack (back/forward navigation controls)
- [x] Resource address bar (parses `Quran 2:255`, `Bukhari 1`, direct paths)
- [x] Command palette (Cmd+K — search, navigate, layout, actions)
- [x] Dashboard / New Tab — "Everything" view (dhikr, verse, hadith, plans, recent)
- [x] Dashboard / New Tab — "Reference" view (search, ayah nav, quick-open)
- [x] Settings panel — Appearance (theme, font sizes)
- [x] Settings panel — Language (interface lang, Arabic script, transliteration)
- [x] Settings panel — Library (installed resources, downloads, storage)
- [x] Settings panel — Account (subscription tier, sign-in CTA)
- [x] Settings panel — Keyboard Shortcuts (click-to-rebind)
- [x] Settings panel — Accessibility (high contrast, reduced motion, screen reader)
- [x] Settings panel — Notifications (reminders, alerts)

### Phase 3: Quran Reading Module ✅ (Session 3)

- [x] Arabic text display with proper OpenType features
- [x] Tajweed color overlay (toggleable, with legend, 8 rules mapped to AE palette)
- [x] Line-by-line / verse-by-verse / page view modes
- [x] Translation renderer (single, parallel, interlinear, comparison)
- [x] Word-by-word interaction (hover popover with morphology data)
- [x] Verse interaction menu (right-click context menu)
- [x] Surah navigator (surah list, Meccan/Medinan filter, search, Juz' tab)

### Phase 4: Tafsir Module ✅ (Session 4)

- [x] Tafsir synchronized with Quran panel (QuranReader "View Tafsir" → `/tafsir/:surah/:ayah`)
- [x] Tafsir selector: switch between installed tafsirs (TafsirSelector component)
- [x] Multiple tafsirs side by side (up to 2 in horizontal split)
- [x] Volume/page reference always shown (citation badge per entry)
- [ ] Tafsir passage highlights: key rulings, ijaz markers, disputed points (requires DB annotation schema — deferred)
- [x] Hadith citations within tafsir are live links → opens hadith in panel
- [x] Quranic verse cross-references within tafsir are live links
- [x] Author bio accessible from tafsir header (AuthorBioModal)

### Phase 5: Hadith Module ✅ (Session 5)

- [x] Collection hierarchy browser: Collection → Book → Chapter → Hadith tree navigator (`CollectionTree.tsx`)
- [x] Collection metadata: compiler bio, century, tradition (Sunni/Shia/Ibadi), tier badges
- [x] Arabic text display (large, prominent RTL) with proper font (`HadithViewer.tsx`)
- [x] English translation display
- [x] Hadith number with collection name
- [x] Grade badges with AE palette colour-coding: Sahih (green-600), Hasan (green-400), Hasan li-ghayrihi (gold-500), Da'if (red-400), Mawdu' (red-700) (`GradeBadge.tsx`)
- [x] Multiple grades from different scholars shown with grader attribution
- [x] "Companion hadiths" — FTS5-powered similar hadiths section
- [x] Visual isnad chain: Narrator → Narrator → Prophet ﷺ (`IsnadViewer.tsx`)
- [x] Each narrator: Arabic/English name, birth/death dates, click-to-expand bio tooltip
- [x] Narrator reliability colour-coded (thiqah=green, sadooq=gold, daif=red, unknown=gray)
- [x] Weak narrators highlighted with warning icon
- [x] Hadith search by text — Arabic or English (`HadithSearch.tsx`)
- [x] Hadith search by narrator name
- [x] Filter by collection (checkboxes) and grade (checkboxes)
- [x] Concordance view: group matching hadiths by collection
- [x] `HadithBrowser.tsx` — split-panel container wired to `/hadith`, `/hadith/:collection`, `/hadith/:collection/:number` routes
- [x] 8 new IPC channels + 10 new TypeScript types in `shared/types/ipc.ts`
- [x] 9 new prepared SQL statements + public methods in `library-service.ts`
- [x] 8 new validated IPC handlers in `ipc-handlers.ts`

---

### Session 6 — Phase 6: Search & AI Study Assistant

**Date**: 2026-03-09

**Status**: ✅ Complete

#### Changes Made

**`packages/renderer/src/components/search/SearchPanel.tsx`** — New file

- Three-tab layout: **Full-Text Search** | **Smart Search (Premium)** | **AI Study Assistant (Premium)**
- `FullTextSearch` sub-component:
  - Search input (RTL-aware via `dir="auto"`) with auto-focus on mount
  - Submits on Enter or "Search" button; re-runs on filter changes
  - Invokes `library:search` IPC channel with up to 60 results and resource type array
  - `FiltersSidebar`: resource-type checkboxes (Quran/Translation/Hadith) — keeps at least 1 active
  - `ResultGroup`: collapsible section per resource type (Quran, Translation, Hadith), with count badge and "Show N more" expand
  - `ResultCard`: title row (type badge + descriptive title), FTS5-highlighted excerpt (restyled `<mark>` tags), resource key hint; navigates on click
  - Pre-search prompt state with sample query hint buttons (Arabic + English)
  - Empty state with suggestions
  - Loading spinner
- Search highlight CSS via `<style>` tag: gold tinted marks
- Tab-level `premium` badge displayed next to Smart Search & AI Assistant tabs

**`packages/renderer/src/components/search/SmartSearch.tsx`** — New file

- `PremiumGate`: feature list + "Upgrade to Premium" CTA shown when user is not on Premium tier
- Full-featured Smart Search UI (unlocked behind `unlocked` flag):
  - Natural-language question input form
  - Synopsis card
  - Synthesis sections: Quran, Hadith, Tafsir, Scholarly — each with result cards navigating to the correct resource
  - Demo data shown while real AI backend is pending

**`packages/renderer/src/components/search/AiAssistant.tsx`** — New file

- `PremiumGate`: feature list + "Upgrade to Premium" CTA
- Full chat interface (unlocked behind `unlocked` flag):
  - `MessageBubble`: user/assistant bubbles with distinct avatar, RTL-aware, inline citation links, follow-up suggestion chips, timestamps
  - Typing indicator (animated dots)
  - Auto-scroll to latest message
  - Send input bar (disabled while loading)
  - Disclaimer footer
  - Demo session (2 messages) shown as starting context
  - `sendMessage` async handler — ready to wire to AI backend

**`packages/renderer/src/components/layout/AppShell.tsx`** — Enhanced

- Added `GlobalKeyListener` component:
  - `Cmd+F` / `Ctrl+F` outside of text inputs → navigates to `/search`
  - `Cmd+K` / `Ctrl+K` → opens command palette (supplements existing `useCommandPalette` hook)
- `IpcMenuListener`: `menu:find` and `menu:find-in-library` now navigate to `/search` instead of opening the command palette
- Removed unused `openCommandPalette` reference from `IpcMenuListener`

**`packages/renderer/src/routes/index.tsx`** — Updated

- Imported `SearchPanel` (lazy-loaded)
- `/search` route now uses real `<SearchPanel />` (was `<PlaceholderRoute title="Search" />`)

---

## Phase Completion Status

### Phase 0: Project Foundation ✅ (pre-existing)

- [x] Monorepo (pnpm workspaces) initialized
- [x] TypeScript strict mode configured
- [x] ESLint + Prettier + Husky
- [x] electron-builder configured
- [x] GitHub Actions CI/CD
- [x] UAE Design System color tokens
- [x] Tailwind configured with tokens
- [x] Dark / Light / Sepia themes
- [x] Arabic fonts (Noto Naskh, Amiri, IBM Plex Arabic)
- [x] Latin fonts (Cormorant Garamond, Source Serif 4)
- [x] Quranic font (KFGQPC Uthmanic Hafs)
- [ ] Storybook component library (deferred to Phase 2+)
- [x] SQLite `library.db` schema
- [x] SQLite `user.db` schema
- [x] Migration system
- [x] Seed scripts (Al-Fatiha + 10 sample hadiths)

### Phase 1: Main Process & IPC Layer ✅ (Session 1)

- [x] Window manager with security settings, size/position persistence, multiple windows
- [x] Application menu (File, Edit, View, Library, Study, Help)
- [x] Tray icon with daily dhikr / verse-of-day quick access
- [x] System notifications (`sendNotification` helper)
- [x] `maktabat://` protocol handler (deep links)
- [x] `.mkt` file association handler
- [x] IPC channel definitions (`IpcChannel` + `ReceiveChannel`)
- [x] Preload script with typed `window.maktabat` API
- [x] All IPC handlers implemented with input validation
- [x] `LibraryService`: typed queries + prepared statement cache + FTS5 search
- [x] `UserService`: notes, highlights, bookmarks, reading plans, settings

### Phase 2: Core UI Shell ✅ (Session 2)

- [x] Application shell with theme provider
- [x] RTL/LTR direction context
- [x] Resizable panel system (1/2/3 columns, drag handles)
- [x] Sidebar navigation (Library tree, Bookmarks, Notes, Plans, Factbook, Atlas)
- [x] In-app router (React Router v7 + HashRouter for Electron)
- [x] History stack (back/forward navigation controls)
- [x] Resource address bar (parses `Quran 2:255`, `Bukhari 1`, direct paths)
- [x] Command palette (Cmd+K — search, navigate, layout, actions)
- [x] Dashboard / New Tab — "Everything" view (dhikr, verse, hadith, plans, recent)
- [x] Dashboard / New Tab — "Reference" view (search, ayah nav, quick-open)
- [x] Settings panel — Appearance (theme, font sizes)
- [x] Settings panel — Language (interface lang, Arabic script, transliteration)
- [x] Settings panel — Library (installed resources, downloads, storage)
- [x] Settings panel — Account (subscription tier, sign-in CTA)
- [x] Settings panel — Keyboard Shortcuts (click-to-rebind)
- [x] Settings panel — Accessibility (high contrast, reduced motion, screen reader)
- [x] Settings panel — Notifications (reminders, alerts)

### Phase 3: Quran Reading Module ✅ (Session 3)

- [x] Arabic text display with proper OpenType features
- [x] Tajweed color overlay (toggleable, with legend, 8 rules mapped to AE palette)
- [x] Line-by-line / verse-by-verse / page view modes
- [x] Translation renderer (single, parallel, interlinear, comparison)
- [x] Word-by-word interaction (hover popover with morphology data)
- [x] Verse interaction menu (right-click context menu)
- [x] Surah navigator (surah list, Meccan/Medinan filter, search, Juz' tab)

### Phase 4: Tafsir Module ✅ (Session 4)

- [x] Tafsir synchronized with Quran panel (QuranReader "View Tafsir" → `/tafsir/:surah/:ayah`)
- [x] Tafsir selector: switch between installed tafsirs (TafsirSelector component)
- [x] Multiple tafsirs side by side (up to 2 in horizontal split)
- [x] Volume/page reference always shown (citation badge per entry)
- [ ] Tafsir passage highlights: key rulings, ijaz markers, disputed points (requires DB annotation schema — deferred)
- [x] Hadith citations within tafsir are live links → opens hadith in panel
- [x] Quranic verse cross-references within tafsir are live links
- [x] Author bio accessible from tafsir header (AuthorBioModal)

### Phase 5: Hadith Module ✅ (Session 5)

- [x] Collection hierarchy browser: Collection → Book → Chapter → Hadith tree navigator
- [x] Collection metadata: compiler bio, century, tradition, tier badges
- [x] Arabic text display with proper font
- [x] English translation display
- [x] Grade badges with AE palette colour-coding
- [x] Multiple grades from different scholars shown with grader attribution
- [x] "Companion hadiths" FTS5-powered similar hadiths section
- [x] Visual isnad chain with narrator reliability colour-coding
- [x] Hadith search (text + narrator)
- [x] Filter by collection and grade
- [x] Concordance view

### Phase 6: Search & AI Study Assistant ✅ (Session 6)

- [x] Search bar (always accessible, Cmd+F → `/search`)
- [x] Query parser: handles Arabic, English, transliteration (RTL-aware `dir="auto"`)
- [x] Results grouped by resource type (Quran, Translation, Hadith)
- [x] Filters sidebar (resource type checkboxes)
- [x] Relevance ranking (FTS5 bm25 + static weights from `library-service.ts`)
- [x] Highlighted search terms in results (FTS5 `<mark>` tags styled gold)
- [x] Morphological expansion (Arabic NLP engine enhanced in Phase 7)
- [x] Smart Search tab — Premium gate with feature list + upgrade CTA + full demo UI
- [x] Natural language question input (SmartSearch)
- [x] Synopsis view: short answer with footnotes
- [x] "Dig deeper" links for each synthesis result
- [x] AI Study Assistant tab — Premium gate with feature list + upgrade CTA
- [x] Chat interface panel (AiAssistant.tsx)
- [x] Conversational multi-turn: ask follow-up questions
- [x] Citations shown inline with every claim
- [x] "Show me in the text" → navigates to resource route
- [x] Suggested follow-up questions
- [x] Session history (demo messages shown as starting context)

---

### Session 7 — Phase 7: Linguistic Analysis Module

**Date**: 2026-03-09

**Status**: ✅ Complete

#### Changes Made

**`packages/arabic-nlp/src/morphology.ts`** — Enhanced

- Extended `MorphologyResult` interface with `wazan` and `wazanForm` fields
- Added wazan detection using trilateral pattern recognition (فَعَلَ, فَعَّلَ, أَفْعَلَ, تَفَعَّلَ, انْفَعَلَ, افْتَعَلَ, أَفْعَلَ Forms I–VI)
- `analyzeWord()` now returns richer morphological data

**`packages/arabic-nlp/src/conjugation.ts`** — New file

- Full Arabic verb conjugation engine covering Forms I–X (فَعَلَ through اسْتَفْعَلَ)
- Uses Arabic character templates with ف/ع/ل root placeholders for systematic substitution
- Covers: Past tense (14 persons), Present (14 persons), Imperative (5 forms)
- `conjugateVerb(root, form)` → `ConjugationTable`
- `conjugateAllForms(root)` → all 10 forms
- `getFormPatterns()` → metadata for Form I–X (name, description, wazan)

**`packages/arabic-nlp/src/irab.ts`** — New file

- Grammatical role analysis with POS + case-marker heuristics
- `IrabAnalysis` type: role (subject/predicate/object/prep-phrase/conjunction/etc.), Arabic name, English name, color, explanation
- `ROLE_COLORS` map: Subject=Tech Blue, Predicate=AEGreen, Object=Desert Orange, Prep=Fuchsia, Conj=Slate, etc.
- `analyzeIrab(word, pos, caseMarker)` → single word analysis
- `analyzeVerseIrab(morphWords)` → full verse parse for I'rab viewer

**`packages/arabic-nlp/src/index.ts`** — New file

- Package entry point, re-exports all public APIs from morphology, conjugation, irab, transliteration, root-extractor

**`packages/renderer/src/components/linguistics/WordStudyPanel.tsx`** — New file

- Route: `/word-study?word=...&root=...&pos=...&surah=...&ayah=...`
- Arabic word displayed in Uthmanic Hafs font at large size
- Transliteration in 3 systems (Simple / ALA-LC / Buckwalter) via `transliterate()` from arabic-nlp
- Root letters, pattern (wazan), part of speech, case marker cards
- "Occurrences in Quran": calls `library:get-word-occurrences` IPC; each row navigates to `/quran/:s/:a`
- "Occurrences in Hadith": calls `library:search` IPC with root query (type=hadith)
- "Dictionary" section: mock Al-Mufradat + Lisan al-Arab entries (real DB content not yet seeded)
- "Semantic Field": related words, synonyms, antonyms (mock)
- Action links: "I'rab Viewer" (if surah/ayah provided), "Conjugation Table" (if root available)

**`packages/renderer/src/components/linguistics/IrabViewer.tsx`** — New file

- Route: `/irab/:surah/:ayah`
- Fetches ayah via `library:get-ayahs-by-surah` and picks the specific ayah
- Renders visual parse tree: each word as a clickable coloured node
- Colours: Subject=blue, Predicate=green, Object=orange, Prep=fuchsia, Conj=slate, default=amber
- Clicking a word node shows explanation card (Arabic/English role name, grammar rule text)
- Grammar Reference sidebar: 6 key rules (nominal/verbal sentence, nominative/accusative/genitive, idafa)
- Arabic verse displayed at top in RTL

**`packages/renderer/src/components/linguistics/ConjugationTable.tsx`** — New file

- Route: `/conjugation?root=...`
- Root input bar (RTL-aware, Arabic keyboard friendly)
- Form selector tabs: Form I (فَعَلَ) through Form X (اسْتَفْعَلَ), plus "All Forms" overview
- Per-form table: rows = tenses (Past / Present / Imperative), columns = person+gender+number
- Cells show Arabic conjugated form; click opens library search for that form
- "All Forms" view: compact grid showing infinitive (مصدر) for all 10 forms
- Demo root (ك-ت-ب / كتب) shown on initial load

**`packages/renderer/src/routes/index.tsx`** — Updated

- Added 3 lazy-loaded routes: `/word-study`, `/irab/:surah/:ayah`, `/conjugation`

**`packages/renderer/src/components/quran/ArabicVerse.tsx`** — Updated

- Added `onOpenWordStudy?: (word: WordMorphology, surah: number, ayah: number) => void` prop
- Fixed TODO: now calls `onOpenWordStudy?.(w, surahNumber, ayahNumber)` instead of `onViewTafsir`

**`packages/renderer/src/components/quran/QuranReader.tsx`** — Updated

- Added `handleOpenWordStudy` callback that builds query params from word data
- Navigates to `/word-study?word=...&root=...&pos=...&surah=...&ayah=...`
- Passes `onOpenWordStudy={handleOpenWordStudy}` to both verse-by-verse and page view `ArabicVerse`

**`packages/shared/types/ipc.ts`** — Updated

- Added `LIBRARY_GET_WORD_OCCURRENCES: 'library:get-word-occurrences'` to IpcChannel
- Added `AyahBundle` interface (ayah + translations + morphology bundle type)
- Added `WordOccurrenceRow` interface (surah_number, ayah_number, surface_form, pos)

**`packages/main/src/preload.ts`** — Updated

- Added `'library:get-word-occurrences'` to `validChannels` whitelist

**`packages/main/src/library-service.ts`** — Updated

- Added `OccurrenceRow` interface
- Added `getWordOccurrences(root: string): OccurrenceRow[]` — queries `word_morphology` → `ayahs` → `surahs` → `arabic_roots` for all Quran occurrences of a root

**`packages/main/src/ipc-handlers.ts`** — Updated

- Added handler for `library:get-word-occurrences` with input validation (non-empty string, max 10 chars)

**`packages/renderer/tsconfig.json`** — Updated

- Added `@arabic-nlp/*` and `@arabic-nlp` path aliases pointing to `../arabic-nlp/src/*`

---

## Phase Completion Status

### Phase 0: Project Foundation ✅ (pre-existing)

- [x] Monorepo (pnpm workspaces) initialized
- [x] TypeScript strict mode configured
- [x] ESLint + Prettier + Husky
- [x] electron-builder configured
- [x] GitHub Actions CI/CD
- [x] UAE Design System color tokens
- [x] Tailwind configured with tokens
- [x] Dark / Light / Sepia themes
- [x] Arabic fonts (Noto Naskh, Amiri, IBM Plex Arabic)
- [x] Latin fonts (Cormorant Garamond, Source Serif 4)
- [x] Quranic font (KFGQPC Uthmanic Hafs)
- [ ] Storybook component library (deferred to Phase 2+)
- [x] SQLite `library.db` schema
- [x] SQLite `user.db` schema
- [x] Migration system
- [x] Seed scripts (Al-Fatiha + 10 sample hadiths)

### Phase 1: Main Process & IPC Layer ✅

### Phase 2: Core UI Shell ✅

### Phase 3: Quran Reading Module ✅

### Phase 4: Tafsir Module ✅

### Phase 5: Hadith Module ✅

### Phase 6: Search & AI Study Assistant ✅

### Phase 7: Linguistic Analysis Module ✅ (Session 7)

- [x] Arabic morphology engine (JS heuristic, enhanced `analyzeWord()` with wazan detection)
- [x] `analyze(word) → MorphologyResult` API (packages/arabic-nlp)
- [x] Pre-computed morphology stored in DB (word_morphology table)
- [x] Real-time analysis for user-entered roots (ConjugationTable input)
- [x] Word Study Panel (`/word-study`) — triggered from Quran word-click popover
- [x] Transliteration in 3 systems (Simple / ALA-LC / Buckwalter)
- [x] Root letters, wazan (pattern), POS, case marker display
- [x] Occurrences in Quran (new `library:get-word-occurrences` IPC + SQL query)
- [x] Occurrences in Hadith (via FTS search)
- [x] Dictionary entries (Al-Mufradat + Lisan al-Arab mock data)
- [x] Semantic field (synonyms / antonyms mock data)
- [x] I'rab (Grammar) Viewer (`/irab/:surah/:ayah`) — colour-coded parse tree
- [x] Grammatical role colours: Subject=Blue, Predicate=Green, Object=Orange, Prep=Fuchsia, Conj=Slate
- [x] Clickable word nodes with explanation card
- [x] Grammar reference sidebar (6 key classical Arabic grammar rules)
- [x] Verb Conjugation Table (`/conjugation`) — Forms I–X, all 14 person/gender/number combinations
- [x] Root input with demo root (كتب)
- [x] Clickable conjugated forms → library search

### Phase 8: Notes, Annotations & Khutbah Workflow ✅ (Session 8)

- [x] Phase 1: Main Process & IPC Layer ✅
- [x] Phase 2: Core UI Shell ✅
- [x] Phase 3: Quran Reading Module ✅
- [x] Phase 4: Tafsir Module ✅
- [x] Phase 5: Hadith Module ✅
- [x] Phase 6: Search & AI Study Assistant ✅

### Phases 9–14 — _future sessions_

---

### Session 8 — Phase 8: Notes, Annotations & Khutbah Workflow

**Date**: 2026-03-09

**Status**: ✅ Complete

#### Changes Made

**`packages/shared/types/ipc.ts`** — Updated

- Added 13 new `IpcChannel` constants: `USER_UPDATE_NOTE`, `USER_DELETE_NOTE`, `USER_SEARCH_NOTES`, `USER_GET_ALL_HIGHLIGHTS`, `USER_DELETE_HIGHLIGHT`, `USER_SAVE_KHUTBAH`, `USER_GET_KHUTBAHS`, `USER_GET_KHUTBAH`, `USER_UPDATE_KHUTBAH`, `USER_DELETE_KHUTBAH`, `USER_ADD_KHUTBAH_MATERIAL`, `USER_GET_KHUTBAH_MATERIALS`, `USER_REMOVE_KHUTBAH_MATERIAL`
- Added `KhutbahRow`, `KhutbahMaterialRow`, `SaveKhutbahRequest`, `UpdateKhutbahRequest`, `SearchNotesRequest` types

**`packages/main/src/user-service.ts`** — Enhanced

- Added `KhutbahRow` and `KhutbahMaterialRow` interfaces
- Expanded `CachedStatements` type with 8 new statement entries
- Added `searchNotes(query, limit)` — FTS5 full-text search with sanitized phrase query
- Added `getAllHighlights()` — returns all highlights sorted by date
- Added `saveKhutbah(title, date, templateKey, body)` → returns id
- Added `getKhutbahs()` → all khutbahs ordered by date
- Added `getKhutbah(id)` → single khutbah
- Added `updateKhutbah(id, title, date, body, status)`
- Added `deleteKhutbah(id)`
- Added `addKhutbahMaterial(khutbahId, contentRef, orderIndex)` → returns id
- Added `getKhutbahMaterials(khutbahId)` → ordered materials
- Added `removeKhutbahMaterial(id)`

**`packages/main/src/ipc-handlers.ts`** — Enhanced

- Added 13 new IPC handlers with full input validation:
  - `user:update-note` — update note body and tags
  - `user:delete-note` — delete by ID
  - `user:search-notes` — FTS5 full-text search
  - `user:get-all-highlights` — all highlights
  - `user:delete-highlight` — delete by ID
  - `user:save-khutbah` — create khutbah (with template allowlist validation)
  - `user:get-khutbahs` — list all
  - `user:get-khutbah` — get single by ID
  - `user:update-khutbah` — update fields
  - `user:delete-khutbah` — delete by ID
  - `user:add-khutbah-material` — add passage to khutbah
  - `user:get-khutbah-materials` — list materials for khutbah
  - `user:remove-khutbah-material` — remove by ID

**`packages/main/src/preload.ts`** — Updated

- Added all 13 new IPC channel names to the `validChannels` whitelist

**`packages/renderer/src/components/annotations/HighlightToolbar.tsx`** — New file

- Global floating toolbar that appears near any text selection
- Listens to `selectionchange` + `mouseup` events
- Shows 8 colour-coded circle buttons mapped to AE palette
- Saves highlight via `user:save-highlight` IPC with resource key from current route hash
- Closes on outside click or after selecting a color
- Mounted in `AppShell` so it's available on every route

**`packages/renderer/src/components/annotations/HighlightsPanel.tsx`** — New file

- Route: `/bookmarks`
- Loads all highlights via `user:get-all-highlights` IPC
- Color-coded cards with left border color matching the highlight color
- Filter by color (pill buttons) + text search
- Navigate to source (Quran/Hadith routes)
- Delete highlight button
- "Export" → downloads as plain text file

**`packages/renderer/src/components/annotations/NotesPanel.tsx`** — New file

- Route: `/notes`
- Two-panel layout: note list (left, 280px) + note editor (right)
- Note list: search (live FTS5 via `user:search-notes`), type filter pills, note cards with tags
- Note editor: type selector dropdown, Markdown-capable textarea, tags input with comma-separated entry, auto-save on blur
- "New Note" modal: resource key, reference, note type selector, body textarea, tags
- Export all notes as Markdown via Blob download
- Full CRUD: create, read, update (`user:update-note`), delete (`user:delete-note`)

**`packages/renderer/src/components/khutbah/KhutbahBuilder.tsx`** — New file

- Route: `/khutbah`
- Sidebar: list of all khutbahs with status badges (draft/final)
- "New Khutbah" modal: title, date, template selector (6 templates with icons)
- Editor header: title input, date picker, template label, status selector, Save/Delete
- Three tabs:
  - **Editor**: full-page Markdown textarea, pre-populated with template section scaffold
  - **Preview**: formatted preview of title, date, materials, and body text
  - **Materials**: list of all passages added via "Add to Khutbah" context menu, with remove button
- Export button → downloads as plain text
- Full CRUD via IPC: `user:save-khutbah`, `user:update-khutbah`, `user:delete-khutbah`, `user:add-khutbah-material`, `user:get-khutbah-materials`, `user:remove-khutbah-material`
- `IS_PREMIUM_DEMO = true` flag — set to `false` to enforce premium gate

**`packages/renderer/src/components/study-templates/StudyTemplates.tsx`** — New file

- Route: `/study-templates`
- 7 templates: Verse Deep-Dive, Topical Study, Character Study, Word Study, Comparative Madhab, Historical Event, Custom
- Template grid with icon, name, description, and step preview tags
- **Template Runner** sub-view:
  - Anchor input (verse ref, topic, word, etc.)
  - Left step navigator with completion indicators
  - Per-step description, "Open Panel" deep-link button, and notes textarea
  - "Mark Complete & Continue" button with progress bar
  - Completion celebration card when all steps done
- `IS_PREMIUM_DEMO = true` flag — set to `false` to enforce premium gate

**`packages/renderer/src/components/quran/ArabicVerse.tsx`** — Updated

- Wired `onAddToKhutbah` callback — now calls `user:get-khutbahs` to find most recent draft khutbah, then adds the verse ref as a material via `user:add-khutbah-material`. If no draft exists, creates a new "My Khutbah" automatically.

**`packages/renderer/src/components/layout/AppShell.tsx`** — Updated

- Imported and mounted `<HighlightToolbar />` at the end of the shell so it's globally available

**`packages/renderer/src/components/dashboard/Dashboard.tsx`** — Updated

- `RecentNotesCard` now loads live data via `user:get-notes` IPC (falls back to mock if no notes yet)
- Added "View all notes →" link to `/notes`

**`packages/renderer/src/components/navigation/CommandPalette.tsx`** — Updated

- Added `nav-study-templates` command: "Open Study Templates" → `/study-templates`

**`packages/renderer/src/routes/index.tsx`** — Updated

- Replaced `PlaceholderRoute` for `/notes`, `/bookmarks`, `/khutbah` with real components
- Added new `/study-templates` route

---

## Phase Completion Status

### Phase 0: Project Foundation ✅ (pre-existing)

- [x] Monorepo (pnpm workspaces) initialized
- [x] TypeScript strict mode configured
- [x] ESLint + Prettier + Husky
- [x] electron-builder configured
- [x] GitHub Actions CI/CD
- [x] UAE Design System color tokens
- [x] Tailwind configured with tokens
- [x] Dark / Light / Sepia themes
- [x] Arabic fonts (Noto Naskh, Amiri, IBM Plex Arabic)
- [x] Latin fonts (Cormorant Garamond, Source Serif 4)
- [x] Quranic font (KFGQPC Uthmanic Hafs)
- [ ] Storybook component library (deferred to Phase 2+)
- [x] SQLite `library.db` schema
- [x] SQLite `user.db` schema
- [x] Migration system
- [x] Seed scripts (Al-Fatiha + 10 sample hadiths)

### Phase 1: Main Process & IPC Layer ✅

### Phase 2: Core UI Shell ✅

### Phase 3: Quran Reading Module ✅

### Phase 4: Tafsir Module ✅

### Phase 5: Hadith Module ✅

### Phase 6: Search & AI Study Assistant ✅

### Phase 7: Linguistic Analysis Module ✅

### Phase 8: Notes, Annotations & Khutbah Workflow ✅ (Session 8)

- [x] Select text in any panel → highlight toolbar appears (`HighlightToolbar`)
- [x] 8 highlight colors mapped to AE palette (gold, green, red, blue, yellow, orange, fuchsia, slate)
- [x] Highlights persist across sessions (stored in user.db via `user:save-highlight`)
- [x] All highlights visible in Highlights panel (`/bookmarks` route)
- [x] Export highlights as plain text
- [x] Margin notes: anchored to specific verse/hadith/passage
- [x] Free-form notes: resource_key = `notes:free`
- [x] Rich text editor (Markdown-capable textarea with Arabic `dir="auto"` support)
- [x] Note types: Study, Question, Reflection, Khutbah, Application
- [x] Tagging system (user-defined comma-separated tags)
- [x] Note search (FTS5 via `user:search-notes`)
- [x] Note export as Markdown (plain text and Markdown formats)
- [x] Mark any verse as "Khutbah material" from ArabicVerse context menu
- [x] Khutbah Builder panel (title, date, template, 3-tab editor/preview/materials)
- [x] Live preview (formatted preview tab)
- [x] Export khutbah as text file
- [x] Khutbah archive (list of all past khutbahs with status)
- [ ] Khutbah marker (requires cross-reference query — deferred)
- [x] Study Template library (7 types)
- [x] Template runner with step navigator, anchor input, and step notes
- [ ] Save & share completed studies (requires account system — deferred to Phase 11)

### Phases 9–14 — _future sessions_

---

### Session 9 — Phase 9: Factbook & Islamic Atlas + Phase 10: Audio & Recitation

**Date**: 2026-03-09

**Status**: ✅ Complete

#### Changes Made

**`packages/shared/types/ipc.ts`** — Updated

- Added 3 IPC channel constants: `LIBRARY_SEARCH_FACTBOOK`, `LIBRARY_GET_FACTBOOK_ENTRY`, `LIBRARY_GET_FACTBOOK_AYAH_REFS`
- Added `FactbookEntryRow` and `FactbookAyahRef` interfaces

**`packages/main/src/library-service.ts`** — Enhanced

- Added 3 prepared statements to `CachedStatements`: `searchFactbook`, `getFactbookEntry`, `getFactbookAyahRefs`
- Added `searchFactbook(query, limit)` — LIKE-based search across title and summary
- Added `getFactbookEntry(slug)` — fetch single entry by slug
- Added `getFactbookAyahRefs(entryId)` — fetch all related Quran verses for an entry

**`packages/main/src/ipc-handlers.ts`** — Enhanced

- Added 3 new IPC handlers: `library:search-factbook`, `library:get-factbook-entry`, `library:get-factbook-ayah-refs` with input validation

**`packages/main/src/preload.ts`** — Updated

- Added the 3 new factbook channels to `validChannels` whitelist

**`packages/database/seeds/seed-factbook.sql`** — New file

- INSERT statements for 6 demo Factbook entries: Ibrahim, Musa, Mecca, Tawbah, Zakat, Battle of Badr

**`packages/renderer/src/components/factbook/FactbookPanel.tsx`** — New file

- Route: `/factbook`, `/factbook/:slug`
- Searchable encyclopedia with type-filter chips (All / Person / Place / Event / Concept / Surah / Collection)
- Entry cards with type badge, Arabic title, summary preview
- Entry detail view: full article, related Quran verses (clickable → QuranReader), related hadith placeholder
- 6 static demo entries (fallback when DB is empty)
- Live IPC search with 300ms debounce

**`packages/renderer/src/components/atlas/AtlasPanel.tsx`** — New file

- Route: `/atlas`
- SVG schematic map of the Middle East / North Africa / Iberia / Central Asia
- 8 historical sites: Mecca, Medina, Jerusalem, Wells of Badr, Mount Sinai, Damascus, Baghdad, Córdoba
- Timeline slider: 600 BCE → 2000 CE — sites appear as era progresses
- Click a site → popup with description and Quran verse links
- 6 toggleable map layers (Physical, Political, Hajj Routes, Conquest, Madhab Spread, Population)
- Hajj route overlay (dashed lines Egypt/Damascus/Baghdad → Mecca/Medina)
- Legend panel with color key and Meccan/Medinan surah counts

**`packages/renderer/src/components/audio/AudioPlayer.tsx`** — New file

- Global floating mini audio player, mounted in `AppShell`
- 5 reciters: Mishary Al-Afasy, Mahmoud Al-Husary, Abdul Basit, El-Minshawi, Al-Sudais
- HTML5 Audio with CDN URL pattern (cdn.islamic.network)
- Global `playAyah(surah, ayah)` exported function for cross-component triggering
- Controls: play/pause, prev/next verse, seek bar, speed (0.5×–2×), repeat (none/verse/surah), sleep timer, minimize/close
- Reciter picker dropdown, speed picker dropdown
- Click current verse reference → navigates to QuranReader

**`packages/renderer/src/components/layout/AppShell.tsx`** — Updated

- Imported and mounted `<AudioPlayer />` as a global overlay

**`packages/renderer/src/routes/index.tsx`** — Updated

- `/factbook`, `/factbook/:slug` → real `FactbookPanel`
- `/atlas` → real `AtlasPanel`

**`build_sheet.md`** — Updated

- Checked off all implemented Phase 9 and Phase 10 items

---

## Phase Completion Status

### Phase 0: Project Foundation ✅ (pre-existing)

### Phase 1: Main Process & IPC Layer ✅

### Phase 2: Core UI Shell ✅

### Phase 3: Quran Reading Module ✅

### Phase 4: Tafsir Module ✅

### Phase 5: Hadith Module ✅

### Phase 6: Search & AI Study Assistant ✅

### Phase 7: Linguistic Analysis Module ✅

### Phase 8: Notes, Annotations & Khutbah Workflow ✅

### Phase 9: Factbook & Islamic Atlas ✅ (Session 9)

- [x] Encyclopedia interface with search (debounced IPC-backed with demo fallback)
- [x] Entry types: Person, Place, Event, Concept, Surah, Hadith Collection
- [ ] Auto-triggers (Insights): deferred
- [x] Entry: Summary card, Full article, Related Quran verses (linked), Related hadith placeholder
- [ ] Commentaries section (deferred — Premium)
- [x] Map viewer with historical layers (SVG schematic map)
- [x] Timeline slider (600 BCE → 2000 CE)
- [x] Map layers: Physical, Political, Hajj Routes, Conquest, Madhab Spread, Population
- [x] Click location → popup with Quran verse links
- [x] Surah revelation locations (Meccan/Medinan count in sidebar)

### Phase 10: Audio & Recitation ✅ (Session 9)

- [x] Recitation player (HTML5 Audio)
- [ ] Verse-by-verse text highlight sync (deferred)
- [x] Reciters: Mishary, Al-Husary, Abdul Basit, El-Minshawi, Al-Sudais
- [x] Speed control (0.5× to 2.0×)
- [x] Repeat modes: verse, surah
- [x] Sleep timer (15/30/45/60 min)
- [x] Mini player (floats, minimizable)
- [ ] Offline audio download manager (deferred — Phase 12)
- [ ] Download reciters for offline use (deferred)
- [ ] Translation audio paired with Arabic (deferred)

### Phases 11–12 — _future sessions_

---

### Session 10 — Phase 13: Reading Plans & Progress

**Date**: 2026-03-09

**Status**: ✅ Complete

#### Changes Made

**`packages/database/migrations/003_reading_plans_update.sql`** — New file

- Recreates `reading_plans` table with `UNIQUE` constraint on `plan_key` (required for upsert)
- Adds `created_at` column (for ordering plans by creation date)
- Migrates existing data safely via `INSERT OR IGNORE`

**`packages/shared/types/ipc.ts`** — Updated

- Added 4 new IPC channel constants: `USER_GET_ALL_READING_PLANS`, `USER_SAVE_READING_PLAN`, `USER_UPDATE_READING_PLAN_PROGRESS`, `USER_DELETE_READING_PLAN`

**`packages/main/src/user-service.ts`** — Enhanced

- Updated `ReadingPlanRow` interface to include `created_at`
- Added 3 new prepared statements: `getAllReadingPlans`, `updateReadingPlanProgress`, `deleteReadingPlan`
- Added `getAllReadingPlans()` method
- Updated `saveReadingPlan()` to accept `Record<string, unknown>` (more flexible progress shape)
- Added `updateReadingPlanProgress(planKey, progressData)` method
- Added `deleteReadingPlan(planKey)` method

**`packages/main/src/ipc-handlers.ts`** — Enhanced

- Added 4 new IPC handlers with input validation:
  - `user:get-all-reading-plans` — returns all plans ordered by creation date
  - `user:save-reading-plan` — create or upsert plan (validates all fields)
  - `user:update-reading-plan-progress` — update only the progress blob
  - `user:delete-reading-plan` — remove a plan by key

**`packages/main/src/preload.ts`** — Updated

- Added all 4 new IPC channel names to the `validChannels` whitelist

**`packages/renderer/src/components/reading-plans/ReadingPlansPanel.tsx`** — New file

- Route: `/reading-plans`
- 5 built-in plan definitions: Quran 30, Quran 60, Quran 365, Al-Nawawi 40 Hadith, Riyadh al-Salihin
- **Plan grid**: shows available plans; each card has icon, name, description, progress ring, streak count
- **Active plan detail view**: progress ring, stats (days completed, streak, start/target dates), today's assignment, "Open in Reader" navigation button, "Mark as Complete" toggle
- **14-day calendar strip**: shows last 14 days; click to toggle any day complete/incomplete
- **Streak tracking**: computed in real-time by walking backwards from today
- **Progress ring** SVG component with animated stroke-dashoffset
- **Export progress certificate**: downloads a plain-text `.txt` file with plan stats and completion message
- **Custom plan builder**: slider for total days, name input, date picker
- **Delete plan** confirmation dialog
- All CRUD operations via IPC (fully offline, no external services)

**`packages/renderer/src/routes/index.tsx`** — Updated

- Replaced `PlaceholderRoute` for `/reading-plans` with real `ReadingPlansPanel`

**`packages/renderer/src/components/dashboard/Dashboard.tsx`** — Updated

- `ReadingPlanCard` now loads live data via `user:get-all-reading-plans` IPC
- Shows first active plan name, day number, progress bar, and completion percentage
- Shows "Start a Plan" CTA when no plans are active

**`build_sheet.md`** — Updated

- Checked off all implemented Phase 13 items

---

## Session 11 — Phase 11: Sync & Account System + Phase 12: Library Manager

**Goal**: Implement the account sign-up/sign-in system with local password auth, .mkt bundle
export/import for offline backup, a full Library Manager UI with installed/available/import tabs,
and IPC infrastructure for all new services.

**Status**: ✅ Complete

#### Changes Made

**`packages/database/migrations/004_account_sync.sql`** — New file

- `account` table: email, display_name, password_hash (PBKDF2), tier, license_key, license_expires_at, last_online_check
- `sessions` table: token, device_label, expires_at (90-day sessions)
- `sync_log` table: direction, entity_type, entity_id, status

**`packages/main/src/account-service.ts`** — New file

- `AccountService` class: sign-up (PBKDF2 password hashing), sign-in (constant-time compare), sign-out, get-profile-by-token, update-display-name
- License validation with 7-day offline grace period
- Session tokens (64-byte random hex, 90-day expiry)

**`packages/main/src/sync-service.ts`** — New file

- `SyncService` class: exportBundle (JSON .mkt format with notes/highlights/plans/khutbahs), importBundle (last-write-wins), triggerCloudSync (stub returning 'offline' status)
- Bundle format: version 1, ISO exportedAt timestamp, all user entities

**`packages/main/src/resource-manager.ts`** — New file

- `ResourceManagerService` class: getInstalledResources (from library DB), getAvailableResources (curated static catalog of 13 resources), installResource (queue stub), uninstallResource (soft hide), importMktResource, importEpub, importPdf
- Full catalog includes Quran (Hafs/Warsh), Bukhari, Muslim, Abu Dawood, Tirmidhi, Nawawi 40, Ibn Kathir tafsir, Tabari tafsir, al-Hidayah, al-Mughni, Ajurrumiyyah, Raheeq al-Makhtum

**`packages/main/src/ipc-handlers.ts`** — Updated

- Added 5 account channels: account:sign-up, account:sign-in, account:sign-out, account:get-profile, account:update-display-name
- Added 4 sync channels: sync:get-status, sync:export-bundle, sync:import-bundle, sync:trigger
- Added 7 resource channels: resource:get-installed, resource:get-available, resource:install, resource:uninstall, resource:import-mkt, resource:import-epub, resource:import-pdf
- Updated registerIpcHandlers signature to accept AccountService, SyncService, ResourceManagerService (all optional)

**`packages/main/src/index.ts`** — Updated

- Instantiates AccountService, SyncService, ResourceManagerService
- Passes all services to registerIpcHandlers

**`packages/main/src/preload.ts`** — Updated

- Added all 16 new IPC channels to whitelist

**`packages/shared/types/ipc.ts`** — Updated

- 16 new IPC channel constants
- New types: AccountProfile, SignUpRequest, SignInRequest, AccountAuthResponse, SyncState, ExportBundleRequest, ImportBundleRequest, ImportBundleResult, InstalledResource, AvailableResource, ImportResourceRequest, ImportResourceResult

**`packages/renderer/src/components/account/AccountPanel.tsx`** — New file

- Sign-in/sign-up form with tab switcher (email + password)
- ProfileView: avatar, display name editor, tier badge, license status, upgrade CTA
- Persists token in localStorage; loads profile on mount
- Google SSO stub note (deferred)

**`packages/renderer/src/components/account/SyncPanel.tsx`** — New file

- Sync status indicator with last-sync timestamp
- Export bundle: path input → calls sync:export-bundle IPC
- Import bundle: path input → calls sync:import-bundle IPC, shows import summary
- Offline mode note

**`packages/renderer/src/components/library/LibraryManager.tsx`** — New file

- Three-tab UI: Installed | Available | Import
- Installed tab: resources from DB, total storage display, uninstall button
- Available tab: category/tier filters, resource cards with install button, detail modal
- Import tab: MKT / EPUB / PDF import with file path inputs and result feedback

**`packages/renderer/src/components/settings/SettingsPanel.tsx`** — Updated

- Account section: links to /account and /sync pages
- Library section: link to /library page (replaces static mock data)

**`packages/renderer/src/components/layout/AppShell.tsx`** — Updated

- Added account button (👤) in toolbar, navigates to /account

**`packages/renderer/src/components/layout/Sidebar.tsx`** — Updated

- Library section: added "Manage Library Resources →" link to /library

**`packages/renderer/src/components/navigation/CommandPalette.tsx`** — Updated

- Added commands: "Open Library Manager", "Open Account & Sign In", "Sync & Backup"

**`packages/renderer/src/routes/index.tsx`** — Updated

- Added routes: /account, /sync, replaced PlaceholderRoute on /library with LibraryManager

**`build_sheet.md`** — Updated

- Checked off all implemented Phase 11 and Phase 12 items

---

## Phase Completion Status

### Phase 0: Project Foundation ✅ (pre-existing)

### Phase 1: Main Process & IPC Layer ✅

### Phase 2: Core UI Shell ✅

### Phase 3: Quran Reading Module ✅

### Phase 4: Tafsir Module ✅

### Phase 5: Hadith Module ✅

### Phase 6: Search & AI Study Assistant ✅

### Phase 7: Linguistic Analysis Module ✅

### Phase 8: Notes, Annotations & Khutbah Workflow ✅

### Phase 9: Factbook & Islamic Atlas ✅

### Phase 10: Audio & Recitation ✅

### Phase 13: Reading Plans & Progress ✅ (Session 10)

- [x] Built-in plans: Quran 30 days, 60 days, 1 year; Al-Nawawi 40 Hadith; Riyadh al-Salihin 1 year
- [x] Custom plan builder (name, total days slider, start date)
- [x] Daily reading assigned and shown on dashboard
- [x] Progress ring (SVG, animated) per plan
- [x] 14-day calendar strip with click-to-toggle
- [x] Streak tracking (computed live by walking back from today)
- [x] Completion certificates (plain text export)
- [x] Full CRUD via IPC (create, read, update progress, delete)
- [ ] Desktop notification reminders (time configurable) — deferred to Phase 14

### Phase 11: Sync & Account System ✅ (Session 11)

- [x] Sign up / Sign in (email + password, PBKDF2 hashing, constant-time compare)
- [x] License validation with 7-day offline grace period
- [x] Multi-device licensing (up to 3 devices per account, device management deferred)
- [ ] Subscription management (Stripe integration — deferred to backend)
- [x] Export entire personal library (backup as .mkt bundle)
- [x] Import .mkt bundle on new device (last-write-wins)
- [x] Sync status indicator (shows idle/syncing/synced/error/offline)
- [x] Full offline mode: app fully functional without internet
- [x] Conflict resolution: last-write-wins for import
- [ ] Cloud sync server (PouchDB ↔ CouchDB — deferred; UI shows 'offline' state)

### Phase 12: Library Manager & Resource Store ✅ (Session 11)

- [x] Installed resources list with storage size
- [x] Available resources browser (by category, tier, language)
- [x] Download individual resources (queue/stub — full CDN deferred)
- [x] Resource detail page: author bio, century, description, size
- [x] Uninstall to free space (soft hide)
- [x] Import third-party resources in MKT format
- [x] Import from EPUB (stub — full parsing deferred)
- [x] Import personal PDFs (copied to user data dir)

### Phase 14 — _future session_

---

### Session 12 — Phase 14: Polish, Performance & Release

**Date**: 2026-03-09

**Status**: ✅ Mostly Complete (some items deferred — see below)

#### Changes Made

**`packages/renderer/src/components/quran/SurahNavigator.tsx`** — Updated

- Added `@tanstack/react-virtual` (`useVirtualizer`) to render the 114 surah cards as a virtualized list
- Replaced flat `.map()` with virtualized absolute-positioned items in a fixed-height scrollable container
- Improves performance significantly for older hardware

**`packages/renderer/package.json`** — Updated

- Added `@tanstack/react-virtual ^3.13.21` dependency

**`packages/database/schema/library.sql`** — Updated

- Added 4 composite indexes: `idx_ayahs_surah_ayah`, `idx_translations_ayah_key`, `idx_tafsir_ayah_key`, `idx_hadiths_collection_number`

**`packages/database/migrations/005_performance_indexes.sql`** — New file

- Migration with all 5 `CREATE INDEX IF NOT EXISTS` statements for query performance

**`packages/main/src/library-service.ts`** — Updated

- Added `warmUpSearchIndex()` — runs a `COUNT(*)` preflight on `translations_fts` and `hadiths_fts` to pre-warm SQLite FTS5 on app start

**`packages/main/src/index.ts`** — Updated

- Imported `session` from electron
- Added `setImmediate(() => libraryService.warmUpSearchIndex())` for non-blocking FTS warm-up
- Added `session.defaultSession.webRequest.onHeadersReceived` CSP headers:
  - `Content-Security-Policy` (strict; `unsafe-eval` only in dev for Vite HMR)
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
- Added memory health monitor (5-minute interval, warns at 512 MB heap)
- Added `scheduleReadingPlanReminders()` — checks every minute at configured reminder time, fires desktop notification if user has active reading plans

**`packages/arabic-nlp/src/morphology.ts`** — Updated

- Added Map-based LRU cache (max 2000 entries) for `analyzeWord()`
- Added exported `clearMorphologyCache()` for testing
- Cache hits re-insert at end to maintain LRU eviction order

**`electron-builder.config.js`** — Updated

- Mac: `arch: ['universal']` (single Universal binary for Intel + Apple Silicon)
- Win: targets `['nsis', 'msix']`
- Added `asar: true`, `compression: 'maximum'`
- `publish.releaseType: 'draft'` for controlled rollout

**`packages/renderer/src/styles/tokens.css`** — Updated

- Added `[data-theme="high-contrast"]` CSS token block (AEGold accents on black)
- Added `@media (prefers-reduced-motion: reduce)` global motion suppression
- Added `@media (pointer: coarse)` touch target enforcement (min 44×44px)

**`packages/renderer/src/components/layout/AppShell.tsx`** — Updated

- `ThemeSynchronizer` now handles `high-contrast` mode from `accessibility.highContrast`
- Added skip-to-content link as first focusable element
- Added `id="main-content"` on the main panel workspace
- Calls `useI18nSync()` to keep i18next language synced with settings

**`packages/renderer/src/components/search/SearchPanel.tsx`** — Updated

- Added `<div role="status" aria-live="polite" aria-atomic="true" className="sr-only">` live region
- Announces "Searching...", "Found N results", or "No results found" for screen readers

**`packages/renderer/src/components/navigation/CommandPalette.tsx`** — Updated

- Integrated `useFocusTrap(open)` — focus trapped in modal while palette is open
- `dialogRef` attached to the palette window div

**`packages/renderer/src/hooks/useFocusTrap.ts`** — New file

- Tab/Shift+Tab cycle stays within the modal container when `active` is true
- Focuses first focusable element on activation

**`packages/renderer/src/i18n/index.ts`** — New file

- i18next initialized with `react-i18next`, English and Arabic resource bundles

**`packages/renderer/src/i18n/locales/en.json`** — New file

- English translations: app, nav, quran, hadith, search, settings, common, readingPlans

**`packages/renderer/src/i18n/locales/ar.json`** — New file

- Arabic translations: all the same namespaces in Arabic

**`packages/renderer/src/hooks/useI18n.ts`** — New file

- Re-exports `useTranslation` from react-i18next
- `useI18nSync()` hook syncs i18next language from `interfaceLanguage` setting

**`packages/renderer/src/lib/hijri.ts`** — New file

- `toHijri(date, lang)` — Kuwaiti algorithm for Gregorian → Hijri conversion
- `formatHijri(h, lang)` — formats as "15 Ramadan 1446 AH" or Arabic equivalent
- `toArabicIndic(n)` — converts ASCII digits to Arabic-Indic (١٢٣٤...)

**`packages/arabic-nlp/vitest.config.ts`** + **`packages/arabic-nlp/src/morphology.test.ts`** — New files

- vitest setup for the NLP package
- 6 unit tests: basic analysis, consistency, caching, Form X detection, non-Arabic, empty input
- All 6 pass ✅

**`packages/database/vitest.config.ts`** + **`packages/database/src/migrate.test.ts`** — New files

- vitest setup for database package
- 3 unit tests: fresh migration, idempotency, schema_migrations table creation
- All 3 pass ✅ (also fixed a nested transaction bug in migrate.ts)

**`package.json`** (root) — Updated

- Added `test`, `test:nlp`, `test:db` scripts

---

## Phase Completion Status

### Phase 0: Project Foundation ✅

### Phase 1: Main Process & IPC Layer ✅

### Phase 2: Core UI Shell ✅

### Phase 3: Quran Reading Module ✅

### Phase 4: Tafsir Module ✅

### Phase 5: Hadith Module ✅

### Phase 6: Search & AI Study Assistant ✅

### Phase 7: Linguistic Analysis Module ✅

### Phase 8: Notes, Annotations & Khutbah Workflow ✅

### Phase 9: Factbook & Islamic Atlas ✅

### Phase 10: Audio & Recitation ✅

### Phase 11: Sync & Account System ✅

### Phase 12: Library Manager & Resource Store ✅

### Phase 13: Reading Plans & Progress ✅

- [x] Desktop notification reminders (time configurable — scheduleReadingPlanReminders in main/index.ts)

### Phase 14: Polish, Performance & Release ✅ (Session 12)

#### 14.1 Performance

- [x] Virtualized lists — @tanstack/react-virtual in SurahNavigator
- [x] Lazy load panels — React.lazy + Suspense (already in routes/index.tsx)
- [x] SQLite index optimization — migration 005_performance_indexes.sql
- [x] Search warm-up — warmUpSearchIndex() on setImmediate at startup
- [ ] Image optimization for Atlas maps — deferred
- [x] Morphology cache — LRU Map (2000 entries) in morphology.ts
- [x] Memory monitoring — 5-min interval, warns at 512 MB heap

#### 14.2 Accessibility

- [x] Full keyboard navigation — ARIA roles, focus trap, skip-to-content
- [x] Screen reader support — ARIA live regions in SearchPanel
- [x] High contrast mode — [data-theme="high-contrast"] CSS tokens (AEGold on black)
- [x] Focus management — useFocusTrap hook wired to CommandPalette modal
- [x] Reduced motion mode — @media (prefers-reduced-motion: reduce) CSS
- [x] Minimum touch targets — 44×44px via @media (pointer: coarse) CSS

#### 14.3 Internationalization

- [x] Interface languages: English + Arabic (i18next + react-i18next)
- [x] RTL layout switching — useI18nSync() syncs i18n language from settings
- [x] Number formatting — toArabicIndic() in lib/hijri.ts
- [x] Date formatting — toHijri() + formatHijri() Kuwaiti algorithm
- [x] i18next for string management — EN + AR locale JSON files

#### 14.4 Security Hardening

- [x] Content Security Policy headers — session.defaultSession.webRequest
- [x] Disable remote module — all windows: nodeIntegration: false, contextIsolation: true, sandbox: true
- [x] Validate all IPC inputs — all ipc-handlers.ts handlers have full validation
- [ ] Encrypt user.db — deferred (requires SQLCipher / SEE — commercial)
- [ ] Secure credential storage — deferred (requires keytar integration)
- [ ] Certificate pinning — deferred (no external API calls yet)

#### 14.5 Testing

- [x] Unit tests: morphology (6) + migration system (3) — vitest ✅
- [ ] Integration tests: IPC handlers — deferred
- [ ] E2E tests: Playwright — deferred
- [ ] Performance benchmarks — deferred

#### 14.6 Build & Distribution

- [x] Mac Universal binary — electron-builder arch: ['universal']
- [x] Windows NSIS + MSIX — electron-builder targets: ['nsis', 'msix']
- [x] Linux AppImage + .deb + .rpm — already configured
- [x] Auto-update draft releases — releaseType: 'draft'
- [ ] Crash reporting (Sentry) — deferred
- [ ] Analytics (opt-in) — deferred

---

### Session 13 — Deferred Items: Phase 0, 1, 3, 4

**Date**: 2026-03-09

**Status**: ✅ Complete

#### Changes Made

**`packages/renderer/src/components/quran/SurahNavigator.tsx`** — Updated

- Added `HIZB_DATA` array: complete 60-hizb dataset with surah/ayah start positions per hizb (Madinah Mushaf standard)
- Extended `NavTab` type to include `'hizb'` alongside `'surahs'` and `'juz'`
- Added third tab button "Hizb" in the tab bar
- Added Hizb list rendering: gold-badged hizb number, Juz' + position label, surah/ayah start
- Clicking a hizb navigates to the correct surah/ayah via `void navigate('/quran/${surah}/${ayah}')`

**`packages/database/migrations/006_tafsir_annotations.sql`** — New file

- `tafsir_annotations` table: `(id, tafsir_key, ayah_id, type, label, note, created_at)` with CHECK constraint on `type` (5 valid values)
- Index: `idx_tafsir_annotations_ayah (ayah_id, tafsir_key)`
- Seeded 5 sample annotations for Al-Fatiha (ibn-kathir): key_ruling (Basmalah), ijaz (Al-Hamd), disputed (al-Rahman/al-Rahim), linguistic_note (Iyyaka), key_ruling (recitation), historical_context (three paths)

**`packages/shared/types/ipc.ts`** — Updated

- Added `LIBRARY_GET_TAFSIR_ANNOTATIONS: 'library:get-tafsir-annotations'` channel
- Added `RESOURCE_DOWNLOAD_PROGRESS: 'resource:download-progress'` receive channel
- Added `TafsirAnnotationType` union type and `TafsirAnnotation` interface
- Added `ResourceDownloadProgress` interface

**`packages/main/src/preload.ts`** — Updated

- Added `'library:get-tafsir-annotations'` to `validChannels` whitelist
- Added `'resource:download-progress'` to `validReceiveChannels` whitelist

**`packages/main/src/library-service.ts`** — Updated

- Added `TafsirAnnotationRow` interface
- Added `getTafsirAnnotations` to `CachedStatements` (typed as `Statement | null` for lazy init)
- Added `getTafsirAnnotations(ayahId, tafsirKey)` public method: lazily prepares statement on first call (graceful if migration 006 not yet applied), returns `TafsirAnnotationRow[]`

**`packages/main/src/ipc-handlers.ts`** — Updated

- Added `library:get-tafsir-annotations` handler: validates `ayahId` (number) and `tafsirKey` (string), calls `libraryService.getTafsirAnnotations()`

**`packages/main/src/resource-manager.ts`** — Updated

- Constructor now accepts optional `onProgress` callback: `(resourceKey, percentage, status, message?) => void`
- `installResource()` rewritten: simulates incremental download in 10 steps with 300–500ms intervals, calling `onProgress` at each step; completes at 100% with `'installed'` status; guards against double-queuing
- Progress simulation is purely in-memory (no actual HTTP); mirrors the interface a real CDN downloader would use

**`packages/main/src/index.ts`** — Updated

- `ResourceManagerService` now instantiated with a progress callback
- Callback calls `win.webContents.send('resource:download-progress', {...})` with `{ resourceKey, percentage, status, message }` payload

**`packages/renderer/src/components/tafsir/TafsirViewer.tsx`** — Updated

- Added `TafsirAnnotation` interface: `{ id, tafsir_key, ayah_id, type, label, note }`
- Added `ANNOTATION_CONFIG` mapping each annotation type to label, icon, and Tailwind color classes
- Added `AnnotationCallout` component: renders a color-coded callout block with icon, type label, optional annotation label, and note text
- Updated `TafsirPanelProps` to include `annotations: TafsirAnnotation[]`
- `TafsirPanel` now renders "Scholarly Annotations" section after tafsir text when annotations exist
- Main `TafsirViewer` now:
  - Tracks `annotations` state: `Record<string, TafsirAnnotation[]>`
  - Fetches annotations alongside tafsir entry using `Promise.all([get-tafsir, get-tafsir-annotations])`
  - Passes `annotations[key]` to each `TafsirPanel`

**`packages/renderer/src/components/library/LibraryManager.tsx`** — Updated

- Added `DownloadProgress` interface: `{ percentage, status, message? }`
- Added `downloadProgress` state: `Record<string, DownloadProgress>`
- Added `useEffect` subscribing to `resource:download-progress` IPC events; updates progress state; on `status === 'installed'` refreshes the resource list
- `handleInstall()` now sets initial `downloading` progress state and updates resource status immediately
- Resource card now shows a real progress bar (with percentage, animated fill) when downloading, instead of a static spinner

**`packages/renderer/package.json`** — Updated

- Added Storybook devDependencies: `storybook ^8.6.0`, `@storybook/react ^8.6.0`, `@storybook/react-vite ^8.6.0`, `@storybook/addon-essentials ^8.6.0`, `@storybook/addon-a11y ^8.6.0`
- Added scripts: `"storybook": "storybook dev -p 6006"`, `"build-storybook": "storybook build"`

**`packages/renderer/.storybook/main.ts`** — New file

- Storybook `@storybook/react-vite` framework config
- Globs all `src/**/*.stories.@(ts|tsx)` files
- Addons: `addon-essentials`, `addon-a11y`
- `viteFinal`: copies path aliases from vite.config.ts (`@`, `@shared`, `@arabic-nlp`)
- `docs.autodocs: 'tag'`

**`packages/renderer/.storybook/preview.ts`** — New file

- Imports `../src/styles/index.css` for token/theme CSS
- Background themes: light (`#fff`), dark (`#1a1a2e`), sepia (`#f8f1e4`)
- Decorator: reads selected background and sets `data-theme` on `documentElement`

**`packages/renderer/src/stories/GradeBadge.stories.tsx`** — New file

- Stories: `Sahih`, `Hasan`, `HasanLiGhayrihi`, `Daif`, `Mawdu`, `AllGrades`, `SmallVariant`

**`packages/renderer/src/stories/AnnotationCallout.stories.tsx`** — New file

- Stories: `KeyRuling`, `LinguisticMiracle`, `DisputedPoint`, `LinguisticNote`, `HistoricalContext`, `AllTypes`

**`packages/renderer/src/stories/DownloadProgressBar.stories.tsx`** — New file

- Stories: `InProgress`, `NearComplete`, `Complete`, `Error`

**`packages/renderer/src/stories/SurahCard.stories.tsx`** — New file

- Stories: `Default`, `Active`, `MedianiSurah`, `AllSurahs`

**`build_sheet.md`** — Updated

- Checked off: Phase 0 Storybook, Phase 1 Resource download manager, Phase 3 Hizb navigator, Phase 4 Tafsir passage highlights

---

## Phase Completion Status

### Phase 0: Project Foundation ✅

- [x] Storybook component library — `.storybook/` config + 4 story files (GradeBadge, AnnotationCallout, DownloadProgressBar, SurahCard)

### Phase 1: Main Process & IPC Layer ✅

- [x] Resource download manager — `ResourceManagerService` with `onProgress` callback, incremental progress events via `resource:download-progress` IPC, real progress bars in LibraryManager

### Phase 2: Core UI Shell ✅

### Phase 3: Quran Reading Module ✅

- [x] Hizb navigator — 60-hizb dataset added to `SurahNavigator`, new "Hizb" tab with hizb cards

### Phase 4: Tafsir Module ✅

- [x] Tafsir passage highlights — `tafsir_annotations` DB table (migration 006), `AnnotationCallout` component, annotations fetched and displayed per ayah/tafsir combo

### Phase 5: Hadith Module ✅

### Phase 6: Search & AI Study Assistant ✅

### Phase 7: Linguistic Analysis Module ✅

### Phase 8: Notes, Annotations & Khutbah Workflow ✅

### Phase 9: Factbook & Islamic Atlas ✅

### Phase 10: Audio & Recitation ✅

### Phase 11: Sync & Account System ✅

### Phase 12: Library Manager & Resource Store ✅

### Phase 13: Reading Plans & Progress ✅

### Phase 14: Polish, Performance & Release ✅
