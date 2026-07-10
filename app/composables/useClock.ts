import { computed } from 'vue'
import type { Ref } from 'vue'
import type { ClockFormat } from '../../types/clock'

interface UseClockOptions {
  now: Ref<Date>
  format: Ref<ClockFormat>
  showSeconds: Ref<boolean>
}

export function useClock(options: UseClockOptions) {
  const hours = computed(() => {
    const h = options.now.value.getHours()
    if (options.format.value === '12h') {
      const h12 = h % 12
      return String(h12 === 0 ? 12 : h12).padStart(2, '0')
    }
    return String(h).padStart(2, '0')
  })

  const minutes = computed(() => {
    return String(options.now.value.getMinutes()).padStart(2, '0')
  })

  const seconds = computed(() => {
    return String(options.now.value.getSeconds()).padStart(2, '0')
  })

  const period = computed(() => {
    if (options.format.value !== '12h') return ''
    return options.now.value.getHours() >= 12 ? 'PM' : 'AM'
  })

  const colonVisible = computed(() => {
    return options.now.value.getSeconds() % 2 === 0
  })

  return {
    hours,
    minutes,
    seconds,
    period,
    colonVisible,
  }
}
