/**
 * True when the device has no hover (phones/tablets) or a coarse pointer.
 * Used to swap hover-only UX for tap-friendly alternatives.
 */
export function useCoarsePointer() {
  const isCoarse = ref(
    import.meta.client
      && window.matchMedia('(hover: none), (pointer: coarse)').matches,
  )

  function sync() {
    if (!import.meta.client) return
    isCoarse.value = window.matchMedia('(hover: none), (pointer: coarse)').matches
  }

  onMounted(() => {
    sync()
    const mq = window.matchMedia('(hover: none), (pointer: coarse)')
    const onChange = () => sync()
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', onChange)
      onUnmounted(() => mq.removeEventListener('change', onChange))
    }
    else {
      mq.addListener(onChange)
      onUnmounted(() => mq.removeListener(onChange))
    }
  })

  return { isCoarse }
}
