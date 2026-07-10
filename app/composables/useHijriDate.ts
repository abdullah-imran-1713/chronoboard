import { ref, computed, watch } from 'vue'
import type { Ref } from 'vue'
import type { HijriLocale } from '../../types/date'

interface UseHijriDateOptions {
  now: Ref<Date>
  locale: Ref<HijriLocale>
}

interface HijriMonthNames {
  en: string
  ar: string
}

interface HijriCacheEntry {
  day: string
  month: HijriMonthNames
  year: string
}

interface AladhanGToHResponse {
  code: number
  status: string
  data: {
    hijri: {
      day: string
      month: HijriMonthNames
      year: string
    }
  }
}

const hijriCache = new Map<string, HijriCacheEntry>()

const intlLocaleMap: Record<HijriLocale, string> = {
  en: 'en-u-ca-islamic-civil',
  ar: 'ar-u-ca-islamic-civil',
}

function formatGregorianKey(date: Date): string {
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

async function fetchHijriFromApi(gregorianKey: string): Promise<HijriCacheEntry> {
  const cached = hijriCache.get(gregorianKey)
  if (cached) return cached

  const response = await $fetch<AladhanGToHResponse>(
    `https://api.aladhan.com/v1/gToH?date=${gregorianKey}`,
  )

  const hijri = response.data.hijri
  const entry: HijriCacheEntry = {
    day: hijri.day,
    month: hijri.month,
    year: hijri.year,
  }

  hijriCache.set(gregorianKey, entry)
  return entry
}

export function useHijriDate(options: UseHijriDateOptions) {
  const hijriData = ref<HijriCacheEntry | null>(null)
  const loading = ref(false)
  const error = ref(false)

  async function loadHijri(date: Date) {
    const gregorianKey = formatGregorianKey(date)
    const cached = hijriCache.get(gregorianKey)

    if (cached) {
      hijriData.value = cached
      error.value = false
      return
    }

    loading.value = true
    error.value = false

    try {
      hijriData.value = await fetchHijriFromApi(gregorianKey)
    }
    catch {
      error.value = true
      hijriData.value = intlFallback(date, options.locale.value)
    }
    finally {
      loading.value = false
    }
  }

  watch(
    () => formatGregorianKey(options.now.value),
    () => {
      loadHijri(options.now.value)
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
