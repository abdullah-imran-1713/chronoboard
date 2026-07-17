<template>
  <span
    ref="rootRef"
    class="cb-hint"
    :class="{ 'cb-hint--open': open, 'cb-hint--blocked': intercept }"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
    @click="onClick"
  >
    <span
      class="cb-hint-target"
      :class="{ 'cb-hint-target--passthrough': intercept }"
    >
      <slot />
    </span>

    <Teleport to="body">
      <Transition name="cb-hint-pop">
        <span
          v-if="open && text"
          :id="hintId"
          ref="bubbleRef"
          class="cb-hint-bubble font-ui"
          role="tooltip"
          :style="bubbleStyle"
        >
          {{ text }}
        </span>
      </Transition>
    </Teleport>
  </span>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  /** Hint copy shown on hover (desktop) or tap (touch). */
  text: string
  /**
   * `auto` — touch shows hint only when blocked (disabled control).
   * `info` — touch shows hint on every tap (info icons).
   */
  mode?: 'auto' | 'info'
  /** When true, the control is inactive; touch tap shows the reason instead of acting. */
  blocked?: boolean
  /** Auto-dismiss duration on touch (ms). */
  duration?: number
}>(), {
  mode: 'auto',
  blocked: false,
  duration: 2500,
})

const PAD = 12

const { isCoarse } = useCoarsePointer()
const rootRef = ref<HTMLElement | null>(null)
const bubbleRef = ref<HTMLElement | null>(null)
const open = ref(false)
const coords = ref({ top: 0, left: 0, placeBelow: false })
const hintId = `cb-hint-${useId()}`
let hideTimer: ReturnType<typeof setTimeout> | null = null
let hoverLocked = false

const intercept = computed(() =>
  Boolean(props.text) && (props.mode === 'info' || props.blocked) && isCoarse.value,
)

const bubbleStyle = computed(() => ({
  top: `${coords.value.top}px`,
  left: `${coords.value.left}px`,
  transform: coords.value.placeBelow ? 'none' : 'translateY(-100%)',
  backgroundColor: 'var(--color-surface)',
  color: 'var(--color-text)',
  border: '1px solid rgba(var(--color-muted-rgb), 0.28)',
  boxShadow: '0 8px 24px rgba(0,0,0,.32)',
}))

function clearTimer() {
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
}

function estimateBubbleSize() {
  const maxW = Math.min(220, Math.floor(window.innerWidth * 0.7))
  // Rough single-line estimate before measure; clamp keeps it on-screen either way.
  const approxW = Math.min(maxW, Math.max(120, props.text.length * 6.5))
  return { width: approxW, height: 36 }
}

function clampPosition(anchor: DOMRect, size: { width: number, height: number }) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const gap = 8
  const maxW = Math.min(220, vw - PAD * 2)

  const width = Math.min(size.width, maxW)
  const height = size.height

  let placeBelow = anchor.top < PAD + height + gap
  let top = placeBelow ? anchor.bottom + gap : anchor.top - gap

  // Prefer centered on trigger, then keep fully inside the viewport.
  let left = anchor.left + anchor.width / 2 - width / 2
  left = Math.min(Math.max(left, PAD), vw - PAD - width)

  if (!placeBelow && top - height < PAD) {
    placeBelow = true
    top = anchor.bottom + gap
  }
  if (placeBelow && top + height > vh - PAD) {
    placeBelow = false
    top = anchor.top - gap
  }

  return { top, left, placeBelow }
}

function updatePosition() {
  const el = rootRef.value
  if (!el || !import.meta.client) return

  const anchor = el.getBoundingClientRect()
  const measured = bubbleRef.value
  const size = measured
    ? { width: measured.offsetWidth, height: measured.offsetHeight }
    : estimateBubbleSize()

  coords.value = clampPosition(anchor, size)
}

async function show(temporary: boolean) {
  if (!props.text) return
  clearTimer()
  updatePosition()
  open.value = true
  await nextTick()
  updatePosition()
  // Second pass after layout/fonts settle
  requestAnimationFrame(() => updatePosition())

  if (temporary) {
    hideTimer = setTimeout(() => {
      open.value = false
      hideTimer = null
    }, props.duration)
  }
}

function hide() {
  clearTimer()
  open.value = false
}

function onMouseEnter() {
  if (isCoarse.value || !props.text) return
  hoverLocked = true
  void show(false)
}

function onMouseLeave() {
  if (isCoarse.value) return
  hoverLocked = false
  hide()
}

function onFocusIn() {
  if (isCoarse.value || !props.text) return
  void show(false)
}

function onFocusOut(event: FocusEvent) {
  if (isCoarse.value) return
  const next = event.relatedTarget
  if (next instanceof Node && rootRef.value?.contains(next)) return
  if (!hoverLocked) hide()
}

function onClick(event: MouseEvent) {
  if (!props.text) return

  if (props.mode === 'info') {
    if (isCoarse.value) {
      event.preventDefault()
      event.stopPropagation()
      void show(true)
    }
    return
  }

  if (props.blocked && isCoarse.value) {
    event.preventDefault()
    event.stopPropagation()
    void show(true)
  }
}

function onViewportChange() {
  if (open.value) updatePosition()
}

onMounted(() => {
  if (!import.meta.client) return
  window.addEventListener('scroll', onViewportChange, true)
  window.addEventListener('resize', onViewportChange)
})

onUnmounted(() => {
  clearTimer()
  if (!import.meta.client) return
  window.removeEventListener('scroll', onViewportChange, true)
  window.removeEventListener('resize', onViewportChange)
})
</script>

<style scoped>
.cb-hint {
  position: relative;
  display: inline-flex;
  max-width: 100%;
  vertical-align: middle;
}

.cb-hint-target {
  display: inline-flex;
  max-width: 100%;
}

.cb-hint-target--passthrough :deep(button),
.cb-hint-target--passthrough :deep([role='button']) {
  pointer-events: none;
}

.cb-hint--blocked {
  cursor: default;
}
</style>

<style>
.cb-hint-bubble {
  position: fixed;
  z-index: 90;
  box-sizing: border-box;
  width: max-content;
  max-width: min(220px, calc(100vw - 24px));
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.35;
  text-align: center;
  pointer-events: none;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.cb-hint-pop-enter-active,
.cb-hint-pop-leave-active {
  transition: opacity 0.15s ease;
}

.cb-hint-pop-enter-from,
.cb-hint-pop-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .cb-hint-pop-enter-active,
  .cb-hint-pop-leave-active {
    transition: none;
  }
}
</style>
