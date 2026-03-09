# Maktabat — مكتبة

## Quran Study Software: Full Expanded Specification & Multi-Step Build Sheet

### Electron Desktop Application

---

## EXECUTIVE SUMMARY

**Maktabat** (Arabic: مكتبة — "Library") is a professional-grade Islamic digital library and Quran study platform modeled on the architecture of Logos Bible Software, purpose-built for Quranic and Islamic scholarly study. It serves students of knowledge, scholars, imams preparing khutbahs, and serious Muslim readers who need deep cross-referenced study tools in a beautifully crafted, RTL-aware desktop environment.

### What Makes It Different From a Simple eReader

- Every word in the Quran links to morphological analysis, tafsir commentary, related hadith, and classical grammar resources
- Resources are cross-linked: reading a verse surfaces relevant Hadith, Tafsir, Fiqh rulings, and Sirah events automatically
- Linguistic analysis engine for Classical Arabic — root extraction, verb conjugation tables, balagha (rhetoric) markers
- Multi-tradition aware: Sunni (four madhabs), Shia, Ibadi resources all present, clearly labeled
- Khutbah and Quran study workflow built in as first-class features
- AI Study Assistant anchored in your library (not general internet)
- Full offline operation; cloud sync optional

---

## 1. DESIGN SYSTEM

### Foundation

- **Base**: UAE Design System v3.0 (https://designsystem.gov.ae)
- **RTL-Native**: Arabic is primary script; all layouts support bidirectional text
- **Accessibility**: WCAG 2.1 AA minimum

### Color Token System

```
AEGold         50–950   Primary brand, decorative motifs, surah headers
AERed          50–950   Alerts, Da'if hadith markers, warnings
AEGreen        50–950   Sahih markers, confirmed cross-references, nav accents
AEBlack        50–950   Primary text, UI chrome
Tech Blue      50–950   Interactive elements, links, search highlights
Sea Blue       50–950   Secondary panels, Shia collection markers
Camel Yellow   50–950   Annotations, bookmarks, study highlights
Desert Orange  50–950   Ibadi collection markers, warnings
Fuchsia        50–950   Tags, topic labels
Slate          50–950   Backgrounds, sidebar chrome, muted UI
```

### Typography

- **Arabic Display**: Noto Naskh Arabic, Amiri — for Quranic text and headers
- **Arabic Body**: IBM Plex Arabic — for commentary and prose
- **Latin Display**: Cormorant Garamond — for English headers
- **Latin Body**: Source Serif 4 — for English commentary text
- **Monospace**: JetBrains Mono — for transliteration and codes
- **Quranic Text**: KFGQPC Uthmanic Hafs (dedicated Quran font, OpenType)

### Spacing & Layout

- 8px base grid
- Fluid panels with resizable splitters
- Min panel width: 240px
- Default layout: 3-column (Library nav | Primary reading | Resource panel)
- Compact mode: 2-column or single column
- Full RTL mirror of all layouts

---

## 2. ELECTRON ARCHITECTURE

### Tech Stack

```
Runtime:        Electron 31+ (Chromium + Node.js)
Frontend:       React 18 + TypeScript
State:          Zustand (lightweight, no Redux overhead)
Styling:        Tailwind CSS + CSS Modules for component isolation
Database:       SQLite via better-sqlite3 (local library index)
Search:         MiniSearch (in-process full-text search)
Arabic NLP:     Qalsadi / custom morphology engine (WASM)
Build:          electron-builder (Mac, Windows, Linux targets)
IPC:            Electron contextBridge (secure renderer↔main)
Updates:        electron-updater (auto-update via S3 or GitHub releases)
Sync:           Optional: PouchDB ↔ CouchDB (cloud notes/highlights)
```

### Process Architecture

```
Main Process (Node.js)
├── Window manager
├── Menu builder (native OS menus)
├── SQLite library database
├── File system access (resource files, user data)
├── Auto-updater
└── IPC handlers

Renderer Process (React)
├── UI layer (all React components)
├── MiniSearch index (in-memory)
├── Arabic morphology WASM module
└── IPC calls → Main via contextBridge

Preload Script
└── Secure bridge exposing only whitelisted IPC channels
```

### Data Storage Locations

```
~/Library/Application Support/Maktabat/   (macOS)
%APPDATA%\Maktabat\                        (Windows)
~/.config/Maktabat/                        (Linux)

Contents:
  library.db          — SQLite: all text content, metadata, cross-references
  user.db             — SQLite: notes, highlights, bookmarks, reading history
  resources/          — Binary resource files (images, audio recitations)
  logs/               — Application logs
```

---

## 3. CONTENT LIBRARY STRUCTURE

### 3.1 The Quran

- **Arabic text**: Multiple riwayat (Hafs an Asim primary, Warsh, Qalun optional)
- **English translations** (all 6 listed in spec):
  - Noble Qur'an (Khan/Hilali)
  - Pickthall
  - Yusuf Ali (with commentary)
  - Abdel Haleem
  - Clear Quran (Khattab)
  - Taqi Usmani
- **Parallel view**: Up to 4 translations side-by-side + Arabic
- **Word-by-word**: Every Arabic word linked to morphological entry
- **Audio recitation**: Multiple reciters (Mishary, Al-Husary, etc.) synced to verse

### 3.2 Tafsir Collections

Organized in three tiers:

**Tier 1 — Classical Authenticated**

- Tafsir al-Tabari
- Tafsir Ibn Kathir
- Tafsir al-Jalalayn
- Tafsir al-Baghawi
- Tafsir al-Qurtubi (Al-Jami li-Ahkam)
- Tafsir al-Baydawi
- Tafsir al-Razi (Mafatih al-Ghayb)
- Al-Bahr al-Muhit (Ibn Hayyan)
- Dur al-Manthur (Al-Suyuti)

**Tier 2 — Modern Classical**

- Tafsir Ibn Ashur
- Ruh al-Ma'ani (Al-Alusi)
- Risale-i Nur (Said Nursi)
- Safwat al-Tafasir (Al-Sabuni)

**Tier 3 — Modern Urdu/English**

- Maariful Quran (Muhammad Shafi)
- Tafhim-ul-Quran (Maududi)
- Bayan al-Quran (Thanwi)
- Kanzul Iman (Barelvi)

### 3.3 Hadith Collections

**Sunni — Kutub al-Sittah (The Six Books)**

- Sahih al-Bukhari
- Sahih Muslim
- Sunan Abu Dawood
- Sunan al-Tirmidhi
- Sunan al-Nasa'i
- Sunan Ibn Majah

**Sunni — Extended Primary Collections**

- Al-Muwatta (Imam Malik)
- Musnad Ahmad ibn Hanbal
- Sunan al-Darimi
- Sahih Ibn Khuzaymah
- Sahih Ibn Hibban
- Al-Mustadrak (Al-Hakim)
- Al-Mu'jam al-Kabir (Al-Tabarani)
- Sunan al-Kubra (Al-Bayhaqi)
- Al-Adab al-Mufrad (Al-Bukhari)
- Musnad Abu Ya'la

**Sunni — Secondary Collections**

- Riyadh al-Salihin (Al-Nawawi)
- Mishkat al-Masabih
- Bulugh al-Maram (Ibn Hajar)
- Al-Arba'in al-Nawawiyyah
- At-Targhib wat-Tarhib
- Majma al-Zawa'id
- Kanz al-Ummal
- Al-Jami' al-Saghir (Al-Suyuti)
- Silsilat al-Hadith as-Sahiha (Al-Albani)
- Al-Jami al-Kamil (Ziya-ur-Rahman Azmi)

**Hadith Commentaries (Sharh)**

- Fath al-Bari (Ibn Hajar — commentary on Bukhari)
- Umdat al-Qari (Al-Ayni — commentary on Bukhari)
- Al-Minhaj (Al-Nawawi — commentary on Muslim)
- Ma'alim al-Sunan (Al-Khattabi — commentary on Abu Dawood)
- Mirqat al-Mafatih (Ali al-Qari — commentary on Mishkat)
- Fayd al-Qadir (Al-Munawi)

**Shia — Al-Kutub Al-Arba'ah (The Four Books)**

- Kitab al-Kafi (Kulayni)
- Man La Yahduruhu al-Faqih (Shaikh Saduq)
- Tahdhib al-Ahkam (Shaikh Tusi)
- Al-Istibsar (Shaikh Tusi)

**Shia — Extended Collections**

- Nahj al-Balaghah
- Al-Sahifa al-Sajjadiyya
- Bihar al-Anwar (Allama Majlesi)
- Wasā'il al-Shīʿa
- Tuhaf al-Uqul

**Ibadi Collections**

- Jami Sahih
- Tartib al-Musnad

### 3.4 Fiqh (Jurisprudence) — By School

**Hanafi**

- Al-Hidayah (Al-Marghinani)
- Al-Mabsut (Al-Sarakhsi)
- Mukhtasar al-Quduri
- Radd al-Muhtar (Ibn Abidin)
- Fatawa-e-Alamgiri
- Fatawa-i Razawiyya

**Maliki**

- Al Mudawanna (Sahnun)
- Bidayat al-Mujtahid (Ibn Rushd)
- Mukhtasar Khalil
- Al-Dhakhirah (Al-Qarafi)

**Shafi'i**

- Kitab al-Umm (Al-Shafi'i)
- Al-Majmu' (Al-Nawawi)
- Minhaj al-Talibin (Al-Nawawi)
- Rawdat al-Talibin (Al-Nawawi)

**Hanbali**

- Al-Mughni (Ibn Qudamah)
- Zad al-Mustaqni'
- Kashshaf al-Qina'

**Zahiri**

- Al-Muhalla (Ibn Hazm)

### 3.5 Aqidah (Theology/Creed)

- Al-Aqidah al-Tahawiyyah + commentaries
- Al-Aqidah al-Wasitiyyah (Ibn Taymiyyah)
- Al-Fiqh al-Akbar (Abu Hanifa)
- Ihya' Ulum al-Din (Al-Ghazali)
- Kitab al-Tawhid (Ibn Abd al-Wahhab)
- Umm al-Barahin (Al-Sanusi)
- Maqalat al-Islamiyyin (Al-Ash'ari)

### 3.6 Sirah (Prophetic Biography)

- Sirat Ibn Hisham
- Zad al-Ma'ad (Ibn Qayyim)
- Al-Sirah al-Nabawiyyah (Ibn Kathir)
- Ash-Shifa (Qadi Ayyad)
- Ar-Raheeq Al-Makhtum (Mubarakpuri)
- Al-Shama'il al-Muhammadiyya (Al-Tirmidhi)

### 3.7 Arabic Language Sciences

**Grammar (Nahw & Sarf)**

- Kitab Sibawayh
- Al-Ajurrumiyya
- Alfiyya of Ibn Malik + Sharh Ibn Aqil
- Al-Kafiya (Ibn al-Hajib)
- Mughni al-Labib (Ibn Hisham)

**Dictionaries (Mu'jam)**

- Lisan al-Arab (Ibn Manzur) — primary
- Al-Qamus al-Muhit (Firuzabadi)
- Al-Mufradat fi Gharib al-Quran (Al-Isfahani) — Quran-specific vocabulary
- Mu'jam Maqayis al-Lughah (Ibn Faris)
- Al-Sihah fi al-Lugha (Al-Jawhari)

**Rhetoric (Balagha)**

- Dala'il al-I'jaz (Al-Jurjani)
- Asrar al-Balagha (Al-Jurjani)
- Al-Mutawwal (Al-Taftazani)

### 3.8 Quranic Sciences (Ulum al-Quran)

- Al-Itqan (Al-Suyuti)
- Al-Burhan fi Ulum al-Quran (Al-Zarkashi)
- Asbab al-Nuzul (Al-Wahidi)
- Al-Nasikh wa al-Mansukh (Abu Ubaid)
- Muqaddimah fi Usul al-Tafsir (Ibn Taymiyyah)
- Al-Fawz al-Kabir (Shah Waliullah)

### 3.9 History & Biography

- Tarikh at-Tabari
- Al-Bidayah wan-Nihayah (Ibn Kathir)
- Siyar A'lam al-Nubala' (Al-Dhahabi)
- Tabaqat al-Kabir (Ibn Sa'd)
- Muqaddimah (Ibn Khaldun)

### 3.10 Tazkiyyah & Spirituality

- Ihya' Ulum al-Din (Al-Ghazali)
- Kitab al-Adhkar (Al-Nawawi)
- Al-Risala al-Qushayriyya
- Kashf ul Mahjoob (Ali Hujwiri)
- Fortress of the Muslim (daily adhkar)

### 3.11 Islamic Atlas

- Historical maps of the Islamic world (7th–21st century)
- Trade routes of the Sahaba era
- Conquest and expansion maps
- Hajj and pilgrimage routes
- Modern Muslim population maps

---

## 4. FEATURE SPECIFICATION

### 4.1 Core Reading Engine

- **Multi-panel workspace**: Tile, tab, or float any resource
- **Linked scrolling**: Quran text + translation + tafsir scroll in sync
- **Word hover**: Hover any Arabic word → instant morphology popup
- **Verse linking**: Click verse reference in any text → jumps to Quran
- **Cross-reference panel**: Sidebar shows all related resources for current verse/topic
- **Footnotes**: Inline or margin; click to expand
- **Night/Day/Sepia modes**
- **Font size & family controls per panel**

### 4.2 Search System

**Basic Search**

- Full-text across entire library
- Search in Arabic, English, or transliteration
- Filter by: collection type, madhab, century, language
- Boolean operators (AND, OR, NOT)
- Results ranked by relevance + resource authority

**Smart Search (Premium)**

- Natural language questions: "What does the Quran say about fasting?"
- Questions answered with cited results from your library
- Synopsis of top results with footnotes
- AI Study Assistant mode: conversational, library-anchored, cited

**Morphological Search**

- Search by Arabic root (3 or 4 letter)
- Find all derivatives across Quran and Hadith
- Verb pattern (wazan) search

### 4.3 Factbook

- Encyclopedia of Quranic topics, figures, places, events
- Entry for every Prophet mentioned in Quran
- Entry for every Companion (Sahabi) of significance
- Entry for every place mentioned
- Entry for major concepts (Tawbah, Zakat, Jihad, etc.)
- Auto-surfaces when reading related content (Insights mode)

### 4.4 Linguistic Analysis Tools

**Word Study**

- Select any Arabic word → full morphological analysis
- Root identification
- All occurrences in Quran
- All occurrences in Hadith
- Classical dictionary definitions (Lisan al-Arab, Al-Mufradat)
- Lane's Lexicon cross-reference

**Grammar Parsing**

- Full i'rab (grammatical analysis) for every Quranic verse
- Verb conjugation tables
- Noun declension patterns
- Sentence structure diagrams

**Tajweed Markers**

- Optional tajweed color-coding overlay on Arabic text
- Rules explained on hover

### 4.5 Hadith Grading System

- Every hadith displayed with its grading: Sahih, Hasan, Da'if, Mawdu'
- Grade source attributed (Al-Albani, Al-Arnaut, Ibn Hajar, etc.)
- Multiple gradings shown when scholars disagree
- Visual color system: AEGreen (Sahih) → AERed (Mawdu')
- Isnad (chain of narration) viewer

### 4.6 Notes & Annotations

- Highlight text in any color (mapped to AE color palette)
- Inline notes anchored to verse/hadith
- Note types: Study note, Question, Reflection, Khutbah material
- Tags and categories (user-defined)
- Export notes as PDF or DOCX
- Notes searchable across entire library

### 4.7 Khutbah Workflow

- Mark any passage as "Khutbah material"
- Khutbah builder: collect marked passages, organize outline
- Templates: Jumu'ah Khutbah, Eid Khutbah, Special occasion
- Export as formatted PDF (Arabic + English bilingual)
- Khutbah history: tag which verses were used in which khutbah

### 4.8 Quran Study Templates

- Verse-by-verse study template (Arabic → Translation → Tafsir → Hadith → Application)
- Topical study template
- Word study template
- Comparative madhab ruling template
- Character study (Prophets and figures)

### 4.9 Reading Plans

- Quran completion plans (30 days, 60 days, 1 year, custom)
- Hadith study plans (40 Hadith, Riyadh al-Salihin, etc.)
- Progress tracking with streaks
- Daily reminder notifications (desktop)

### 4.10 Islamic Atlas

- Interactive historical maps
- Timeline slider: see the Islamic world at any century
- Click location → surfaced related Hadith, Sirah events, historical texts
- Hajj route planner with historical context

### 4.11 Audio Integration

- Quran recitation by multiple reciters
- Verse-by-verse playback synced to highlighted text
- Playback speed control
- Sleep timer
- Offline audio download

---

## 5. SUBSCRIPTION / ACCESS TIERS

### Free Tier

- Quran text (Arabic) + 2 translations
- Sahih al-Bukhari + Sahih Muslim
- Tafsir al-Jalalayn
- Basic search
- Notes & highlights (500 entries)
- Fortress of the Muslim (adhkar)

### Standard ($9.99/month or $79.99/year)

- Full Kutub al-Sittah
- 6 Quran translations
- 5 classical Tafsirs
- Riyadh al-Salihin + Mishkat al-Masabih
- Factbook (basic)
- Reading plans
- Unlimited notes

### Premium ($19.99/month or $159.99/year)

Everything in Standard, plus:

- Full hadith library (all collections)
- Full Tafsir library (all tiers)
- Smart Search / Study Assistant (AI-powered)
- Khutbah workflow & builder
- Morphological word study
- Hadith grading overlays
- Grammar parsing / I'rab viewer
- Islamic Atlas
- Audio recitations (all reciters)
- Insights panel
- Khutbah & Study markers
- Search results synopsis

### Scholar ($34.99/month or $279.99/year)

Everything in Premium, plus:

- Complete Arabic language library (grammar, dictionaries, rhetoric)
- Shia & Ibadi collections
- Full Fiqh library (all four madhabs + Zahiri)
- Full Aqidah library
- Full History & Sirah library
- Comparative madhab rulings tool
- Notes export (PDF, DOCX, Markdown)
- Priority support
- Early access to new features

### Institution (Contact for pricing)

- Multi-seat licensing
- Custom branding options
- LMS integration
- Bulk student account management
- Admin dashboard

---

## 6. MULTI-STEP BUILD SHEET

---

### PHASE 0: Project Foundation

#### Step 0.1 — Repository & Tooling Setup

- [x] Initialize monorepo (pnpm workspaces)
  ```
  packages/
    main/         — Electron main process (Node.js + TypeScript)
    renderer/     — React 18 + TypeScript frontend
    shared/       — Shared types, constants, IPC contracts
    database/     — SQLite schema, migrations, seed scripts
    arabic-nlp/   — Arabic morphology engine (WASM build)
  ```
- [x] Configure TypeScript (strict mode, path aliases)
- [x] Set up ESLint + Prettier + Husky pre-commit hooks
- [x] Configure electron-builder for Mac/Win/Linux targets
- [x] Set up GitHub Actions CI/CD pipeline
  - Lint + type-check on every PR
  - Build + package on merge to main
  - Auto-publish releases to GitHub Releases

#### Step 0.2 — Design Token System

- [x] Implement full UAE Design System v3 color tokens as CSS custom properties
  ```css
  --ae-gold-50 through --ae-gold-950
  --ae-red-50 through --ae-red-950
  --ae-green-50 through --ae-green-950
  (... all 10 color families)
  ```
- [x] Configure Tailwind to consume these tokens
- [x] Set up dark/light/sepia theme switching
- [x] Load and configure Arabic fonts (Noto Naskh, Amiri, IBM Plex Arabic)
- [x] Load and configure Latin fonts (Cormorant Garamond, Source Serif 4)
- [x] Load Quranic font (KFGQPC Uthmanic Hafs)
- [ ] Build Storybook component library for design QA

#### Step 0.3 — Database Schema Design

- [x] Design SQLite schema for `library.db`:

  ```sql
  -- Core content tables
  surahs (id, number, arabic_name, transliterated_name, english_name, revelation_type, verse_count)
  ayahs (id, surah_id, ayah_number, arabic_text, arabic_simple, bismillah_pre)
  translations (id, ayah_id, translation_key, text, translator, language)
  tafsir_entries (id, ayah_id, tafsir_key, text, language, volume, page)

  -- Hadith tables
  hadith_collections (id, key, name_arabic, name_english, tradition, tier, compiler, century)
  hadiths (id, collection_id, book_id, chapter_id, hadith_number, arabic_text, english_text)
  hadith_grades (id, hadith_id, grade, grader, source)
  hadith_narrators (id, name_arabic, name_english, birth_year, death_year, reliability)
  isnad_entries (id, hadith_id, position, narrator_id)

  -- Cross-reference tables
  hadith_ayah_refs (id, hadith_id, ayah_id, relation_type)
  tafsir_hadith_refs (id, tafsir_entry_id, hadith_id)
  topic_ayah_refs (id, topic_id, ayah_id)
  topic_hadith_refs (id, topic_id, hadith_id)

  -- Arabic language tables
  arabic_roots (id, root_letters, meaning_arabic, meaning_english)
  word_morphology (id, ayah_id, word_position, surface_form, root_id, pattern, pos, case_marker)
  dictionary_entries (id, root_id, source_key, definition_arabic, definition_english)

  -- Resource metadata
  resources (id, key, title_arabic, title_english, author, tradition, type, century, tier)

  -- Factbook
  factbook_entries (id, slug, title_arabic, title_english, type, summary, body)
  factbook_ayah_refs (id, entry_id, ayah_id)
  ```

- [x] Design `user.db` schema:

  ```sql
  highlights (id, resource_key, content_ref, color, created_at)
  notes (id, resource_key, content_ref, type, body, tags, created_at, updated_at)
  bookmarks (id, resource_key, content_ref, label, created_at)
  reading_history (id, resource_key, position, last_visited)
  reading_plans (id, plan_key, start_date, target_date, progress_data)
  khutbah_materials (id, khutbah_id, content_ref, order_index)
  khutbahs (id, title, date, template_key, status, body)
  tags (id, name, color)
  ```

- [x] Write migration system (up/down migrations with versioning)
- [x] Write seed scripts for development dataset (1 Surah complete, 10 hadith sample)

---

### PHASE 1: Main Process & IPC Layer

#### Step 1.1 — Electron Main Process

- [x] Window manager
  - Create main BrowserWindow with correct security settings
  - `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`
  - Persist window size/position between sessions
  - Handle multiple windows (detached panels feature)
- [x] Application menu (native OS menus)
  - File: New Window, Open Library, Import Resource, Export Notes, Preferences, Quit
  - Edit: Undo, Redo, Find, Find in Library
  - View: Panel layouts, Zoom, Theme, Full Screen
  - Library: Library Manager, Download Resources, Sync
  - Study: Reading Plans, Khutbah Builder, Study Templates
  - Help: Documentation, Keyboard Shortcuts, About
- [x] Tray icon with quick access to daily dhikr / verse of the day
- [x] System notifications (reading plan reminders, download complete)
- [x] Protocol handler: `maktabat://` deep links (e.g., `maktabat://quran/2:255` for Ayat al-Kursi)
- [x] File associations: `.mkt` format for exported libraries/note bundles

#### Step 1.2 — IPC Contract Layer

- [x] Define all IPC channels in `shared/ipc-contracts.ts` (TypeScript enums)
  ```typescript
  // Example channels
  LIBRARY_SEARCH = 'library:search'
  LIBRARY_GET_AYAH = 'library:get-ayah'
  LIBRARY_GET_TAFSIR = 'library:get-tafsir'
  LIBRARY_GET_HADITH = 'library:get-hadith'
  LIBRARY_GET_MORPHOLOGY = 'library:get-morphology'
  USER_SAVE_NOTE = 'user:save-note'
  USER_GET_NOTES = 'user:get-notes'
  USER_SAVE_HIGHLIGHT = 'user:save-highlight'
  USER_GET_READING_PLAN = 'user:get-reading-plan'
  AUDIO_PLAY = 'audio:play'
  AUDIO_PAUSE = 'audio:pause'
  SETTINGS_GET = 'settings:get'
  SETTINGS_SET = 'settings:set'
  ```
- [x] Implement preload script exposing typed `window.maktabat` API
- [x] Implement all IPC handlers in main process
- [x] Input validation on all IPC calls (prevent injection)

#### Step 1.3 — Library Database Service

- [x] `LibraryService` class: wraps better-sqlite3, exposes typed queries
- [x] Prepared statement cache (performance)
- [x] Full-text search using SQLite FTS5 extension
  - Index Arabic text (normalized, diacritics-stripped version for search)
  - Index English text
  - Support transliteration search
- [x] Query builder for complex cross-resource queries
- [ ] Resource download manager
  - Check which resources are licensed
  - Download encrypted resource packages from CDN
  - Decrypt and import into library.db
  - Progress reporting via IPC

---

### PHASE 2: Core UI Shell

#### Step 2.1 — Application Shell

- [x] Top-level layout component with theme provider
- [x] RTL/LTR direction context (switches per active panel language)
- [x] Panel system (core workspace engine)
  - Resizable split panels (horizontal and vertical)
  - Drag-to-rearrange panels
  - Tab groups within panels
  - Panel presets: Research layout, Reading layout, Khutbah layout
  - Detach panel to separate window
- [x] Sidebar navigation
  - Library browser (tree: Collections → Resources → Chapters)
  - Bookmarks
  - Notes & Highlights
  - Reading Plans
  - Factbook
  - Islamic Atlas

#### Step 2.2 — Navigation & Routing

- [x] In-app router (React Router or TanStack Router)
- [x] History stack (back/forward like a browser)
- [x] Resource address bar: type `Quran 2:255` or `Bukhari 1` to navigate
- [x] Command palette (Cmd+K / Ctrl+K)
  - Search resources
  - Navigate to any verse, hadith, or resource
  - Run commands (open layouts, toggle panels, etc.)

#### Step 2.3 — New Tab / Dashboard

- [x] Personalized command center (reimagined New Tab)
- [x] "Everything" view:
  - Today's dhikr / Fortress of the Muslim entry
  - Verse of the Day (with tafsir snippet)
  - Hadith of the Day
  - Reading plan progress widget
  - Recent resources
  - Recent notes
- [x] "Reference" view:
  - Quick-open any resource
  - Quick search
  - Quick navigate to surah/ayah

#### Step 2.4 — Settings Panel

- [x] Appearance: Theme (Day/Night/Sepia/Custom), font sizes per panel type, color accents
- [x] Language: Interface language, default Arabic script (Hafs/Warsh), transliteration system
- [x] Library: Installed resources, available for download, storage usage
- [x] Account: Subscription tier, sign in/out, sync settings
- [x] Keyboard shortcuts (customizable)
- [x] Accessibility: High contrast, screen reader optimizations, reduced motion
- [x] Notifications: Reading plan reminders, new resource alerts

---

### PHASE 3: Quran Reading Module

#### Step 3.1 — Quran Text Renderer

- [x] Arabic text display with proper OpenType features
  - Correct ligatures and contextual forms
  - Kashida (tatweel) handling
  - Verse end markers (آ)
  - Sajdah markers
  - Rub' al-Hizb markers (۞)
  - Hizb markers (۝)
  - Juz' markers
- [x] Tajweed color overlay (optional, toggleable)
  - Each tajweed rule gets distinct color from AE palette
  - Rule explained on hover
- [x] Line-by-line mode (mushaf style, right-to-left pages)
- [x] Verse-by-verse mode (study mode, LTR-friendly)
- [x] Page view mode (faithful to printed Mushaf)

#### Step 3.2 — Translation Renderer

- [x] Single translation view
- [x] Parallel translation view (up to 4 translations + Arabic)
- [x] Translation comparison tool: highlight where translators differ
- [x] Interlinear mode: Arabic word + English gloss beneath each word

#### Step 3.3 — Word-by-Word Interaction

- [x] Every Arabic word is an interactive element
- [x] Hover popover shows:
  - Arabic word (large)
  - Transliteration
  - Word-by-word translation
  - Part of speech
  - Root letters
  - [Button: Open full word study]
- [x] Click word → opens Word Study panel (see 4.5)

#### Step 3.4 — Verse Interaction Menu

- [x] Right-click or long-press any verse → context menu:
  - Copy (Arabic, Translation, or both)
  - Highlight (color picker using AE palette)
  - Add Note
  - Add to Khutbah
  - Add to Study Template
  - Share verse
  - View in Tafsir
  - View related Hadith
  - View in Factbook
  - Play recitation from here

#### Step 3.5 — Surah Navigator

- [x] Surah list with: number, Arabic name, English name, Meccan/Medinan, verse count
- [x] Filter by: Meccan/Medinan, theme, length
- [x] Juz' navigator
- [ ] Hizb navigator
- [x] Search within Quran

---

### PHASE 4: Tafsir Module

#### Step 4.1 — Tafsir Viewer

- [x] Tafsir synchronized with Quran panel
  - Auto-scrolls tafsir to match current verse in Quran panel
  - Or: select any verse, tafsir panel updates
- [x] Tafsir selector: switch between installed tafsirs easily
- [x] Multiple tafsirs side by side
- [x] Volume/page reference always shown (for citation)
- [ ] Tafsir passage highlights: key rulings, ijaz markers, disputed points

#### Step 4.2 — Tafsir Cross-References

- [x] Hadith citations within tafsir are live links → opens hadith in panel
- [x] Quranic verse cross-references within tafsir are live links
- [x] Author bio accessible from tafsir header

---

### PHASE 5: Hadith Module

#### Step 5.1 — Hadith Collection Browser

- [x] Collection hierarchy: Collection → Book → Chapter → Hadith
- [x] Tree navigator for all installed collections
- [x] Collection metadata: compiler bio, century, tradition (Sunni/Shia/Ibadi), tier

#### Step 5.2 — Hadith Viewer

- [x] Arabic text (large, prominent)
- [x] English translation
- [x] Hadith number (collection numbering system)
- [x] Grade badge with color coding:
  - AEGreen-600: Sahih (Authentic)
  - AEGreen-400: Hasan (Good)
  - AEGold-500: Hasan li-ghayrihi
  - AERed-400: Da'if (Weak)
  - AERed-700: Mawdu' (Fabricated)
- [x] Multiple grades from different scholars shown (with attribution)
- [x] "Companion hadiths" — other hadiths with same/similar meaning

#### Step 5.3 — Isnad (Chain of Narration) Viewer

- [x] Visual chain: Narrator → Narrator → Narrator → Prophet ﷺ
- [x] Each narrator: name, reliability grade, birth/death dates, click for bio
- [x] Narrator reliability color-coded
- [x] Common weak points in isnad highlighted

#### Step 5.4 — Hadith Search

- [x] Search by text (Arabic or English)
- [x] Search by narrator name
- [x] Search by topic/chapter
- [x] Filter by collection, grade, century
- [x] Concordance view: same hadith across multiple collections

---

### PHASE 6: Search & AI Study Assistant

#### Step 6.1 — Full-Text Search

- [x] Search bar (always accessible, Cmd+F)
- [x] Query parser: handles Arabic, English, transliteration
- [x] Results grouped by resource type (Quran, Tafsir, Hadith, Fiqh, etc.)
- [x] Filters sidebar (collection, madhab, language, date range)
- [x] Relevance ranking (combines text match + resource authority score)
- [x] Highlighted search terms in results
- [ ] Morphological expansion: search "pray" also finds "prayer", "prayed", "salah", "salat"

#### Step 6.2 — Smart Search (Premium)

- [x] Natural language question input
- [ ] Query classified and decomposed into sub-searches
- [ ] Results synthesized with:
  - Direct Quran verses (if applicable)
  - Related hadiths (graded)
  - Tafsir commentary
  - Scholarly opinions
- [x] Synopsis view: short answer with footnotes
- [x] "Dig deeper" links for each result
- [ ] Summarize button: get 2-3 sentence summary of any resource

#### Step 6.3 — AI Study Assistant (Premium)

- [x] Chat interface panel
- [x] Conversational multi-turn: ask follow-up questions
- [ ] Every answer anchored in installed library (no hallucination)
- [x] Citations shown inline with every claim
- [x] "Show me in the text" → opens resource at exact location
- [x] Suggested follow-up questions
- [x] Session history (saved per study session)
- [ ] Cannot contradict explicit text in library (guardrail)

---

### PHASE 7: Linguistic Analysis Module

#### Step 7.1 — Arabic Morphology Engine (WASM)

- [x] Compile Qalsadi or equivalent to WebAssembly (JS-based heuristic engine + root extraction in `packages/arabic-nlp/src/morphology.ts`; full WASM Qalsadi deferred pending build toolchain)
- [x] Expose API: `analyze(word: string) → MorphologyResult`
- [x] Pre-computed morphology for every Quranic word (stored in DB via existing `word_morphology` schema)
- [x] Real-time analysis for user-entered Arabic text (ConjugationTable root input + WordStudyPanel word param)

#### Step 7.2 — Word Study Panel

- [x] Triggered by clicking any Arabic word in any panel
- [x] Displays:
  - Word in large Arabic type
  - Transliteration (multiple systems: ALA-LC, Buckwalter, simple)
  - Root letters (displayed large)
  - Pattern (wazan)
  - Part of speech
  - Grammatical role in sentence (i'rab)
  - Case ending explanation
- [x] Occurrences in Quran (all uses of this root)
  - Each occurrence clickable → jumps to verse
  - Chart: distribution across Meccan/Medinan surahs
- [x] Occurrences in Hadith (significant uses)
- [x] Dictionary definitions from:
  - Al-Mufradat fi Gharib al-Quran (Isfahani) — primary for Quran vocabulary
  - Lisan al-Arab (Ibn Manzur) — comprehensive classical
  - Lane's Arabic-English Lexicon (cross-reference)
- [x] Semantic field: related words, antonyms

#### Step 7.3 — I'rab (Grammar Parsing) Viewer

- [x] Parse tree diagram for any Quranic verse
- [x] Color-coded by grammatical function:
  - Subject (mubtada / fa'il) — Tech Blue
  - Predicate (khabar) — AEGreen
  - Object (maf'ul bih) — Desert Orange
  - Prepositional phrases — Fuchsia
  - Conjunctions — Slate
- [x] Click any node for detailed explanation
- [x] Reference to grammar rules in installed grammar books

#### Step 7.4 — Verb Conjugation Table

- [x] Input any Arabic root → full conjugation table
- [x] Past, present, imperative, active participle, passive participle, verbal noun
- [x] All persons, genders, numbers
- [x] All major verb patterns (Forms I–X)
- [x] Show all occurrences of each conjugated form in Quran

---

### PHASE 8: Notes, Annotations & Khutbah Workflow

#### Step 8.1 — Highlights System

- [x] Select text in any panel → highlight toolbar appears
- [x] 8 highlight colors mapped to AE palette
- [x] Highlights persist across sessions (stored in user.db)
- [x] All highlights visible in Highlights panel
- [x] Export highlights for any resource

#### Step 8.2 — Notes System

- [x] Margin notes: anchored to specific verse/hadith/passage
- [x] Free-form notes: not anchored, just tagged
- [x] Rich text editor (Markdown-based with Arabic support)
- [x] Note types: Study, Question, Insight, Khutbah, Application
- [x] Tagging system (user-defined tags)
- [x] Note search (full-text across all notes)
- [x] Note export: PDF, DOCX, Markdown, plain text

#### Step 8.3 — Khutbah Builder (Premium)

- [x] Mark any passage as "Khutbah material" from context menu
- [x] Khutbah Builder panel:
  - Title and date
  - Template selector (Jumu'ah, Eid al-Fitr, Eid al-Adha, Janazah, Nikah, Custom)
  - Sections: Opening (Hamd/Salawat), Main points, Conclusion, Du'a
  - Drag collected passages into sections
  - Add personal notes between passages
- [x] Live preview: see formatted khutbah as you build
- [x] Export as bilingual PDF (Arabic + English, print-ready)
- [x] Khutbah archive: record which verses/hadiths used in past khutbahs
- [ ] Khutbah marker: reading a verse shows past khutbahs that used it (requires cross-reference query — deferred)

#### Step 8.4 — Study Templates (Premium)

- [x] Template library:
  - Verse Deep-Dive (Arabic → Translation → Tafsir → Hadith → Fiqh → Application)
  - Topical Study
  - Character Study (Prophet or Companion)
  - Word Study
  - Comparative Madhab
  - Historical Event
  - Custom (build your own)
- [x] Template runner: fill in anchor verse/topic → template auto-populates linked resources
- [ ] Save and share completed studies (requires account system — deferred to Phase 11)

---

### PHASE 9: Factbook & Islamic Atlas

#### Step 9.1 — Factbook

- [x] Encyclopedia interface with search
- [x] Entry types: Person, Place, Event, Concept, Surah, Hadith Collection
- [ ] Auto-triggers (Insights): reading a verse about a Prophet → Factbook entry floats in
- [x] Each entry has:
  - Summary card (quick reference)
  - Full article
  - Related Quran verses (all linked)
  - Related hadiths (placeholder — awaiting data seed)
  - Timeline position (for historical figures/events)
  - Bibliography
- [ ] Commentaries section added progressively (Premium)

#### Step 9.2 — Islamic Atlas

- [x] Map viewer with historical layers (SVG schematic map)
- [x] Timeline slider (600 BCE → 2000 CE)
- [x] Map layers:
  - Physical geography
  - Political boundaries by era
  - Hajj and trade routes
  - Conquest and expansion
  - Spread of the four madhabs
  - Modern Muslim population density
- [x] Click location → panel shows related Quran verses and description
- [x] Surah revelation locations (Mecca/Medina reference in sidebar)

---

### PHASE 10: Audio & Recitation

#### Step 10.1 — Audio Engine

- [x] Recitation player (HTML5 Audio via Electron)
- [ ] Verse-by-verse playback with text highlight sync
- [x] Reciters available: Mishary Rashid Al-Afasy, Mahmoud Khalil Al-Husary, Abdul Basit Abdul Samad, Mohamed Siddiq El-Minshawi, Abdur-Rahman Al-Sudais
- [x] Speed control (0.5x to 2.0x)
- [x] Repeat modes: verse, surah
- [x] Sleep timer
- [x] Mini player (floats, always accessible)
- [ ] Offline audio download manager

#### Step 10.2 — Audio Settings

- [ ] Download reciters for offline use
- [ ] Auto-advance to next verse / pause between verses
- [ ] Translation audio (English) paired with Arabic

---

### PHASE 11: Sync & Account System

#### Step 11.1 — Account System

- [x] Sign up / Sign in (email + password, Google SSO)
- [ ] Subscription management (Stripe integration)
- [x] License validation (offline grace period: 7 days)
- [x] Multi-device licensing (up to 3 devices per account)

#### Step 11.2 — Cloud Sync (Optional)

- [x] Sync: Notes, highlights, bookmarks, reading progress, khutbahs
- [x] Conflict resolution: last-write-wins with merge prompts for conflicts
- [x] Sync status indicator
- [x] Full offline mode: app fully functional without internet
- [x] Export entire personal library (backup as .mkt bundle)
- [x] Import .mkt bundle on new device

---

### PHASE 12: Library Manager & Resource Store

#### Step 12.1 — Library Manager

- [x] Installed resources list with storage size
- [x] Available resources browser (by category, tier, language)
- [x] Download individual resources or bundles
- [x] Resource detail page: author bio, contents, reviews
- [x] Uninstall to free space

#### Step 12.2 — Resource Import

- [x] Import third-party resources in MKT format
- [x] Import from EPUB (with Quran/Hadith detection)
- [x] Import personal PDFs (for annotation, not cross-linking)

---

### PHASE 13: Reading Plans & Progress

- [x] Built-in plans:
  - Quran in 30 days
  - Quran in 60 days
  - Quran in 1 year
  - 40 Hadith (Al-Nawawi) in 40 days
  - Riyadh al-Salihin (1 year)
  - Custom plan builder
- [x] Daily reading assigned and shown on dashboard
- [x] Progress ring (per plan, per day)
- [x] Streak tracking
- [x] Completion certificates (PDF export)
- [ ] Desktop notification reminders (time configurable)

---

### PHASE 14: Polish, Performance & Release

#### Step 14.1 — Performance

- [ ] Virtualized lists for long resources (react-virtual)
- [ ] Lazy load panels (code splitting)
- [ ] SQLite query profiling and index optimization
- [ ] Search index warm-up on app start (background)
- [ ] Image optimization for Atlas maps (WebP, lazy)
- [ ] WASM morphology engine: cache results for already-analyzed words
- [ ] Memory monitoring (Electron can leak — add health checks)

#### Step 14.2 — Accessibility

- [ ] Full keyboard navigation (no mouse required)
- [ ] Screen reader support (ARIA labels, live regions for search)
- [ ] High contrast mode (uses AEBlack + AEGold for high contrast)
- [ ] Focus management across panels
- [ ] Reduced motion mode
- [ ] Minimum touch target sizes (for Surface/tablet use)

#### Step 14.3 — Internationalization

- [ ] Interface languages: Arabic, English, Urdu, Turkish, French, Indonesian (Phase 1)
- [ ] RTL layout switching when Arabic interface selected
- [ ] Number formatting (Arabic-Indic numerals option)
- [ ] Date formatting (Hijri / Gregorian toggle)
- [ ] i18next for string management

#### Step 14.4 — Security Hardening

- [ ] Content Security Policy headers
- [ ] Disable remote module
- [ ] Validate all IPC inputs
- [ ] Encrypt user.db with SQLite encryption extension
- [ ] Secure storage for credentials (keychain integration)
- [ ] Certificate pinning for API calls

#### Step 14.5 — Testing

- [ ] Unit tests: all database queries, morphology engine, search
- [ ] Integration tests: IPC handlers
- [ ] E2E tests (Playwright): core user flows
  - Open app → navigate to Al-Fatiha → read tafsir
  - Search "fasting" → find hadith result → add note
  - Build simple khutbah → export PDF
  - Create reading plan → mark day complete
- [ ] Performance benchmarks: cold start < 3s, search response < 200ms

#### Step 14.6 — Build & Distribution

- [ ] Mac: Universal binary (Intel + Apple Silicon), signed + notarized
- [ ] Windows: NSIS installer + MSIX package, code-signed
- [ ] Linux: AppImage + .deb + .rpm
- [ ] Auto-update via electron-updater (staged rollouts)
- [ ] Crash reporting (Sentry)
- [ ] Analytics (privacy-respecting, opt-in only)

---

## 7. TECHNOLOGY DEPENDENCY MANIFEST

```
Runtime & Build
  electron@31+                   Desktop runtime
  electron-builder@25+           Cross-platform packaging
  electron-updater               Auto-update
  typescript@5+                  Type safety
  vite@5+                       Fast bundler for renderer

Frontend
  react@18                      UI framework
  react-router-dom@6            In-app routing
  @tanstack/react-virtual        Virtualized lists
  zustand@4                     State management
  tailwindcss@3                 Utility CSS
  @radix-ui/*                   Accessible UI primitives
  lucide-react                  Icons
  framer-motion                 Animations
  react-resizable-panels        Resizable panel system
  codemirror@6                  Note editor (Markdown, RTL-aware)
  react-i18next                 Internationalization

Database & Search
  better-sqlite3                SQLite in main process
  minisearch                    In-memory full-text search
  drizzle-orm                   Type-safe SQLite queries

Arabic NLP
  qalsadi (WASM build)          Arabic morphology
  buckwalter                    Transliteration
  custom                        Root extraction utilities

Audio
  howler.js                     Audio playback

Maps
  maplibre-gl                   Islamic Atlas map engine
  pmtiles                       Offline map tiles

Networking & Sync
  pouchdb                       Optional sync database
  axios                         HTTP client for API calls
  stripe.js                     Subscription management

Testing
  vitest                        Unit testing
  @testing-library/react        Component testing
  playwright                    E2E testing

Tooling
  eslint                        Linting
  prettier                      Formatting
  husky                         Git hooks
  changesets                    Versioning
  sentry                        Error tracking
```

---

## 8. FOLDER STRUCTURE (Monorepo)

```
maktabat/
├── packages/
│   ├── main/                          Electron main process
│   │   ├── src/
│   │   │   ├── index.ts               Entry point
│   │   │   ├── window-manager.ts
│   │   │   ├── menu-builder.ts
│   │   │   ├── ipc-handlers/
│   │   │   │   ├── library.ts
│   │   │   │   ├── user.ts
│   │   │   │   ├── audio.ts
│   │   │   │   └── settings.ts
│   │   │   ├── services/
│   │   │   │   ├── library-service.ts
│   │   │   │   ├── user-service.ts
│   │   │   │   ├── download-manager.ts
│   │   │   │   └── auth-service.ts
│   │   │   └── preload.ts
│   │
│   ├── renderer/                      React frontend
│   │   ├── src/
│   │   │   ├── main.tsx
│   │   │   ├── App.tsx
│   │   │   ├── components/
│   │   │   │   ├── shell/             App shell, panels, sidebar
│   │   │   │   ├── quran/             Quran reader components
│   │   │   │   ├── tafsir/            Tafsir viewer
│   │   │   │   ├── hadith/            Hadith browser/viewer
│   │   │   │   ├── search/            Search UI
│   │   │   │   ├── word-study/        Morphology panel
│   │   │   │   ├── factbook/          Factbook UI
│   │   │   │   ├── atlas/             Map component
│   │   │   │   ├── notes/             Notes & highlights
│   │   │   │   ├── khutbah/           Khutbah builder
│   │   │   │   ├── reading-plans/     Progress tracking
│   │   │   │   ├── audio/             Audio player
│   │   │   │   ├── settings/          Settings panel
│   │   │   │   └── ui/                Design system components
│   │   │   ├── hooks/                 Custom React hooks
│   │   │   ├── stores/                Zustand stores
│   │   │   ├── lib/                   Utilities
│   │   │   └── styles/                Global CSS + tokens
│   │
│   ├── shared/                        Shared across packages
│   │   ├── types/
│   │   │   ├── quran.ts
│   │   │   ├── hadith.ts
│   │   │   ├── ipc.ts
│   │   │   └── user.ts
│   │   └── constants/
│   │       ├── colors.ts
│   │       └── collections.ts
│   │
│   ├── database/                      Schema & migrations
│   │   ├── schema/
│   │   │   ├── library.sql
│   │   │   └── user.sql
│   │   ├── migrations/
│   │   └── seeds/
│   │
│   └── arabic-nlp/                    NLP utilities
│       ├── src/
│       │   ├── morphology.ts
│       │   ├── root-extractor.ts
│       │   └── transliteration.ts
│       └── wasm/                      Compiled WASM modules
│
├── assets/                            App icons, fonts
├── resources/                         Bundled seed data
├── electron-builder.config.js
├── package.json
└── pnpm-workspace.yaml
```

---

## 9. PHASE SUMMARY

```
Phase 0  — Foundation & Tooling
Phase 1  — Main Process & IPC
Phase 2  — UI Shell
Phase 3  — Quran Reading Module
Phase 4  — Tafsir Module
Phase 5  — Hadith Module
Phase 6  — Search & AI Assistant
Phase 7  — Linguistic Analysis
Phase 8  — Notes, Annotations, Khutbah
Phase 9  — Factbook & Atlas
Phase 10 — Audio & Recitation
Phase 11 — Sync & Account System
Phase 12 — Library Manager
Phase 13 — Reading Plans
Phase 14 — Polish, Testing & Release
──────────────────────────────────────────────────

```

---

## 10. MVP SCOPE (First Shippable Version)

For an MVP that can go to beta users, scope to:

### MVP Includes

- Full Quran Arabic text + 2 translations (Pickthall, Abdel Haleem)
- Tafsir Ibn Kathir (most requested, available in English)
- Kutub al-Sittah (the six books of Hadith)
- Basic hadith grading display
- Full-text search (Arabic + English)
- Word hover popup (basic: translation + root)
- Notes & highlights
- Bookmarks
- Reading plans (Quran 30/60/365 day)
- Account system + subscription gating
- Mac + Windows builds

### MVP Defers to v1.1

- AI Study Assistant
- Khutbah Builder
- I'rab parser / Grammar diagrams
- Islamic Atlas
- Shia & Ibadi collections
- Fiqh library
- Audio recitation
- Factbook (full)
- Cloud sync
- Linux builds

### MVP Stack (Simplified)

- Skip WASM morphology engine for MVP — use pre-computed DB values only
- Skip PouchDB sync — local-only notes for MVP
- Use simpler search (SQLite FTS5 only, no MiniSearch overlay)

---

_Document version: 1.0 — Maktabat Build Sheet_
_Design Reference: UAE Design System v3.0_
_Architecture Pattern: Logos Bible Software (analogous)_
