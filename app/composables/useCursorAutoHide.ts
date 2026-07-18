/**
 * Hide the board FAB rail (and cursor) after idle.
 *
 * Widget presses/hovers are local to widget chrome — they must not reveal
 * the board FAB rail. Only board (or FAB rail / keyboard) activity wakes it.
 */
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

  /** Activity on a widget card is local UX — don't wake board FABs. */
  function isWidgetTarget(target: EventTarget | null) {
    if (!(target instanceof Element)) return false
    if (target.closest('[data-board-fab-rail]')) return false
    return Boolean(target.closest('[data-widget-id]'))
  }

  function onBoardActivity(event: Event) {
    if (isWidgetTarget(event.target)) return
    resetTimer()
  }

  onMounted(() => {
    window.addEventListener('mousemove', onBoardActivity)
    window.addEventListener('mousedown', onBoardActivity)
    window.addEventListener('pointerdown', onBoardActivity)
    window.addEventListener('touchstart', onBoardActivity, { passive: true })
    window.addEventListener('keydown', resetTimer)
    resetTimer()
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', onBoardActivity)
    window.removeEventListener('mousedown', onBoardActivity)
    window.removeEventListener('pointerdown', onBoardActivity)
    window.removeEventListener('touchstart', onBoardActivity)
    window.removeEventListener('keydown', resetTimer)
    if (timer) clearTimeout(timer)
    document.body.style.cursor = 'default'
  })

  return { isIdle }
}
