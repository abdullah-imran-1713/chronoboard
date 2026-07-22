import type { Ref } from 'vue'
import type { HijriLocale } from '../../types/date'
import { NOW_INJECTION_KEY } from './useNow'
import type { CalendarDay } from './useCalendar'
import {
  fetchHijriFromApi,
  formatGregorianKey,
  type HijriMonthNames,
} from './useHijriDate'
import { effectiveGregorianForHijri, useMaghribForHijri } from './useMaghribForHijri'

interface AladhanHToGDay {
  hijri: {
    day: string
    month: HijriMonthNames & { number: number }
    year: string
  }
  gregorian: {
    date: string
    weekday?: { en?: string }
  }
}

interface AladhanHToGCalendarResponse {
  code: number
  data: AladhanHToGDay[]
}

const monthCache = new Map<string, AladhanHToGDay[]>()

const weekdayIndex: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
}

async function fetchHijriMonth(month: number, year: number): Promise<AladhanHToGDay[]> {
  const key = `${month}-${year}`
  const cached = monthCache.get(key)
  if (cached) return cached

  const response = await $fetch<AladhanHToGCalendarResponse>(
    `https://api.aladhan.com/v1/hToGCalendar/${month}/${year}`,
  )
  const days = response.data ?? []
  monthCache.set(key, days)
  return days
}

function buildWeeks(
  days: AladhanHToGDay[],
  todayDay: number,
  todayMonth: number,
  todayYear: number,
): CalendarDay[][] {
  if (days.length === 0) return []

  const first = days[0]!
  const weekdayName = first.gregorian.weekday?.en ?? 'Sunday'
  const startOffset = weekdayIndex[weekdayName] ?? 0

  const cells: CalendarDay[] = []

  for (let i = 0; i < startOffset; i++) {
    cells.push({
      date: 0,
      isCurrentMonth: false,
      isToday: false,
    })
  }

  for (const entry of days) {
    const dayNum = Number(entry.hijri.day)
    const monthNum = entry.hijri.month.number
    const yearNum = Number(entry.hijri.year)
    cells.push({
      date: dayNum,
      isCurrentMonth: true,
      isToday:
        dayNum === todayDay
        && monthNum === todayMonth
        && yearNum === todayYear,
    })
  }

  while (cells.length % 7 !== 0) {
    cells.push({
      date: 0,
      isCurrentMonth: false,
      isToday: false,
    })
  }

  const result: CalendarDay[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    result.push(cells.slice(i, i + 7))
  }
  return result
}

export function useHijriCalendar(locale: Ref<HijriLocale>) {
  const now = inject(NOW_INJECTION_KEY)!
  const settings = useSettingsStore()
  const { ensureMaghribMinutes } = useMaghribForHijri()

  const viewYear = ref(1448)
  const viewMonth = ref(1)
  const monthDays = ref<AladhanHToGDay[]>([])
  const todayDay = ref(0)
  const todayMonth = ref(0)
  const todayYear = ref(0)
  const loading = ref(false)
  const error = ref(false)

  const monthLabel = computed(() => {
    const first = monthDays.value[0]
    const suffix = locale.value === 'ar' ? 'هـ' : 'AH'
    if (!first) return `${viewMonth.value}/${viewYear.value} ${suffix}`
    const name = locale.value === 'ar' ? first.hijri.month.ar : first.hijri.month.en
    return `${name} ${first.hijri.year} ${suffix}`
  })

  const weeks = computed((): CalendarDay[][] =>
    buildWeeks(monthDays.value, todayDay.value, todayMonth.value, todayYear.value),
  )

  async function loadTodayAnchor() {
    let maghrib: number | null = null
    if (settings.hijriChangeAtMaghrib) {
      maghrib = await ensureMaghribMinutes(now.value)
    }
    const civil = effectiveGregorianForHijri(
      now.value,
      maghrib,
      settings.hijriChangeAtMaghrib,
    )
    const entry = await fetchHijriFromApi(formatGregorianKey(civil))
    todayDay.value = Number(entry.day)
    todayYear.value = Number(entry.year)
    todayMonth.value = entry.monthNumber ?? viewMonth.value
    viewYear.value = todayYear.value
    viewMonth.value = todayMonth.value
  }

  async function loadMonth() {
    loading.value = true
    error.value = false
    try {
      monthDays.value = await fetchHijriMonth(viewMonth.value, viewYear.value)
    }
    catch {
      error.value = true
      monthDays.value = []
    }
    finally {
      loading.value = false
    }
  }

  async function goToToday() {
    loading.value = true
    error.value = false
    try {
      await loadTodayAnchor()
      monthDays.value = await fetchHijriMonth(viewMonth.value, viewYear.value)
    }
    catch {
      error.value = true
      monthDays.value = []
    }
    finally {
      loading.value = false
    }
  }

  async function prevMonth() {
    if (viewMonth.value === 1) {
      viewMonth.value = 12
      viewYear.value--
    }
    else {
      viewMonth.value--
    }
    await loadMonth()
  }

  async function nextMonth() {
    if (viewMonth.value === 12) {
      viewMonth.value = 1
      viewYear.value++
    }
    else {
      viewMonth.value++
    }
    await loadMonth()
  }

  const weekdayLabels = computed(() => {
    if (locale.value === 'ar') {
      return ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س']
    }
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  })

  return {
    monthLabel,
    weeks,
    weekdayLabels,
    loading,
    error,
    prevMonth,
    nextMonth,
    goToToday,
  }
}
