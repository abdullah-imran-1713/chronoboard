export const WORLD_CLOCK_STORAGE_KEY = 'chronoboard_world_clock_zones'

/** Storage schema bump — migrates old Karachi/UTC defaults once. */
export const WORLD_CLOCK_STORAGE_VERSION = 2
export const WORLD_CLOCK_VERSION_KEY = 'chronoboard_world_clock_zones_v'

/**
 * International defaults: widely recognized, not locale-specific.
 * Users add their own city (e.g. Karachi) via “+ Add timezone”.
 */
export const DEFAULT_WORLD_CLOCK_ZONES = [
  'America/New_York',
  'Europe/London',
] as const

/** Preferred order when suggesting the next zone to add. */
export const POPULAR_TIMEZONES = [
  'America/New_York',
  'Europe/London',
  'Europe/Paris',
  'Asia/Dubai',
  'Asia/Tokyo',
  'Asia/Singapore',
  'Asia/Kolkata',
  'Asia/Karachi',
  'America/Los_Angeles',
  'America/Chicago',
  'Australia/Sydney',
  'Pacific/Auckland',
  'UTC',
] as const

export const FALLBACK_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Dubai',
  'Asia/Karachi',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
  'Pacific/Auckland',
]

/** Map aliases so saved/default IDs always match `<select>` option values. */
const ZONE_ALIASES: Record<string, string[]> = {
  UTC: ['UTC', 'Etc/UTC'],
  'Etc/UTC': ['Etc/UTC', 'UTC'],
}

export function resolveAvailableTimezones(): string[] {
  if (typeof Intl !== 'undefined' && 'supportedValuesOf' in Intl) {
    try {
      return (Intl as typeof Intl & { supportedValuesOf: (key: string) => string[] })
        .supportedValuesOf('timeZone')
    }
    catch {
      return [...FALLBACK_TIMEZONES]
    }
  }
  return [...FALLBACK_TIMEZONES]
}

/** Pick a zone id that exists in `available`, preferring `preferred`. */
export function normalizeTimezone(preferred: string, available: string[]): string | null {
  const raw = String(preferred || '').trim()
  if (!raw) return null
  if (available.includes(raw)) return raw

  const aliases = ZONE_ALIASES[raw]
  if (aliases) {
    for (const alias of aliases) {
      if (available.includes(alias)) return alias
    }
  }

  return null
}

export function sanitizeTimezones(zones: unknown, available: string[]): string[] {
  if (!Array.isArray(zones)) return [...DEFAULT_WORLD_CLOCK_ZONES]

  const next: string[] = []
  const seen = new Set<string>()

  for (const entry of zones) {
    if (typeof entry !== 'string') continue
    const resolved = normalizeTimezone(entry, available)
    if (!resolved || seen.has(resolved)) continue
    seen.add(resolved)
    next.push(resolved)
    if (next.length >= 4) break
  }

  return next.length > 0 ? next : [...DEFAULT_WORLD_CLOCK_ZONES]
}

export function cityLabel(timezone: string): string {
  const raw = String(timezone || '').trim()
  if (!raw) return 'Unknown'
  if (raw === 'UTC' || raw === 'Etc/UTC') return 'UTC'
  return raw.replace(/_/g, ' ').split('/').pop() ?? raw
}
