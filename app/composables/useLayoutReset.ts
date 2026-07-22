/**
 * Confirm + toast flow for restoring default widget positions
 * (Widgets panel + board `R` shortcut, like `F` for fullscreen).
 */

let toastTimer: ReturnType<typeof setTimeout> | null = null

export function useLayoutReset() {
  const widgetStore = useWidgetStore()
  const layoutStore = useLayoutStore()

  const open = useState('layout-reset-open', () => false)
  const toastMessage = useState('layout-reset-toast', () => '')

  const canResetLayout = computed(() =>
    widgetStore.activeWidgets.some(w => layoutStore.wasMoved(w.id)),
  )

  function showToast(message: string) {
    toastMessage.value = message
    if (toastTimer) clearTimeout(toastTimer)
    toastTimer = setTimeout(() => {
      toastMessage.value = ''
      toastTimer = null
    }, 2200)
  }

  /** Panel: only when reset is available (button stays disabled otherwise). */
  function requestReset() {
    if (!canResetLayout.value) return
    open.value = true
  }

  /** Board shortcut `R` — toast when already default, otherwise open confirm. */
  function requestResetFromShortcut() {
    if (widgetStore.activeWidgets.length === 0) {
      showToast('Enable a widget first')
      return
    }
    if (!canResetLayout.value) {
      showToast('Layout is already default')
      return
    }
    open.value = true
  }

  function dismiss() {
    open.value = false
  }

  function confirm() {
    if (!canResetLayout.value) {
      open.value = false
      showToast('Layout is already default')
      return
    }

    open.value = false
    layoutStore.resetWidgetPositions()
    window.dispatchEvent(new CustomEvent('chronoboard:repack-widgets', {
      detail: { forceAll: true },
    }))
    showToast('Layout reset')
  }

  return {
    open,
    toastMessage,
    canResetLayout,
    requestReset,
    requestResetFromShortcut,
    dismiss,
    confirm,
  }
}
