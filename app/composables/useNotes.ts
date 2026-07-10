const NOTES_KEY = 'chronoboard_notes'
const DEBOUNCE_MS = 300

export function useNotes() {
  const content = ref('')
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  function save() {
    if (!import.meta.client) return
    localStorage.setItem(NOTES_KEY, content.value)
  }

  watch(content, () => {
    if (!import.meta.client) return
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(save, DEBOUNCE_MS)
  })

  onMounted(() => {
    if (!import.meta.client) return
    content.value = localStorage.getItem(NOTES_KEY) ?? ''
  })

  onUnmounted(() => {
    if (debounceTimer) clearTimeout(debounceTimer)
    save()
  })

  return { content }
}
