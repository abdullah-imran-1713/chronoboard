export function useStopwatch() {
  const elapsed = ref(0)
  const running = ref(false)
  let timer: ReturnType<typeof setInterval> | null = null

  const display = computed(() => {
    const totalSec = Math.floor(elapsed.value / 1000)
    const hours = Math.floor(totalSec / 3600)
    const minutes = Math.floor((totalSec % 3600) / 60)
    const seconds = totalSec % 60
    const ms = Math.floor((elapsed.value % 1000) / 10)

    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(ms).padStart(2, '0')}`
  })

  function start() {
    if (running.value) return
    running.value = true
    const startTime = Date.now() - elapsed.value
    timer = setInterval(() => {
      elapsed.value = Date.now() - startTime
    }, 50)
  }

  function pause() {
    running.value = false
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  function reset() {
    pause()
    elapsed.value = 0
  }

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  return {
    elapsed,
    running,
    display,
    start,
    pause,
    reset,
  }
}
