export type BoardCalendarMode = 'gregorian' | 'hijri'

const mode = ref<BoardCalendarMode | null>(null)

export function useBoardCalendar() {
  const isOpen = computed(() => mode.value !== null)

  function open(next: BoardCalendarMode) {
    mode.value = next
  }

  function close() {
    mode.value = null
  }

  function toggle(next: BoardCalendarMode) {
    mode.value = mode.value === next ? null : next
  }

  return {
    mode,
    isOpen,
    open,
    close,
    toggle,
  }
}
