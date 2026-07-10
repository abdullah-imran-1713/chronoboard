import { NOW_INJECTION_KEY } from './useNow'

export interface CalendarDay {
  date: number
  isCurrentMonth: boolean
  isToday: boolean
}

export function useCalendar() {
  const now = inject(NOW_INJECTION_KEY)!
  const viewYear = ref(now.value.getFullYear())
  const viewMonth = ref(now.value.getMonth())

  const monthLabel = computed(() => {
    return new Date(viewYear.value, viewMonth.value, 1).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })
  })

  const weeks = computed((): CalendarDay[][] => {
    const firstDay = new Date(viewYear.value, viewMonth.value, 1)
    const lastDay = new Date(viewYear.value, viewMonth.value + 1, 0)
    const startOffset = firstDay.getDay()
    const daysInMonth = lastDay.getDate()

    const cells: CalendarDay[] = []

    const prevMonthLastDay = new Date(viewYear.value, viewMonth.value, 0).getDate()
    for (let i = startOffset - 1; i >= 0; i--) {
      cells.push({
        date: prevMonthLastDay - i,
        isCurrentMonth: false,
        isToday: false,
      })
    }

    const today = now.value
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday
        = day === today.getDate()
          && viewMonth.value === today.getMonth()
          && viewYear.value === today.getFullYear()

      cells.push({
        date: day,
        isCurrentMonth: true,
        isToday,
      })
    }

    let nextMonthDay = 1
    while (cells.length % 7 !== 0) {
      cells.push({
        date: nextMonthDay++,
        isCurrentMonth: false,
        isToday: false,
      })
    }

    const result: CalendarDay[][] = []
    for (let i = 0; i < cells.length; i += 7) {
      result.push(cells.slice(i, i + 7))
    }
    return result
  })

  function prevMonth() {
    if (viewMonth.value === 0) {
      viewMonth.value = 11
      viewYear.value--
    } else {
      viewMonth.value--
    }
  }

  function nextMonth() {
    if (viewMonth.value === 11) {
      viewMonth.value = 0
      viewYear.value++
    } else {
      viewMonth.value++
    }
  }

  const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return {
    monthLabel,
    weeks,
    weekdayLabels,
    prevMonth,
    nextMonth,
  }
}
