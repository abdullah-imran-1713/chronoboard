import {
  MAX_BREAK_MINUTES,
  MAX_FOCUS_MINUTES,
  MIN_BREAK_MINUTES,
  MIN_FOCUS_MINUTES,
  type FocusSessionPreset,
} from '../../types/focus'

export type FocusPhase = 'focus' | 'break' | 'idle'

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(n)))
}

export function usePomodoro() {
  const settings = useSettingsStore()
  const { showFocusComplete, showBreakComplete } = useFocusAlert()

  const phase = ref<FocusPhase>('idle')
  const running = ref(false)
  let timer: ReturnType<typeof setInterval> | null = null

  const focusMinutes = computed({
    get: () => settings.focusMinutes,
    set: (value: number) => settings.setFocusMinutes(value),
  })

  const breakMinutes = computed({
    get: () => settings.focusBreakMinutes,
    set: (value: number) => settings.setFocusBreakMinutes(value),
  })

  const breakEnabled = computed({
    get: () => settings.focusBreakEnabled,
    set: (value: boolean) => settings.setFocusBreakEnabled(value),
  })

  const taskLabel = computed({
    get: () => settings.focusTaskLabel,
    set: (value: string) => settings.setFocusTaskLabel(value),
  })

  const sessions = computed(() => settings.focusSessions)
  const canSaveSession = computed(() => settings.canSaveFocusSession)

  const secondsLeft = ref(settings.focusMinutes * 60)
  const totalSeconds = ref(settings.focusMinutes * 60)

  /** Setup form visible (not in an active/paused session) */
  const isSetup = computed(() => phase.value === 'idle')
  /** Active or paused focus/break — compact run UI */
  const isSession = computed(() => phase.value !== 'idle')

  const display = computed(() => {
    const m = Math.floor(secondsLeft.value / 60)
    const s = secondsLeft.value % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  })

  const setupPreview = computed(() => {
    const m = focusMinutes.value
    return `${String(m).padStart(2, '0')}:00`
  })

  const progress = computed(() => {
    if (totalSeconds.value === 0) return 0
    return Math.round(((totalSeconds.value - secondsLeft.value) / totalSeconds.value) * 100)
  })

  const phaseLabel = computed(() => {
    if (phase.value === 'focus') return 'Focusing'
    if (phase.value === 'break') return 'Break'
    return 'Ready'
  })

  const progressLabel = computed(() => {
    if (phase.value === 'break') return 'Break'
    const label = taskLabel.value.trim()
    return label || 'Focus'
  })

  const canStart = computed(() => taskLabel.value.trim().length > 0 && focusMinutes.value >= MIN_FOCUS_MINUTES)

  function clearTimer() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    running.value = false
  }

  function syncIdleClock() {
    secondsLeft.value = focusMinutes.value * 60
    totalSeconds.value = focusMinutes.value * 60
  }

  function applyFocusDuration(minutes: number) {
    const next = clamp(minutes, MIN_FOCUS_MINUTES, MAX_FOCUS_MINUTES)
    focusMinutes.value = next
    if (phase.value === 'idle') syncIdleClock()
  }

  function applyBreakDuration(minutes: number) {
    breakMinutes.value = clamp(minutes, MIN_BREAK_MINUTES, MAX_BREAK_MINUTES)
  }

  function finishToSetup() {
    clearTimer()
    phase.value = 'idle'
    syncIdleClock()
  }

  function tick() {
    if (secondsLeft.value > 1) {
      secondsLeft.value--
      return
    }

    secondsLeft.value = 0

    if (phase.value === 'focus') {
      showFocusComplete(taskLabel.value, breakEnabled.value)
      if (breakEnabled.value) {
        phase.value = 'break'
        secondsLeft.value = breakMinutes.value * 60
        totalSeconds.value = breakMinutes.value * 60
        return
      }
      finishToSetup()
      return
    }

    if (phase.value === 'break') {
      showBreakComplete()
      finishToSetup()
    }
  }

  function start() {
    if (!canStart.value) return

    if (phase.value === 'idle') {
      phase.value = 'focus'
      secondsLeft.value = focusMinutes.value * 60
      totalSeconds.value = focusMinutes.value * 60
    }

    clearTimer()
    running.value = true
    timer = setInterval(tick, 1000)
  }

  function pause() {
    clearTimer()
  }

  function reset() {
    finishToSetup()
  }

  function loadSession(session: FocusSessionPreset) {
    if (!isSetup.value) return
    settings.applyFocusSession(session)
    syncIdleClock()
  }

  function saveCurrentSession() {
    return settings.saveFocusSessionFromCurrent()
  }

  function removeSession(id: string) {
    settings.removeFocusSession(id)
  }

  watch(
    () => settings.focusMinutes,
    () => {
      if (phase.value === 'idle') syncIdleClock()
    },
  )

  onUnmounted(clearTimer)

  return {
    phase,
    phaseLabel,
    progressLabel,
    secondsLeft,
    display,
    setupPreview,
    progress,
    running,
    isSetup,
    isSession,
    canStart,
    focusMinutes,
    breakMinutes,
    breakEnabled,
    taskLabel,
    sessions,
    canSaveSession,
    applyFocusDuration,
    applyBreakDuration,
    loadSession,
    saveCurrentSession,
    removeSession,
    start,
    pause,
    reset,
    MIN_FOCUS_MINUTES,
    MAX_FOCUS_MINUTES,
    MIN_BREAK_MINUTES,
    MAX_BREAK_MINUTES,
  }
}
