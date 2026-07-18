/**
 * Close a slide-over panel when the user taps/clicks outside it.
 * Uses capture-phase pointerdown so touch on tablet/mobile is reliable
 * (backdrop-only @click often fails on iOS/Android).
 *
 * Board FAB rail stays interactive while a panel is open (theme, fullscreen,
 * switching settings ↔ widgets) — those clicks must not dismiss the panel.
 */
export function usePanelDismiss(
  isOpen: () => boolean,
  panelRef: Ref<HTMLElement | null>,
  onClose: () => void,
) {
  function onDocumentPointerDown(event: PointerEvent) {
    if (!isOpen()) return

    const target = event.target
    if (!(target instanceof Element)) return

    // Keep bottom FABs usable without closing the panel
    if (target.closest('[data-board-fab-rail]')) return
    // Support visibility tip is teleported to body
    if (target.closest('[data-support-tip]')) return
    // Islamic features prompt is teleported to body — keep settings/widgets open
    if (target.closest('[data-islamic-features-modal]')) return
    // Confirm dialogs teleported to body
    if (target.closest('[data-confirm-dialog]')) return

    const panel = panelRef.value
    if (panel?.contains(target)) return

    onClose()
  }

  function bind() {
    if (!import.meta.client) return
    document.addEventListener('pointerdown', onDocumentPointerDown, true)
  }

  function unbind() {
    if (!import.meta.client) return
    document.removeEventListener('pointerdown', onDocumentPointerDown, true)
  }

  watch(isOpen, (open) => {
    unbind()
    if (open) bind()
  }, { immediate: true })

  onUnmounted(unbind)
}
