export function useConnectionStatus() {
  const isOnline = ref(true)

  function setOnline() {
    isOnline.value = true
  }

  function setOffline() {
    isOnline.value = false
  }

  onMounted(() => {
    if (!import.meta.client) return
    isOnline.value = navigator.onLine
    window.addEventListener('online', setOnline)
    window.addEventListener('offline', setOffline)
  })

  onUnmounted(() => {
    if (!import.meta.client) return
    window.removeEventListener('online', setOnline)
    window.removeEventListener('offline', setOffline)
  })

  return { isOnline }
}
