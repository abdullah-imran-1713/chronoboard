import {
  NEXT_PRAYER_ORDER,
  type AladhanTimingsResponse,
  type NextPrayer,
  type PrayerAsrSchool,
  type PrayerTimes,
} from '../../types/prayer'
import type { ClockFormat } from '../../types/clock'
import { DEFAULT_WEATHER_LOCATION } from '../../types/weather'
import { useGeolocation } from './useGeolocation'

function cleanTime(time: string): string {
  return time.split(' ')[0]?.trim() ?? time
}

function timeToMinutes(time: string): number {
  const parts = cleanTime(time).split(':').map(Number)
  const hours = parts[0] ?? 0
  const minutes = parts[1] ?? 0
  return hours * 60 + minutes
}

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

/** Format stored 24h "HH:mm" for display using clock setting */
export function formatPrayerClockTime(time24: string, format: ClockFormat): string {
  const parts = cleanTime(time24).split(':').map(Number)
  const hours = parts[0] ?? 0
  const minutes = parts[1] ?? 0

  if (format === '24h') {
    return `${pad2(hours)}:${pad2(minutes)}`
  }

  const period = hours >= 12 ? 'PM' : 'AM'
  const h12 = hours % 12 || 12
  return `${h12}:${pad2(minutes)} ${period}`
}

function formatCountdown(diffMinutes: number): string {
  const hours = Math.floor(diffMinutes / 60)
  const mins = diffMinutes % 60
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
}

function schoolParam(school: PrayerAsrSchool): 0 | 1 {
  return school === 'hanafi' ? 1 : 0
}

export function usePrayerTimes() {
  const now = inject(NOW_INJECTION_KEY)!
  const settings = useSettingsStore()
  const { requestUserLocation } = useGeolocation()
  const prayers = ref<PrayerTimes | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)
  const usingFallback = ref(false)
  const lastCoords = ref<{ lat: number, lon: number } | null>(null)

  async function fetchPrayers(lat: number, lon: number, school: PrayerAsrSchool = settings.prayerAsrSchool) {
    loading.value = true
    error.value = null
    lastCoords.value = { lat, lon }

    try {
      const today = new Date()
      const dd = String(today.getDate()).padStart(2, '0')
      const mm = String(today.getMonth() + 1).padStart(2, '0')
      const yyyy = today.getFullYear()

      const url = `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${lat}&longitude=${lon}&method=1&school=${schoolParam(school)}`
      const response = await $fetch<AladhanTimingsResponse>(url)
      const timings = response.data.timings

      prayers.value = {
        Fajr: cleanTime(timings.Fajr ?? ''),
        Sunrise: cleanTime(timings.Sunrise ?? ''),
        Dhuhr: cleanTime(timings.Dhuhr ?? ''),
        Asr: cleanTime(timings.Asr ?? ''),
        Maghrib: cleanTime(timings.Maghrib ?? ''),
        Isha: cleanTime(timings.Isha ?? ''),
      }
    }
    catch {
      error.value = 'Failed to load prayer times'
      prayers.value = null
    }
    finally {
      loading.value = false
    }
  }

  const displayPrayers = computed((): PrayerTimes | null => {
    if (!prayers.value) return null
    const format = settings.clock.format
    return {
      Fajr: formatPrayerClockTime(prayers.value.Fajr, format),
      Sunrise: formatPrayerClockTime(prayers.value.Sunrise, format),
      Dhuhr: formatPrayerClockTime(prayers.value.Dhuhr, format),
      Asr: formatPrayerClockTime(prayers.value.Asr, format),
      Maghrib: formatPrayerClockTime(prayers.value.Maghrib, format),
      Isha: formatPrayerClockTime(prayers.value.Isha, format),
    }
  })

  const nextPrayer = computed((): NextPrayer | null => {
    if (!prayers.value) return null

    const currentMinutes = now.value.getHours() * 60 + now.value.getMinutes()
    const format = settings.clock.format

    for (const name of NEXT_PRAYER_ORDER) {
      const prayerMinutes = timeToMinutes(prayers.value[name])

      if (prayerMinutes > currentMinutes) {
        const diff = prayerMinutes - currentMinutes
        return {
          name,
          time: formatPrayerClockTime(prayers.value[name], format),
          countdown: formatCountdown(diff),
        }
      }
    }

    return {
      name: 'Fajr',
      time: formatPrayerClockTime(prayers.value.Fajr, format),
      countdown: 'Tomorrow',
    }
  })

  async function init() {
    if (!import.meta.client) return

    loading.value = true
    error.value = null
    usingFallback.value = false

    const location = await requestUserLocation()
    if (location.ok) {
      await fetchPrayers(location.lat, location.lon)
      return
    }

    // Same as weather: when browser/Vercel blocks geolocation, still show times
    usingFallback.value = true
    await fetchPrayers(DEFAULT_WEATHER_LOCATION.lat, DEFAULT_WEATHER_LOCATION.lon)
  }

  async function setAsrSchool(school: PrayerAsrSchool) {
    if (settings.prayerAsrSchool === school) return
    settings.setPrayerAsrSchool(school)
    if (lastCoords.value) {
      await fetchPrayers(lastCoords.value.lat, lastCoords.value.lon, school)
    }
  }

  return {
    prayers: displayPrayers,
    nextPrayer,
    loading,
    error,
    usingFallback,
    asrSchool: computed(() => settings.prayerAsrSchool),
    init,
    fetchPrayers,
    setAsrSchool,
  }
}
