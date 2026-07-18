import {
  NEXT_PRAYER_ORDER,
  type AladhanTimingsResponse,
  type NextPrayer,
  type PrayerAsrSchool,
  type PrayerTimes,
} from '../../types/prayer'
import type { ClockFormat } from '../../types/clock'
import { useGeolocation } from './useGeolocation'

/** Shared across Prayer Times + Next Prayer so Shafi/Hanafi stays consistent */
const sharedPrayers = ref<PrayerTimes | null>(null)
const sharedLoading = ref(false)
const sharedError = ref<string | null>(null)
const sharedCoords = ref<{ lat: number, lon: number } | null>(null)
const sharedFetchedSchool = ref<PrayerAsrSchool | null>(null)
let initInFlight: Promise<void> | null = null
let fetchInFlight: Promise<void> | null = null
let schoolWatcherBound = false

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

async function fetchPrayersShared(
  lat: number,
  lon: number,
  school: PrayerAsrSchool,
): Promise<void> {
  if (fetchInFlight) return fetchInFlight

  fetchInFlight = (async () => {
    sharedLoading.value = true
    sharedError.value = null
    sharedCoords.value = { lat, lon }

    try {
      const today = new Date()
      const dd = String(today.getDate()).padStart(2, '0')
      const mm = String(today.getMonth() + 1).padStart(2, '0')
      const yyyy = today.getFullYear()

      const url = `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${lat}&longitude=${lon}&method=1&school=${schoolParam(school)}`
      const response = await $fetch<AladhanTimingsResponse>(url)
      const timings = response.data.timings

      sharedPrayers.value = {
        Fajr: cleanTime(timings.Fajr ?? ''),
        Sunrise: cleanTime(timings.Sunrise ?? ''),
        Dhuhr: cleanTime(timings.Dhuhr ?? ''),
        Asr: cleanTime(timings.Asr ?? ''),
        Maghrib: cleanTime(timings.Maghrib ?? ''),
        Isha: cleanTime(timings.Isha ?? ''),
      }
      sharedFetchedSchool.value = school
    }
    catch {
      sharedError.value = 'Failed to load prayer times'
      sharedPrayers.value = null
      sharedFetchedSchool.value = null
    }
    finally {
      sharedLoading.value = false
      fetchInFlight = null
    }
  })()

  return fetchInFlight
}

export function usePrayerTimes() {
  const now = inject(NOW_INJECTION_KEY)!
  const settings = useSettingsStore()
  const { requestUserLocation } = useGeolocation()

  // One watcher for the whole app — school toggle in either widget updates both
  if (import.meta.client && !schoolWatcherBound) {
    schoolWatcherBound = true
    watch(
      () => settings.prayerAsrSchool,
      (school) => {
        if (!sharedCoords.value) return
        if (sharedFetchedSchool.value === school) return
        void fetchPrayersShared(sharedCoords.value.lat, sharedCoords.value.lon, school)
      },
    )
  }

  const displayPrayers = computed((): PrayerTimes | null => {
    if (!sharedPrayers.value) return null
    const format = settings.clock.format
    return {
      Fajr: formatPrayerClockTime(sharedPrayers.value.Fajr, format),
      Sunrise: formatPrayerClockTime(sharedPrayers.value.Sunrise, format),
      Dhuhr: formatPrayerClockTime(sharedPrayers.value.Dhuhr, format),
      Asr: formatPrayerClockTime(sharedPrayers.value.Asr, format),
      Maghrib: formatPrayerClockTime(sharedPrayers.value.Maghrib, format),
      Isha: formatPrayerClockTime(sharedPrayers.value.Isha, format),
    }
  })

  const nextPrayer = computed((): NextPrayer | null => {
    if (!sharedPrayers.value) return null

    const currentMinutes = now.value.getHours() * 60 + now.value.getMinutes()
    const format = settings.clock.format

    for (const name of NEXT_PRAYER_ORDER) {
      const prayerMinutes = timeToMinutes(sharedPrayers.value[name])

      if (prayerMinutes > currentMinutes) {
        const diff = prayerMinutes - currentMinutes
        return {
          name,
          time: formatPrayerClockTime(sharedPrayers.value[name], format),
          countdown: formatCountdown(diff),
        }
      }
    }

    return {
      name: 'Fajr',
      time: formatPrayerClockTime(sharedPrayers.value.Fajr, format),
      countdown: formatCountdown(
        (24 * 60 - currentMinutes) + timeToMinutes(sharedPrayers.value.Fajr),
      ),
    }
  })

  async function init() {
    if (!import.meta.client) return

    // Already have data for the active school — both widgets can share it
    if (
      sharedPrayers.value
      && sharedFetchedSchool.value === settings.prayerAsrSchool
      && sharedCoords.value
    ) {
      return
    }

    if (initInFlight) return initInFlight

    initInFlight = (async () => {
      sharedLoading.value = true
      sharedError.value = null

      const location = await requestUserLocation()
      if (!location.ok) {
        sharedError.value = 'Location needed for prayer times'
        sharedPrayers.value = null
        sharedLoading.value = false
        return
      }

      await fetchPrayersShared(location.lat, location.lon, settings.prayerAsrSchool)
    })().finally(() => {
      initInFlight = null
    })

    return initInFlight
  }

  async function setAsrSchool(school: PrayerAsrSchool) {
    if (settings.prayerAsrSchool === school) return
    settings.setPrayerAsrSchool(school)
    // Watcher refetch handles sync for both widgets
  }

  async function fetchPrayers(lat: number, lon: number, school: PrayerAsrSchool = settings.prayerAsrSchool) {
    await fetchPrayersShared(lat, lon, school)
  }

  return {
    prayers: displayPrayers,
    nextPrayer,
    loading: sharedLoading,
    error: sharedError,
    asrSchool: computed(() => settings.prayerAsrSchool),
    init,
    fetchPrayers,
    setAsrSchool,
  }
}
