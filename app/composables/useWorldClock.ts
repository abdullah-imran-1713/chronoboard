import { NOW_INJECTION_KEY } from './useNow'
import {
  DEFAULT_WORLD_CLOCK_ZONES,
  POPULAR_TIMEZONES,
  WORLD_CLOCK_STORAGE_KEY,
  WORLD_CLOCK_STORAGE_VERSION,
  WORLD_CLOCK_VERSION_KEY,
  cityLabel,
  normalizeTimezone,
  resolveAvailableTimezones,
  sanitizeTimezones,
} from '../../utils/worldClock'

export function useWorldClock() {
  const now = inject(NOW_INJECTION_KEY)!
  const availableTimezones = computed(() => resolveAvailableTimezones())
  const timezones = ref<string[]>(
    sanitizeTimezones([...DEFAULT_WORLD_CLOCK_ZONES], availableTimezones.value),
  )

  function loadZones() {
    if (!import.meta.client) return

    const available = availableTimezones.value
    let version = 0
    try {
      version = Number(localStorage.getItem(WORLD_CLOCK_VERSION_KEY) || 0)
    }
    catch {
      version = 0
    }

    let parsed: unknown = null
    try {
      const saved = localStorage.getItem(WORLD_CLOCK_STORAGE_KEY)
      if (saved) parsed = JSON.parse(saved)
    }
    catch {
      parsed = null
    }

    // v1 stock was Karachi + blank UTC + NY + London — replace once with intl defaults.
    // Customized lists are kept (after sanitize).
    if (version < WORLD_CLOCK_STORAGE_VERSION) {
      const raw = Array.isArray(parsed)
        ? parsed.filter((z): z is string => typeof z === 'string')
        : []
      const legacyStock = isLegacyStockDefault(raw)
      timezones.value = legacyStock || raw.length === 0
        ? sanitizeTimezones([...DEFAULT_WORLD_CLOCK_ZONES], available)
        : sanitizeTimezones(raw, available)
      saveZones()
      return
    }

    if (parsed) {
      timezones.value = sanitizeTimezones(parsed, available)
      saveZones()
      return
    }

    timezones.value = sanitizeTimezones([...DEFAULT_WORLD_CLOCK_ZONES], available)
    saveZones()
  }

  function isLegacyStockDefault(zones: string[]): boolean {
    const normalized = zones.map(z => (z === 'Etc/UTC' ? 'UTC' : z))
    const set = new Set(normalized)
    return set.size === 4
      && set.has('Asia/Karachi')
      && set.has('UTC')
      && set.has('America/New_York')
      && set.has('Europe/London')
  }

  function saveZones() {
    if (!import.meta.client) return
    try {
      localStorage.setItem(WORLD_CLOCK_STORAGE_KEY, JSON.stringify(timezones.value))
      localStorage.setItem(WORLD_CLOCK_VERSION_KEY, String(WORLD_CLOCK_STORAGE_VERSION))
    }
    catch {
      // ignore quota / private mode
    }
  }

  function formatTime(timezone: string): string {
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(now.value)
    }
    catch {
      return '--:--:--'
    }
  }

  function formatLabel(timezone: string): string {
    return cityLabel(timezone)
  }

  function nextUnusedTimezone(): string | null {
    const used = new Set(timezones.value)
    const available = availableTimezones.value

    for (const zone of POPULAR_TIMEZONES) {
      const resolved = normalizeTimezone(zone, available)
      if (resolved && !used.has(resolved)) return resolved
    }

    return available.find(tz => !used.has(tz)) ?? null
  }

  function addTimezone(timezone?: string) {
    if (timezones.value.length >= 4) return

    const available = availableTimezones.value
    const candidate = timezone
      ? normalizeTimezone(timezone, available)
      : nextUnusedTimezone()

    if (!candidate || timezones.value.includes(candidate)) return
    timezones.value.push(candidate)
    saveZones()
  }

  function removeTimezone(timezone: string) {
    if (timezones.value.length <= 1) return
    timezones.value = timezones.value.filter(tz => tz !== timezone)
    saveZones()
  }

  function updateTimezone(index: number, timezone: string) {
    const resolved = normalizeTimezone(timezone, availableTimezones.value)
    if (!resolved) return

    const next = [...timezones.value]
    // Avoid duplicates when changing an existing row
    if (next.some((tz, i) => i !== index && tz === resolved)) return
    next[index] = resolved
    timezones.value = next
    saveZones()
  }

  onMounted(loadZones)

  return {
    timezones,
    availableTimezones,
    formatTime,
    formatLabel,
    addTimezone,
    removeTimezone,
    updateTimezone,
    nextUnusedTimezone,
  }
}
