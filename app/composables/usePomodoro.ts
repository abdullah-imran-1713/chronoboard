type PomodoroPhase = 'work' | 'break' | 'idle'

export function usePomodoro(workMinutes = 25, breakMinutes = 5) {
  const phase = ref<PomodoroPhase>('idle')
  const secondsLeft = ref(workMinutes * 60)
  const totalSeconds = ref(workMinutes * 60)
  const running = ref(false)
  let timer: ReturnType<typeof setInterval> | null = null

  const display = computed(() => {
    const m = Math.floor(secondsLeft.value / 60)
    const s = secondsLeft.value % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  })

  const progress = computed(() => {
    if (totalSeconds.value === 0) return 0
    return Math.round(((totalSeconds.value - secondsLeft.value) / totalSeconds.value) * 100)
  })

  const phaseLabel = computed(() => {
    if (phase.value === 'work') return 'Work'
    if (phase.value === 'break') return 'Break'
    return 'Ready'
  })

  function clearTimer() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    running.value = false
  }

  function start() {
    if (phase.value === 'idle') {
      phase.value = 'work'
      secondsLeft.value = workMinutes * 60
      totalSeconds.value = workMinutes * 60
    }

    clearTimer()
    running.value = true
    timer = setInterval(() => {
      if (secondsLeft.value > 0) {
        secondsLeft.value--
      } else if (phase.value === 'work') {
        phase.value = 'break'
        secondsLeft.value = breakMinutes * 60
        totalSeconds.value = breakMinutes * 60
      } else {
        phase.value = 'work'
        secondsLeft.value = workMinutes * 60
        totalSeconds.value = workMinutes * 60
      }
    }, 1000)
  }

  function pause() {
    clearTimer()
  }

  function reset() {
    clearTimer()
    phase.value = 'idle'
    secondsLeft.value = workMinutes * 60
    totalSeconds.value = workMinutes * 60
  }

  onUnmounted(clearTimer)

  return {
    phase,
    phaseLabel,
    secondsLeft,
    display,
    progress,
    running,
    start,
    pause,
    reset,
  }
}
