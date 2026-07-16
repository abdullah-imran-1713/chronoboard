import { NOW_INJECTION_KEY } from './useNow'
import {
  DEFAULT_WORLD_CLOCK_ZONES,
  FALLBACK_TIMEZONES,
  WORLD_CLOCK_STORAGE_KEY,
} from '../../utils/worldClock'

export function useWorldClock() {
  const now = inject(NOW_INJECTION_KEY)!
  const timezones = ref<string[]>([...DEFAULT_WORLD_CLOCK_ZONES])

  const availableTimezones = computed(() => {
    if (typeof Intl !== 'undefined' && 'supportedValuesOf' in Intl) {
      try {
        return (Intl as typeof Intl & { supportedValuesOf: (key: string) => string[] })
          .supportedValuesOf('timeZone')
      } catch {
        return [...FALLBACK_TIMEZONES]
      }
    }
    return [...FALLBACK_TIMEZONES]
  })

  function loadZones() {
    if (!import.meta.client) return
    try {
      const saved = localStorage.getItem(WORLD_CLOCK_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as string[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          timezones.value = parsed.slice(0, 4)
        }
      }
    } catch {
      // ignore
    }
  }

  function saveZones() {
    if (!import.meta.client) return
    localStorage.setItem(WORLD_CLOCK_STORAGE_KEY, JSON.stringify(timezones.value))
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
    } catch {
      return '--:--:--'
    }
  }

  function formatLabel(timezone: string): string {
    return timezone.replace(/_/g, ' ').split('/').pop() ?? timezone
  }

  function addTimezone(timezone: string) {
    if (!timezone || timezones.value.includes(timezone) || timezones.value.length >= 4) return
    timezones.value.push(timezone)
    saveZones()
  }

  function removeTimezone(timezone: string) {
    if (timezones.value.length <= 1) return
    timezones.value = timezones.value.filter(tz => tz !== timezone)
    saveZones()
  }

  function updateTimezone(index: number, timezone: string) {
    if (!timezone) return
    const next = [...timezones.value]
    next[index] = timezone
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
  }
}
