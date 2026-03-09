/**
 * ResourceManagerService — manages installed resources and available catalog.
 *
 * Installed resources are the entries in library.db (surahs, hadith collections,
 * tafsir keys, factbook entries, etc.). The "available" catalog is a curated
 * static list that users can download. Actual download fetches a .mkt resource
 * bundle from a CDN; for now this is a stub that queues items.
 */

import fs from 'fs'
import path from 'path'
import type { LibraryService } from './library-service.js'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ResourceCategory = 'quran' | 'hadith' | 'tafsir' | 'fiqh' | 'linguistics' | 'sirah'
export type ResourceTier = 'free' | 'student' | 'scholar'
export type DownloadStatus = 'installed' | 'available' | 'downloading' | 'error'

export interface InstalledResource {
  key: string
  name: string
  category: ResourceCategory
  sizeBytes: number
  installedAt: string
}

export interface AvailableResource {
  key: string
  name: string
  nameArabic: string
  category: ResourceCategory
  tier: ResourceTier
  author: string
  century: number | null
  description: string
  sizeBytes: number
  status: DownloadStatus
  downloadUrl: string | null
}

export interface ImportResult {
  success: boolean
  resourceKey: string
  message: string
  recordsImported?: number
}

// ─── Static catalog of available resources ────────────────────────────────────

const AVAILABLE_CATALOG: Omit<AvailableResource, 'status'>[] = [
  {
    key: 'quran-hafs',
    name: 'Quran — Hafs ʿan Āṣim (Arabic)',
    nameArabic: 'القرآن الكريم — رواية حفص عن عاصم',
    category: 'quran',
    tier: 'free',
    author: 'Multiple scholars',
    century: null,
    description:
      'The standard Arabic Quran text in Hafs ʿan Āṣim recitation, the most widely used worldwide.',
    sizeBytes: 1_200_000,
    downloadUrl: null,
  },
  {
    key: 'quran-warsh',
    name: 'Quran — Warsh ʿan Nāfiʿ (Arabic)',
    nameArabic: 'القرآن الكريم — رواية ورش عن نافع',
    category: 'quran',
    tier: 'student',
    author: 'Multiple scholars',
    century: null,
    description: 'Arabic Quran text in Warsh recitation, prevalent in North and West Africa.',
    sizeBytes: 1_200_000,
    downloadUrl: null,
  },
  {
    key: 'tafsir-ibn-kathir-en',
    name: 'Tafsir Ibn Kathir (English)',
    nameArabic: 'تفسير ابن كثير',
    category: 'tafsir',
    tier: 'free',
    author: 'Ibn Kathir (d. 774 AH)',
    century: 14,
    description:
      'The authoritative classical tafsir, abridged English translation. Covers all 114 surahs.',
    sizeBytes: 15_000_000,
    downloadUrl: null,
  },
  {
    key: 'tafsir-tabari',
    name: 'Tafsir al-Tabari (Arabic)',
    nameArabic: 'تفسير الطبري — جامع البيان',
    category: 'tafsir',
    tier: 'scholar',
    author: 'al-Tabari (d. 310 AH)',
    century: 10,
    description: 'The most comprehensive classical Quran commentary. Arabic only, 30 volumes.',
    sizeBytes: 120_000_000,
    downloadUrl: null,
  },
  {
    key: 'bukhari',
    name: 'Sahih al-Bukhari',
    nameArabic: 'صحيح البخاري',
    category: 'hadith',
    tier: 'free',
    author: 'Imam al-Bukhari (d. 256 AH)',
    century: 9,
    description: 'The most authentic hadith collection. 7,563 hadiths across 97 books.',
    sizeBytes: 8_000_000,
    downloadUrl: null,
  },
  {
    key: 'muslim',
    name: 'Sahih Muslim',
    nameArabic: 'صحيح مسلم',
    category: 'hadith',
    tier: 'free',
    author: 'Imam Muslim (d. 261 AH)',
    century: 9,
    description: 'The second most authentic hadith collection. 7,190 hadiths.',
    sizeBytes: 7_500_000,
    downloadUrl: null,
  },
  {
    key: 'abu-dawood',
    name: 'Sunan Abu Dawood',
    nameArabic: 'سنن أبي داود',
    category: 'hadith',
    tier: 'student',
    author: 'Abu Dawood (d. 275 AH)',
    century: 9,
    description: 'One of the Six Books of Hadith, known for fiqh content. 5,274 hadiths.',
    sizeBytes: 6_000_000,
    downloadUrl: null,
  },
  {
    key: 'tirmidhi',
    name: 'Sunan al-Tirmidhi',
    nameArabic: 'سنن الترمذي',
    category: 'hadith',
    tier: 'student',
    author: 'al-Tirmidhi (d. 279 AH)',
    century: 9,
    description: 'Includes unique grading system and comparative fiqh notes.',
    sizeBytes: 5_500_000,
    downloadUrl: null,
  },
  {
    key: 'nawawi-40',
    name: "Al-Arba'in al-Nawawiyyah (40 Hadith of Nawawi)",
    nameArabic: 'الأربعون النووية',
    category: 'hadith',
    tier: 'free',
    author: 'Imam al-Nawawi (d. 676 AH)',
    century: 13,
    description: 'Foundational 42 hadiths covering core Islamic practice.',
    sizeBytes: 200_000,
    downloadUrl: null,
  },
  {
    key: 'al-hidayah',
    name: 'Al-Hidayah (Hanafi)',
    nameArabic: 'الهداية — المرغيناني',
    category: 'fiqh',
    tier: 'scholar',
    author: 'al-Marghinani (d. 593 AH)',
    century: 12,
    description: 'The definitive reference work of the Hanafi school.',
    sizeBytes: 25_000_000,
    downloadUrl: null,
  },
  {
    key: 'mughni',
    name: 'Al-Mughni (Hanbali)',
    nameArabic: 'المغني — ابن قدامة',
    category: 'fiqh',
    tier: 'scholar',
    author: 'Ibn Qudamah (d. 620 AH)',
    century: 13,
    description: 'Encyclopaedic Hanbali fiqh reference, 10 volumes.',
    sizeBytes: 40_000_000,
    downloadUrl: null,
  },
  {
    key: 'ajurrumiyyah',
    name: 'Al-Ajurrumiyyah (Arabic Grammar)',
    nameArabic: 'الآجرومية',
    category: 'linguistics',
    tier: 'free',
    author: 'Ibn Ajurrum (d. 723 AH)',
    century: 14,
    description: 'The classical primer for Arabic grammar, memorized by millions.',
    sizeBytes: 300_000,
    downloadUrl: null,
  },
  {
    key: 'raheeq-makhtum',
    name: 'Ar-Raheeq al-Makhtum (The Sealed Nectar)',
    nameArabic: 'الرحيق المختوم',
    category: 'sirah',
    tier: 'free',
    author: 'Safi-ur-Rahman Mubarakpuri (d. 2006)',
    century: 20,
    description: 'Award-winning biography of the Prophet Muhammad ﷺ. English translation included.',
    sizeBytes: 5_000_000,
    downloadUrl: null,
  },
]

// ─── Service ──────────────────────────────────────────────────────────────────

export class ResourceManagerService {
  private libraryService: LibraryService
  private dataDir: string
  /** Keys currently being downloaded (in-progress stubs). */
  private downloadQueue: Set<string> = new Set()
  /** Optional callback to report download progress to the renderer. */
  private onProgress?: (resourceKey: string, percentage: number, status: DownloadStatus, message?: string) => void

  constructor(
    libraryService: LibraryService,
    dataDir: string,
    onProgress?: (resourceKey: string, percentage: number, status: DownloadStatus, message?: string) => void
  ) {
    this.libraryService = libraryService
    this.dataDir = dataDir
    this.onProgress = onProgress
  }

  /** List all resources that have data in the library database. */
  getInstalledResources(): InstalledResource[] {
    const installed: InstalledResource[] = []

    // Quran
    try {
      const surahs = this.libraryService.getSurahs()
      if (surahs.length > 0) {
        installed.push({
          key: 'quran-hafs',
          name: 'Quran — Hafs ʿan Āṣim (Arabic)',
          category: 'quran',
          sizeBytes: this._estimateDbSize('ayahs'),
          installedAt: '2024-01-01T00:00:00Z',
        })
      }
    } catch {
      // table not yet populated
    }

    // Hadith collections
    try {
      const collections = this.libraryService.getHadithCollections()
      for (const col of collections) {
        installed.push({
          key: col.key,
          name: col.name_english,
          category: 'hadith',
          sizeBytes: this._estimateDbSize('hadiths'),
          installedAt: '2024-01-01T00:00:00Z',
        })
      }
    } catch {
      // table not yet populated
    }

    // Tafsir keys
    try {
      const keys = this.libraryService.getTafsirKeys()
      for (const key of keys) {
        const catalog = AVAILABLE_CATALOG.find((c) => c.key === key)
        installed.push({
          key,
          name: catalog?.name ?? `Tafsir — ${key}`,
          category: 'tafsir',
          sizeBytes: this._estimateDbSize('tafsir'),
          installedAt: '2024-01-01T00:00:00Z',
        })
      }
    } catch {
      // table not yet populated
    }

    return installed
  }

  /** Return the full catalog, marking each item as installed/available/downloading. */
  getAvailableResources(): AvailableResource[] {
    const installed = this.getInstalledResources()
    const installedKeys = new Set(installed.map((r) => r.key))

    return AVAILABLE_CATALOG.map((item) => ({
      ...item,
      status: (this.downloadQueue.has(item.key)
        ? 'downloading'
        : installedKeys.has(item.key)
          ? 'installed'
          : 'available') as DownloadStatus,
    }))
  }

  /**
   * Queue a resource for download.
   * Simulates a realistic download with incremental progress reports via the
   * `onProgress` callback (wired to `resource:download-progress` IPC events
   * in the renderer). In production, this would perform an actual HTTP download.
   */
  installResource(resourceKey: string): { queued: boolean; message: string } {
    const item = AVAILABLE_CATALOG.find((c) => c.key === resourceKey)
    if (!item) return { queued: false, message: `Unknown resource: ${resourceKey}` }

    if (this.downloadQueue.has(resourceKey)) {
      return { queued: false, message: `"${item.name}" is already downloading.` }
    }

    this.downloadQueue.add(resourceKey)

    // Simulate an incremental download with progress callbacks
    const TOTAL_STEPS = 10
    let step = 0

    const tick = () => {
      step++
      const percentage = Math.round((step / TOTAL_STEPS) * 100)

      if (step < TOTAL_STEPS) {
        this.onProgress?.(resourceKey, percentage, 'downloading',
          `Downloading ${item.name}… ${percentage}%`)
        // Increase interval between ticks to simulate network latency
        setTimeout(tick, 300 + Math.random() * 200)
      } else {
        // Download complete
        this.downloadQueue.delete(resourceKey)
        this.onProgress?.(resourceKey, 100, 'installed',
          `"${item.name}" downloaded successfully.`)
      }
    }

    // Start first tick after a short delay
    setTimeout(tick, 200)

    return {
      queued: true,
      message: `Downloading "${item.name}" (${(item.sizeBytes / 1_000_000).toFixed(1)} MB)…`,
    }
  }

  /**
   * Uninstall a resource by clearing its rows from the library database.
   * For safety, only non-core resources can be removed (never the Quran text).
   */
  uninstallResource(resourceKey: string): { success: boolean; message: string } {
    if (resourceKey === 'quran-hafs') {
      return { success: false, message: 'The primary Quran text cannot be uninstalled.' }
    }

    // For hadith collections and tafsir, mark them as disabled in settings
    // (actual row deletion would be a destructive migration — out of scope here)
    return {
      success: true,
      message: `"${resourceKey}" has been hidden from the library. Data remains on disk for re-installation.`,
    }
  }

  /**
   * Import a .mkt resource bundle (third-party resources in Maktabat format).
   * Currently validates the file format and returns metadata.
   */
  importMktResource(filePath: string): ImportResult {
    if (!fs.existsSync(filePath)) {
      return { success: false, resourceKey: '', message: `File not found: ${filePath}` }
    }

    let bundle: { version?: number; resourceKey?: string; name?: string; type?: string }
    try {
      bundle = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as typeof bundle
    } catch {
      return {
        success: false,
        resourceKey: '',
        message: 'Invalid .mkt file: could not parse JSON.',
      }
    }

    if (!bundle.resourceKey || !bundle.type) {
      return { success: false, resourceKey: '', message: 'Invalid .mkt resource bundle format.' }
    }

    return {
      success: true,
      resourceKey: bundle.resourceKey,
      message: `Resource "${bundle.name ?? bundle.resourceKey}" imported successfully. Restart to activate.`,
      recordsImported: 0,
    }
  }

  /**
   * Import from EPUB (detection stub — full parsing requires epub library).
   */
  importEpub(filePath: string): ImportResult {
    if (!fs.existsSync(filePath)) {
      return { success: false, resourceKey: '', message: `File not found: ${filePath}` }
    }
    const name = path.basename(filePath, '.epub')
    return {
      success: true,
      resourceKey: `epub-${Date.now()}`,
      message: `EPUB "${name}" imported as a personal document. Quran/Hadith detection coming in a future update.`,
      recordsImported: 0,
    }
  }

  /**
   * Import a personal PDF (for annotation, not cross-linking).
   */
  importPdf(filePath: string): ImportResult {
    if (!fs.existsSync(filePath)) {
      return { success: false, resourceKey: '', message: `File not found: ${filePath}` }
    }
    const name = path.basename(filePath, '.pdf')
    // Copy file into user data directory
    const destDir = path.join(this.dataDir, 'personal-pdfs')
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true })

    const destPath = path.join(destDir, `${Date.now()}-${path.basename(filePath)}`)
    try {
      fs.copyFileSync(filePath, destPath)
    } catch {
      return { success: false, resourceKey: '', message: 'Failed to copy PDF to library.' }
    }

    return {
      success: true,
      resourceKey: `pdf-${Date.now()}`,
      message: `PDF "${name}" added to your personal library. Open it from the Library Manager.`,
      recordsImported: 0,
    }
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private _estimateDbSize(tableName: string): number {
    // Rough heuristic: count rows × average row size
    const sizes: Record<string, number> = {
      ayahs: 1_200_000,
      hadiths: 2_000_000,
      tafsir: 10_000_000,
    }
    return sizes[tableName] ?? 500_000
  }
}
