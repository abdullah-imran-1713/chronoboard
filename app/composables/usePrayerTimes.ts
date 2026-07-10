import {
  NEXT_PRAYER_ORDER,
  type AladhanTimingsResponse,
  type NextPrayer,
  type PrayerTimes,
} from '../../types/prayer'

function cleanTime(time: string): string {
  return time.split(' ')[0]?.trim() ?? time
}

function timeToMinutes(time: string): number {
  const parts = cleanTime(time).split(':').map(Number)
  const hours = parts[0] ?? 0
  const minutes = parts[1] ?? 0
  return hours * 60 + minutes
}

function formatCountdown(diffMinutes: number): string {
  const hours = Math.floor(diffMinutes / 60)
  const mins = diffMinutes % 60
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
}

export function usePrayerTimes() {
  const now = inject(NOW_INJECTION_KEY)!
  const prayers = ref<PrayerTimes | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  async function fetchPrayers(lat: number, lon: number) {
    loading.value = true
    error.value = null

    try {
      const today = new Date()
      const dd = String(today.getDate()).padStart(2, '0')
      const mm = String(today.getMonth() + 1).padStart(2, '0')
      const yyyy = today.getFullYear()

      const url = `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${lat}&longitude=${lon}&method=1`
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
    } catch {
      error.value = 'Failed to load prayer times'
      prayers.value = null
    } finally {
      loading.value = false
    }
  }

  const nextPrayer = computed((): NextPrayer | null => {
    if (!prayers.value) return null

    const currentMinutes = now.value.getHours() * 60 + now.value.getMinutes()

    for (const name of NEXT_PRAYER_ORDER) {
      const prayerMinutes = timeToMinutes(prayers.value[name])

      if (prayerMinutes > currentMinutes) {
        const diff = prayerMinutes - currentMinutes
        return {
          name,
          time: prayers.value[name],
          countdown: formatCountdown(diff),
        }
      }
    }

    return {
      name: 'Fajr',
      time: prayers.value.Fajr,
      countdown: 'Tomorrow',
    }
  })

  function getUserLocation(): Promise<{ lat: number, lon: number }> {
    return new Promise((resolve, reject) => {
      if (!import.meta.client || !navigator.geolocation) {
        reject(new Error('Geolocation not supported'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        err => reject(err),
      )
    })
  }

  async function init() {
    if (!import.meta.client) return

    loading.value = true
    error.value = null

    try {
      const { lat, lon } = await getUserLocation()
      await fetchPrayers(lat, lon)
    } catch {
      error.value = 'Location needed for prayer times'
      prayers.value = null
      loading.value = false
    }
  }

  return {
    prayers,
    nextPrayer,
    loading,
    error,
    init,
    fetchPrayers,
  }
}
