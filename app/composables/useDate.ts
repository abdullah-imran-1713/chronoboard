import { computed } from 'vue'
import type { Ref } from 'vue'
import type { DateFormat } from '../../types/date'

interface UseDateOptions {
  now: Ref<Date>
  format: Ref<DateFormat>
  locale: Ref<string>
}

export function useDate(options: UseDateOptions) {
  const formatted = computed(() => {
    const formatMap: Record<DateFormat, Intl.DateTimeFormatOptions> = {
      short: { day: 'numeric', month: 'numeric', year: 'numeric' },
      medium: { day: 'numeric', month: 'short', year: 'numeric' },
      long: { day: 'numeric', month: 'long', year: 'numeric' },
      full: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
    }

    return new Intl.DateTimeFormat(
      options.locale.value,
      formatMap[options.format.value],
    ).format(options.now.value)
  })

  const dayOfWeek = computed(() => {
    return new Intl.DateTimeFormat(options.locale.value, {
      weekday: 'long',
    }).format(options.now.value)
  })

  return {
    formatted,
    dayOfWeek,
  }
}
