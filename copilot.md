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

### Phase 1: Main Process & IPC Layer ✅ (this session)

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

### Phase 2: Core UI Shell — _next_

- [ ] Application shell with theme provider
- [ ] RTL/LTR direction context
- [ ] Resizable panel system
- [ ] Sidebar navigation
- [ ] In-app router
- [ ] Command palette (Cmd+K)
- [ ] Dashboard / New Tab view
- [ ] Settings panel

### Phases 3–14 — _future sessions_
