// ─── Shared renderer utilities ────────────────────────────────────────────────

/**
 * Format an ISO date string as a localised short date (e.g. "Mar 9, 2026").
 * Returns "No date" when the value is null/undefined.
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'No date'
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

/**
 * Parse a JSON-serialised string array, returning an empty array on failure.
 */
export function parseTags(tagsJson: string): string[] {
  try {
    return JSON.parse(tagsJson) as string[]
  } catch {
    return []
  }
}

/**
 * Return a human-readable label for a resource key (e.g. "quran:2" → "Quran — Surah 2").
 */
export function resourceLabel(resourceKey: string): string {
  if (resourceKey.startsWith('quran:')) return `Quran — Surah ${resourceKey.replace('quran:', '')}`
  if (resourceKey.startsWith('hadith:')) return `Hadith — ${resourceKey.replace('hadith:', '')}`
  if (resourceKey.startsWith('tafsir:')) return `Tafsir — ${resourceKey.replace('tafsir:', '')}`
  if (resourceKey.startsWith('text:')) {
    const label = resourceKey.replace('text:', '')
    return label || 'General'
  }
  return resourceKey
}
