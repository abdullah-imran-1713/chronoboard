export interface CountdownRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  finished: boolean
}

/** Drop leading zero units: `15m 08s`, not `0d 0h 15m 08s` */
export function formatCountdownRemaining(remaining: CountdownRemaining): string {
  const { days, hours, minutes, seconds } = remaining
  const sec = String(seconds).padStart(2, '0')

  if (days > 0) {
    return `${days}d ${hours}h ${String(minutes).padStart(2, '0')}m ${sec}s`
  }
  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, '0')}m ${sec}s`
  }
  if (minutes > 0) {
    return `${minutes}m ${sec}s`
  }
  return `${seconds}s`
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

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    let seconds = Math.floor((diff % (1000 * 60)) / 1000)

    // Avoid a dangling "0s" for the final sub-second tick
    if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
      seconds = 1
    }

    return {
      days,
      hours,
      minutes,
      seconds,
      finished: false,
    }
  })

  const remainingLabel = computed((): string | null => {
    if (!remaining.value || remaining.value.finished) return null
    return formatCountdownRemaining(remaining.value)
  })

  function setTarget(date: Date) {
    targetDate.value = date
  }

  function clear() {
    targetDate.value = null
  }

  return {
    remaining,
    remainingLabel,
    targetDate,
    setTarget,
    clear,
  }
}
