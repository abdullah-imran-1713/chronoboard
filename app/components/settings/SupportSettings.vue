<template>
  <div class="support-settings font-ui">
    <h3 class="settings-section-title font-ui">
      Support
    </h3>

    <div class="support-settings-row">
      <p class="support-settings-copy m-0">
        If ChronoBoard helps your day, you can support its development.
        <a
          v-if="supportUrl"
          class="support-settings-link"
          :href="supportUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          Buy me a coffee
        </a>
      </p>

      <div class="support-settings-ctrl">
        <button
          ref="triggerRef"
          type="button"
          class="support-settings-info cb-icobtn"
          :aria-expanded="open"
          aria-haspopup="dialog"
          aria-label="Board support line options"
          @click.stop="toggleOpen"
          @mouseenter="onEnter"
          @mouseleave="onLeave"
          @focus="onEnter"
          @blur="onBlur"
        >
          <Icon name="mdi:information-outline" size="16" />
        </button>

        <Teleport to="body">
          <Transition name="support-tip">
            <div
              v-if="open"
              ref="panelRef"
              class="support-tip font-ui"
              data-support-tip
              role="dialog"
              aria-label="Board support line"
              :style="panelStyle"
              @mouseenter="onEnter"
              @mouseleave="onLeave"
              @pointerdown.stop
            >
              <p class="support-tip-text m-0">
                Control the small support link on the board.
              </p>
              <div class="support-tip-toggle" role="group" aria-label="Board support visibility">
                <button
                  type="button"
                  class="support-tip-opt"
                  :data-active="showOnBoard ? 'true' : 'false'"
                  :aria-pressed="showOnBoard"
                  @pointerdown.prevent.stop="setVisible(true)"
                >
                  Show
                </button>
                <button
                  type="button"
                  class="support-tip-opt"
                  :data-active="!showOnBoard ? 'true' : 'false'"
                  :aria-pressed="!showOnBoard"
                  @pointerdown.prevent.stop="setVisible(false)"
                >
                  Hide
                </button>
              </div>
            </div>
          </Transition>
        </Teleport>
      </div>
    </div>

    <p
      v-if="supportEmail"
      class="support-settings-contact m-0"
    >
      Feedback or issues?
      <a
        class="support-settings-link"
        :href="mailtoHref"
      >
        {{ supportEmail }}
      </a>
    </p>
  </div>
</template>

<script setup lang="ts">
const layoutStore = useLayoutStore()
const { showSupportOnBoard: showOnBoard } = storeToRefs(layoutStore)
const config = useRuntimeConfig()
const { isCoarse } = useCoarsePointer()

const supportUrl = computed(() => String(config.public.supportUrl || '').trim())
const supportEmail = computed(() => String(config.public.supportEmail || '').trim())
const mailtoHref = computed(() => {
  if (!supportEmail.value) return '#'
  const subject = encodeURIComponent('ChronoBoard feedback')
  return `mailto:${supportEmail.value}?subject=${subject}`
})

const open = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const coords = ref({ top: 0, left: 0, placeBelow: false })
let hideTimer: ReturnType<typeof setTimeout> | null = null

const panelStyle = computed(() => ({
  top: `${coords.value.top}px`,
  left: `${coords.value.left}px`,
  transform: coords.value.placeBelow ? 'none' : 'translateY(-100%)',
  backgroundColor: 'var(--color-surface)',
  color: 'var(--color-text)',
  border: '1px solid rgba(var(--color-muted-rgb), 0.28)',
  boxShadow: '0 8px 24px rgba(0,0,0,.32)',
}))

function clearHide() {
  if (!hideTimer) return
  clearTimeout(hideTimer)
  hideTimer = null
}

function placePanel() {
  const el = triggerRef.value
  if (!el || !import.meta.client) return
  const anchor = el.getBoundingClientRect()
  const pad = 12
  const gap = 8
  const width = 200
  const height = panelRef.value?.offsetHeight || 84
  const vw = window.innerWidth
  const vh = window.innerHeight

  let placeBelow = anchor.top < pad + height + gap
  let top = placeBelow ? anchor.bottom + gap : anchor.top - gap
  let left = anchor.right - width
  left = Math.min(Math.max(left, pad), vw - pad - width)

  if (!placeBelow && top - height < pad) {
    placeBelow = true
    top = anchor.bottom + gap
  }
  if (placeBelow && top + height > vh - pad) {
    placeBelow = false
    top = anchor.top - gap
  }

  coords.value = { top, left, placeBelow }
}

async function showPanel() {
  clearHide()
  placePanel()
  open.value = true
  await nextTick()
  placePanel()
}

function hidePanel() {
  clearHide()
  open.value = false
}

function scheduleHide() {
  clearHide()
  hideTimer = setTimeout(() => {
    open.value = false
    hideTimer = null
  }, isCoarse.value ? 2800 : 160)
}

function onEnter() {
  if (isCoarse.value) return
  void showPanel()
}

function onLeave() {
  if (isCoarse.value) return
  scheduleHide()
}

function onBlur(event: FocusEvent) {
  if (isCoarse.value) return
  const next = event.relatedTarget
  if (next instanceof Node && (triggerRef.value?.contains(next) || panelRef.value?.contains(next))) {
    return
  }
  scheduleHide()
}

function toggleOpen() {
  if (!isCoarse.value) return
  if (open.value) hidePanel()
  else void showPanel()
}

function setVisible(show: boolean) {
  clearHide()
  layoutStore.setShowSupportOnBoard(show)
  window.dispatchEvent(new CustomEvent('chronoboard:support-visibility'))
  if (isCoarse.value) {
    hideTimer = setTimeout(() => {
      open.value = false
      hideTimer = null
    }, 900)
  }
}

function onDocPointer(event: PointerEvent) {
  if (!open.value) return
  const target = event.target
  if (!(target instanceof Node)) return
  if (triggerRef.value?.contains(target) || panelRef.value?.contains(target)) return
  hidePanel()
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocPointer, true)
})

onUnmounted(() => {
  clearHide()
  document.removeEventListener('pointerdown', onDocPointer, true)
})
</script>

<style scoped>
.support-settings {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.support-settings-row {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.support-settings-copy,
.support-settings-contact {
  flex: 1;
  min-width: 0;
  font-size: 0.8125rem;
  line-height: 1.45;
  color: var(--color-muted);
}

.support-settings-link {
  color: var(--color-text);
  text-decoration: none;
  border-bottom: 1px solid rgba(var(--color-muted-rgb), 0.4);
  margin-left: 0.15rem;
  overflow-wrap: anywhere;
}

.support-settings-link:hover,
.support-settings-link:focus-visible {
  border-bottom-color: rgba(var(--color-primary-rgb), 0.55);
  outline: none;
}

.support-settings-ctrl {
  flex: none;
  padding-top: 0.05rem;
}

.support-settings-info {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-muted);
  background: rgba(var(--color-muted-rgb), 0.12);
  cursor: pointer;
}

.support-settings-info:hover,
.support-settings-info:focus-visible {
  color: var(--color-text);
  background: rgba(var(--color-muted-rgb), 0.2);
  outline: none;
}
</style>

<style>
.support-tip {
  position: fixed;
  z-index: 95;
  width: 200px;
  padding: 10px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.support-tip-text {
  font-size: 11px;
  font-weight: 500;
  line-height: 1.35;
  color: var(--color-muted);
}

.support-tip-toggle {
  display: flex;
  gap: 2px;
  padding: 2px;
  border-radius: 999px;
  background: rgba(var(--color-muted-rgb), 0.14);
  border: 1px solid rgba(var(--color-muted-rgb), 0.2);
}

.support-tip-opt {
  flex: 1;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  padding: 7px 0;
  border-radius: 999px;
  color: var(--color-muted);
  background: transparent;
}

.support-tip-opt[data-active='true'] {
  color: var(--color-text);
  background: rgba(var(--color-primary-rgb), 0.22);
  box-shadow: 0 0 0 1px rgba(var(--color-primary-rgb), 0.35);
}

.support-tip-enter-active,
.support-tip-leave-active {
  transition: opacity 0.15s ease;
}

.support-tip-enter-from,
.support-tip-leave-to {
  opacity: 0;
}
</style>
