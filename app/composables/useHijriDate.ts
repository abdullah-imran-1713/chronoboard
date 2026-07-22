import { ref, computed, watch } from 'vue'
import type { Ref } from 'vue'
import type { HijriLocale } from '../../types/date'
import { effectiveGregorianForHijri, useMaghribForHijri } from './useMaghribForHijri'

interface UseHijriDateOptions {
  now: Ref<Date>
  locale: Ref<HijriLocale>
}

export interface HijriMonthNames {
  en: string
  ar: string
}

export interface HijriCacheEntry {
  day: string
  month: HijriMonthNames
  /** Aladhan month number 1–12 when known */
  monthNumber?: number
  year: string
}

interface AladhanGToHResponse {
  code: number
  status: string
  data: {
    hijri: {
      day: string
      month: HijriMonthNames & { number?: number }
      year: string
    }
  }
}

const hijriCache = new Map<string, HijriCacheEntry>()

const intlLocaleMap: Record<HijriLocale, string> = {
  en: 'en-u-ca-islamic-civil',
  ar: 'ar-u-ca-islamic-civil',
}

export function formatGregorianKey(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

function formatHijriDisplay(
  entry: HijriCacheEntry,
  locale: HijriLocale,
): string {
  const month = locale === 'ar' ? entry.month.ar : entry.month.en
  if (locale === 'ar') {
    return `${entry.day} ${month} ${entry.year} هـ`
  }
  return `${entry.day} ${month} ${entry.year} AH`
}

function intlFallback(date: Date, locale: HijriLocale): HijriCacheEntry {
  const intlLocale = intlLocaleMap[locale]
  const month = new Intl.DateTimeFormat(intlLocale, { month: 'long' }).format(date)
  const day = new Intl.DateTimeFormat(intlLocale, { day: 'numeric' }).format(date)
  const year = new Intl.DateTimeFormat(intlLocale, { year: 'numeric' }).format(date)

  return {
    day,
    month: { en: month, ar: month },
    year,
  }
}

export async function fetchHijriFromApi(gregorianKey: string): Promise<HijriCacheEntry> {
  const cached = hijriCache.get(gregorianKey)
  if (cached) return cached

  const response = await $fetch<AladhanGToHResponse>(
    `https://api.aladhan.com/v1/gToH?date=${gregorianKey}`,
  )

  const hijri = response.data.hijri
  const entry: HijriCacheEntry = {
    day: hijri.day,
    month: { en: hijri.month.en, ar: hijri.month.ar },
    monthNumber: hijri.month.number,
    year: hijri.year,
  }

  hijriCache.set(gregorianKey, entry)
  return entry
}

export function useHijriDate(options: UseHijriDateOptions) {
  const settings = useSettingsStore()
  const { ensureMaghribMinutes, maghribByDay } = useMaghribForHijri()

  const hijriData = ref<HijriCacheEntry | null>(null)
  const loading = ref(false)
  const error = ref(false)
  const maghribMinutes = ref<number | null>(null)

  async function loadHijri() {
    const now = options.now.value
    loading.value = true
    error.value = false

    try {
      if (settings.hijriChangeAtMaghrib) {
        maghribMinutes.value = await ensureMaghribMinutes(now)
      }
      else {
        maghribMinutes.value = null
      }

      const civil = effectiveGregorianForHijri(
        now,
        maghribMinutes.value,
        settings.hijriChangeAtMaghrib,
      )
      const gregorianKey = formatGregorianKey(civil)
      const cached = hijriCache.get(gregorianKey)

      if (cached) {
        hijriData.value = cached
        return
      }

      hijriData.value = await fetchHijriFromApi(gregorianKey)
    }
    catch {
      error.value = true
      hijriData.value = intlFallback(options.now.value, options.locale.value)
    }
    finally {
      loading.value = false
    }
  }

  watch(
    () => [
      formatGregorianKey(options.now.value),
      options.now.value.getHours(),
      options.now.value.getMinutes(),
      settings.hijriChangeAtMaghrib,
      maghribByDay.value[formatGregorianKey(options.now.value)] ?? null,
    ],
    () => {
      void loadHijri()
    },
    { immediate: true },
  )

  const month = computed(() => {
    if (!hijriData.value) return ''
    return options.locale.value === 'ar'
      ? hijriData.value.month.ar
      : hijriData.value.month.en
  })

  const day = computed(() => hijriData.value?.day ?? '')
  const year = computed(() => hijriData.value?.year ?? '')

  const formatted = computed(() => {
    if (!hijriData.value) return ''
    return formatHijriDisplay(hijriData.value, options.locale.value)
  })

  return {
    formatted,
    day,
    month,
    year,
    loading,
    error,
  }
}
