import { ref, onMounted, onUnmounted, type InjectionKey, type Ref } from 'vue'

export const NOW_INJECTION_KEY: InjectionKey<Ref<Date>> = Symbol('now')

export function useNow() {
  const now = ref(new Date())
  let rafId: number | null = null
  let lastSecond = -1

  function tick() {
    const current = new Date()
    if (current.getSeconds() !== lastSecond) {
      now.value = current
      lastSecond = current.getSeconds()
    }
    rafId = requestAnimationFrame(tick)
  }

  onMounted(() => {
    now.value = new Date()
    lastSecond = now.value.getSeconds()
    rafId = requestAnimationFrame(tick)
  })

  onUnmounted(() => {
    if (rafId !== null) cancelAnimationFrame(rafId)
  })

  return { now }
}
