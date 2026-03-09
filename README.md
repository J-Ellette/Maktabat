# Maktabat — مكتبة

**Maktabat** (Arabic: مكتبة — "Library") is a professional-grade Islamic digital library and Quran study platform for the desktop. Built for students of knowledge, scholars, imams, and serious Muslim readers, it combines a full Quran reader with deep cross-referenced tafsir, hadith, linguistics, annotations, and khutbah tools — all in a beautifully crafted, RTL-aware offline-first application.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development](#development)
- [Building for Production](#building-for-production)
- [Linting, Type-checking & Tests](#linting-type-checking--tests)
- [Account System](#account-system)
- [Data Storage](#data-storage)
- [Contributing](#contributing)
- [License](#license)

---

## Features

| Module | Description |
|---|---|
| **Quran Reader** | Full Arabic text (Hafs) with up to 6 parallel English translations and word-by-word morphology |
| **Tafsir Viewer** | Classical and modern commentaries (Ibn Kathir, al-Tabari, Jalalayn, Maariful Quran, and more) |
| **Hadith Browser** | Sunni Kutub al-Sittah, extended Sunni collections, Shia al-Arba'ah, and Ibadi collections |
| **Full-Text Search** | Cross-library search across Quran, hadith, tafsir, notes, and highlights |
| **Word Study** | Arabic morphological analysis for every word in the Quran |
| **Irab Viewer** | Grammatical parsing (i'rab) by surah and ayah |
| **Conjugation Table** | Classical Arabic verb conjugation with root lookup |
| **Notes** | Rich study notes (study, question, reflection, khutbah, application types) |
| **Highlights & Bookmarks** | Color-coded highlights and bookmarks across the library |
| **Khutbah Builder** | Structured khutbah workflow with verse and hadith citations |
| **Study Templates** | Reusable templates for structured Quran study |
| **Reading Plans** | Custom and preset reading schedules with progress tracking |
| **Factbook** | Encyclopedic entries for Islamic topics, events, and persons |
| **Atlas** | Geographic and historical map references |
| **Library Manager** | Manage active resource collections |
| **Sync / Export** | Export and import study data as `.mkt` bundles (notes, highlights, bookmarks, reading plans, khutbahs) |
| **Account System** | Local accounts with tiered access (Free → Student → Scholar → Institution) |

---

## Tech Stack

```
Runtime:     Electron 31+
Frontend:    React 18 + TypeScript
State:       Zustand
Styling:     Tailwind CSS
Database:    SQLite via better-sqlite3
Build tool:  Vite (renderer) + tsc (main)
Monorepo:    pnpm workspaces
Packaging:   electron-builder (macOS, Windows, Linux)
Testing:     Vitest
Linting:     ESLint + Prettier
```

### Workspace packages

| Package | Description |
|---|---|
| `packages/main` | Electron main process — IPC handlers, services, window/tray management |
| `packages/renderer` | React UI — all screens and components |
| `packages/database` | SQLite migrations, seeds, and migration runner |
| `packages/arabic-nlp` | Classical Arabic NLP — morphology, i'rab, conjugation |
| `packages/shared` | Shared TypeScript types and constants |

---

## Prerequisites

- **Node.js** 20 or later
- **pnpm** 9 or later

Install pnpm globally if you don't have it:

```bash
npm install -g pnpm
```

---

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/J-Ellette/Maktabat.git
cd Maktabat

# 2. Install all workspace dependencies
pnpm install
```

---

## Development

The development workflow runs all packages in parallel watch mode:

```bash
pnpm dev
```

This starts:
- `packages/main` — TypeScript compiler in watch mode (`tsc --watch`)
- `packages/renderer` — Vite dev server

> **Note:** You still need to launch the Electron process after the two dev watchers are running. In a third terminal run:
>
> ```bash
> npx electron packages/main/dist/index.js
> ```

---

## Building for Production

```bash
# Build all packages
pnpm build

# Package the Electron app (requires the build step above)
npx electron-builder
```

Packaged outputs are placed in the `build/` directory.

| Platform | Output formats |
|---|---|
| macOS | `.dmg` (universal) |
| Windows | `.exe` (NSIS), `.msi`, `.msix` |
| Linux | `.AppImage`, `.deb`, `.rpm` |

---

## Linting, Type-checking & Tests

```bash
# Lint all TypeScript/TSX source files
pnpm lint

# Type-check all packages
pnpm typecheck

# Format all files with Prettier
pnpm format

# Run all tests across all packages
pnpm test

# Run only NLP tests
pnpm test:nlp

# Run only database migration tests
pnpm test:db
```

---

## Account System

Maktabat uses a **local account** system — no external server is required. Accounts are stored in the user's local SQLite database.

### Creating an account

Launch the app and navigate to **Account** in the sidebar. Choose **Sign Up**, enter your email address, a display name, and a password (minimum 8 characters).

> There is no pre-created admin account. Every user creates their own account on first use.

### Account tiers

| Tier | Description |
|---|---|
| **Free** | Core Quran text and basic hadith collections |
| **Student** | All Free resources + extended hadith collections and tafsir |
| **Scholar** | Full library access including classical fiqh and advanced linguistics |
| **Institution** | Unlimited multi-user access with administrative tools |

### Sessions

- Sessions expire after **90 days**.
- A **7-day offline grace period** applies for license validation.
- Passwords are hashed with PBKDF2 + SHA-512 (100,000 iterations).

---

## Data Storage

Application data is stored in the platform-specific user data directory:

| Platform | Path |
|---|---|
| macOS | `~/Library/Application Support/Maktabat/` |
| Windows | `%APPDATA%\Maktabat\` |
| Linux | `~/.config/Maktabat/` |

Files inside this directory:

```
library.db    — All text content, metadata, and cross-references
user.db       — Notes, highlights, bookmarks, reading history, and account data
resources/    — Binary resource files (images, audio recitations)
logs/         — Application logs
```

---

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository and create a feature branch:
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Install dependencies** (see [Installation](#installation)).

3. **Make your changes** following the existing code style.

4. **Lint and type-check** before committing:
   ```bash
   pnpm lint
   pnpm typecheck
   ```

5. **Run tests** to make sure nothing is broken:
   ```bash
   pnpm test
   ```

6. **Commit** with a clear, descriptive message and **open a Pull Request** against `main`.

### Code style

- TypeScript for all source files.
- Prettier + ESLint are enforced via a pre-commit hook (husky + lint-staged).
- React components use functional components with hooks.
- IPC channels must be added to the `validChannels` whitelist in `packages/main/src/preload.ts`.
- Navigation calls use `void navigate('/route')` to satisfy the `no-floating-promises` lint rule.

---

## License

This project is currently unlicensed. See the repository for details.
