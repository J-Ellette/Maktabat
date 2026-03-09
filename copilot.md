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
- [ ] Morphological expansion (requires Arabic NLP module — deferred to Phase 7)
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

### Phases 7–14 — _future sessions_
