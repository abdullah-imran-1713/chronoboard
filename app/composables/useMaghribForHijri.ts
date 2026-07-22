import type { AladhanTimingsResponse } from '../../types/prayer'
import { useGeolocation } from './useGeolocation'

function civilDayKey(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

function cleanTime(time: string): string {
  return time.split(' ')[0]?.trim() ?? time
}

function timeToMinutes(time: string): number {
  const parts = cleanTime(time).split(':').map(Number)
  const hours = parts[0] ?? 0
  const minutes = parts[1] ?? 0
  return hours * 60 + minutes
}

/** Maghrib (minutes from midnight) keyed by civil day dd-mm-yyyy */
const maghribByDay = ref<Record<string, number>>({})
let fetchInFlight: Promise<number | null> | null = null
let lastFetchKey = ''

/**
 * Islamic day starts at Maghrib.
 * After Maghrib on civil day D → use gToH(D+1); before Maghrib → gToH(D).
 * If Maghrib is unavailable (no location), falls back to midnight civil day.
 */
export function effectiveGregorianForHijri(
  now: Date,
  maghribMinutes: number | null,
): Date {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (maghribMinutes == null) return d

  const current = now.getHours() * 60 + now.getMinutes()
  if (current >= maghribMinutes) {
    d.setDate(d.getDate() + 1)
  }
  return d
}

export function useMaghribForHijri() {
  const { requestUserLocation } = useGeolocation()

  async function ensureMaghribMinutes(now: Date): Promise<number | null> {
    if (!import.meta.client) return null

    const dayKey = civilDayKey(now)
    const cached = maghribByDay.value[dayKey]
    if (cached != null) return cached

    if (fetchInFlight && lastFetchKey === dayKey) return fetchInFlight

    lastFetchKey = dayKey
    fetchInFlight = (async () => {
      const location = await requestUserLocation()
      if (!location.ok) return null

      try {
        const url = `https://api.aladhan.com/v1/timings/${dayKey}?latitude=${location.lat}&longitude=${location.lon}&method=1`
        const response = await $fetch<AladhanTimingsResponse>(url)
        const maghrib = cleanTime(response.data.timings.Maghrib ?? '')
        if (!maghrib) return null
        const minutes = timeToMinutes(maghrib)
        maghribByDay.value = { ...maghribByDay.value, [dayKey]: minutes }
        return minutes
      }
      catch {
        return null
      }
      finally {
        fetchInFlight = null
      }
    })()

    return fetchInFlight
  }

  return {
    ensureMaghribMinutes,
    maghribByDay,
  }
}
