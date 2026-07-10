export function useCursorAutoHide(hideDelay = 3000) {
  const isIdle = ref(false)
  let timer: ReturnType<typeof setTimeout> | null = null

  function resetTimer() {
    isIdle.value = false
    document.body.style.cursor = 'default'
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      isIdle.value = true
      document.body.style.cursor = 'none'
    }, hideDelay)
  }

  onMounted(() => {
    window.addEventListener('mousemove', resetTimer)
    window.addEventListener('mousedown', resetTimer)
    window.addEventListener('keydown', resetTimer)
    resetTimer()
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', resetTimer)
    window.removeEventListener('mousedown', resetTimer)
    window.removeEventListener('keydown', resetTimer)
    if (timer) clearTimeout(timer)
    document.body.style.cursor = 'default'
  })

  return { isIdle }
}
