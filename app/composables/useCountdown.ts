export interface CountdownRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  finished: boolean
}

export function useCountdown() {
  const now = inject(NOW_INJECTION_KEY)!
  const targetDate = ref<Date | null>(null)

  const remaining = computed((): CountdownRemaining | null => {
    if (!targetDate.value) return null

    const diff = targetDate.value.getTime() - now.value.getTime()
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, finished: true }
    }

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
      finished: false,
    }
  })

  function setTarget(date: Date) {
    targetDate.value = date
  }

  function clear() {
    targetDate.value = null
  }

  return {
    remaining,
    targetDate,
    setTarget,
    clear,
  }
}
