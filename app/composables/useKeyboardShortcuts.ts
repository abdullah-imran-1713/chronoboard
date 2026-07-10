interface ShortcutMap {
  [key: string]: () => void
}

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  function handler(event: KeyboardEvent) {
    if (event.ctrlKey || event.metaKey || event.altKey) return

    const target = event.target
    if (
      target instanceof HTMLInputElement
      || target instanceof HTMLTextAreaElement
      || target instanceof HTMLSelectElement
      || (target instanceof HTMLElement && target.isContentEditable)
    ) return

    const key = event.key.toLowerCase()
    if (shortcuts[key]) {
      event.preventDefault()
      shortcuts[key]()
    }
  }

  onMounted(() => window.addEventListener('keydown', handler))
  onUnmounted(() => window.removeEventListener('keydown', handler))
}
