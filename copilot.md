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

### Phase 3: Quran Reading Module — _next_

- [ ] Arabic text display with proper OpenType features
- [ ] Tajweed color overlay
- [ ] Line-by-line / verse-by-verse / page view modes
- [ ] Translation renderer (single, parallel, interlinear)
- [ ] Word-by-word interaction (hover popover)
- [ ] Verse interaction menu (right-click context menu)
- [ ] Surah navigator

### Phases 4–14 — _future sessions_
