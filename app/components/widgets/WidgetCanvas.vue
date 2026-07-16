<template>
  <div
    v-if="widgetStore.activeWidgets.length > 0"
    ref="canvasRef"
    class="widget-canvas absolute inset-x-0 top-0 z-[15] pointer-events-none"
    :data-dragging="draggingId ? 'true' : 'false'"
    :style="{
      height: `${boardHeightPx}px`,
      minHeight: '100dvh',
      '--widget-card-width': `${cardWidthPx}px`,
    }"
  >
    <div
      v-if="draggingId"
      class="widget-board-grid absolute inset-0 pointer-events-none"
      aria-hidden="true"
    />

    <!-- Forbidden hero zone hint while dragging -->
    <div
      v-if="draggingId && heroHintStyle"
      class="widget-hero-forbidden absolute pointer-events-none"
      :class="{ 'widget-hero-forbidden--active': placementInvalid }"
      :style="heroHintStyle"
      aria-hidden="true"
    />

    <div
      v-for="widget in widgetStore.activeWidgets"
      :key="widget.id"
      class="widget-board-item absolute pointer-events-auto"
      :class="{
        'widget-board-item--dragging': draggingId === widget.id,
        'widget-board-item--invalid': draggingId === widget.id && placementInvalid,
        'widget-board-item--blocked': blockedIds.has(widget.id),
      }"
      :style="itemStyle(widget.id)"
      :data-widget-id="widget.id"
      @pointerdown="onPointerDown($event, widget.id)"
    >
      <button
        type="button"
        class="widget-board-close"
        :aria-label="`Close ${widget.name}`"
        title="Close"
        @pointerdown.stop
        @click.stop="closeWidget(widget.id)"
      >
        <Icon name="mdi:close" size="14" />
      </button>

      <component
        :is="resolveWidget(widget.component)"
        class="widget-board-card"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { WIDGET_BOARD_CARD_WIDTH_PX, WIDGET_BOARD_GRID_PX } from '../../../types/settings'

const LONG_PRESS_MS = 280
const MOVE_THRESHOLD_PX = 7
const COLLISION_PAD = 6
const HERO_PAD = 12

interface BoardRect {
  left: number
  top: number
  right: number
  bottom: number
}

const widgetStore = useWidgetStore()
const layoutStore = useLayoutStore()

const emit = defineEmits<{
  'board-height': [height: number]
}>()

const canvasRef = ref<HTMLElement | null>(null)
const draggingId = ref<string | null>(null)
const dragOffset = ref({ x: 0, y: 0 })
const livePosition = ref<{ x: number, y: number } | null>(null)
const dragOrigin = ref<{ x: number, y: number } | null>(null)
const placementInvalid = ref(false)
const blockedIds = ref<Set<string>>(new Set())
const heroHintStyle = ref<Record<string, string> | null>(null)
const cardWidthPx = ref(WIDGET_BOARD_CARD_WIDTH_PX)
const boardHeightPx = ref(typeof window !== 'undefined' ? window.innerHeight : 800)

let pressTimer: ReturnType<typeof setTimeout> | null = null
let pressId: string | null = null
let pressStart = { x: 0, y: 0 }
let pressItem: HTMLElement | null = null

const widgetModules = import.meta.glob('./*Widget.vue')
const componentCache = new Map<string, Component>()

function resolveWidget(componentName: string): Component | null {
  if (componentCache.has(componentName)) {
    return componentCache.get(componentName)!
  }

  const path = `./${componentName}.vue`
  const loader = widgetModules[path]
  if (!loader) {
    if (import.meta.dev) {
      console.warn(`[WidgetCanvas] Missing component: ${componentName}`)
    }
    return null
  }

  const asyncComponent = defineAsyncComponent(loader as () => Promise<Component>)
  componentCache.set(componentName, asyncComponent)
  return asyncComponent
}

function itemStyle(id: string) {
  const pos = (draggingId.value === id && livePosition.value)
    ? livePosition.value
    : layoutStore.getPosition(id) ?? { x: 50, y: 70 }

  return {
    left: `${pos.x}%`,
    top: `${pos.y}%`,
    width: `min(${cardWidthPx.value}px, calc(100% - 1.25rem))`,
  }
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  return Boolean(
    target.closest(
      'button, a, input, textarea, select, option, label, [role="switch"], [role="slider"], [contenteditable="true"]',
    ),
  )
}

function canvasRect() {
  return canvasRef.value?.getBoundingClientRect() ?? null
}

function getHeroRect(): BoardRect | null {
  const canvas = canvasRect()
  const hero = document.querySelector('[data-board-hero]') as HTMLElement | null
  if (!canvas || !hero) return null
  const r = hero.getBoundingClientRect()
  return {
    left: r.left - canvas.left - HERO_PAD,
    top: r.top - canvas.top - HERO_PAD,
    right: r.right - canvas.left + HERO_PAD,
    bottom: r.bottom - canvas.top + HERO_PAD,
  }
}

function updateHeroHint() {
  const hero = getHeroRect()
  if (!hero) {
    heroHintStyle.value = null
    return
  }
  heroHintStyle.value = {
    left: `${hero.left}px`,
    top: `${hero.top}px`,
    width: `${hero.right - hero.left}px`,
    height: `${hero.bottom - hero.top}px`,
  }
}

function rectsOverlap(a: BoardRect, b: BoardRect, pad = 0): boolean {
  return !(
    a.right + pad <= b.left
    || a.left >= b.right + pad
    || a.bottom + pad <= b.top
    || a.top >= b.bottom + pad
  )
}

function measureHeights(): Record<string, number> {
  const heights: Record<string, number> = {}
  if (!canvasRef.value) return heights
  for (const widget of widgetStore.activeWidgets) {
    const el = canvasRef.value.querySelector(
      `[data-widget-id="${widget.id}"]`,
    ) as HTMLElement | null
    if (el) heights[widget.id] = el.offsetHeight
  }
  return heights
}

function packOriginY(_canvasHeight: number): number {
  const hero = getHeroRect()
  if (hero) return hero.bottom + 28
  return Math.max(window.innerHeight * 0.55, window.innerHeight * 0.5 + 80)
}

function packBoard(options?: { forceAll?: boolean }) {
  const canvas = canvasRef.value
  if (!canvas) return
  const width = canvas.clientWidth || window.innerWidth
  const viewportH = window.innerHeight
  const result = layoutStore.packDefaultLayout(
    widgetStore.activeWidgets.map(w => w.id),
    width,
    viewportH,
    measureHeights(),
    {
      forceAll: options?.forceAll,
      originYPx: packOriginY(viewportH),
    },
  )
  cardWidthPx.value = result.cardWidth
  boardHeightPx.value = result.boardHeight
  emit('board-height', result.boardHeight)
}

async function refreshLayout(options?: { forceAll?: boolean }) {
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  await nextTick()
  packBoard(options)
  // Async widgets may still grow — second pass
  await new Promise<void>(resolve => setTimeout(resolve, 80))
  packBoard(options)
}

watch(
  () => widgetStore.enabledWidgets.slice(),
  async () => {
    await refreshLayout()
  },
)

onMounted(async () => {
  const migrated = layoutStore.migrateLayoutRev()
  const needsFullPack = migrated || Object.keys(layoutStore.widgetPositions).length === 0
  await refreshLayout({ forceAll: needsFullPack })
  window.addEventListener('chronoboard:repack-widgets', onRepackEvent)
  window.addEventListener('resize', onResize)
  window.addEventListener('orientationchange', onResize)
})

function onRepackEvent() {
  void refreshLayout({ forceAll: true })
}

let resizeTimer: ReturnType<typeof setTimeout> | null = null
function onResize() {
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    const anyMoved = widgetStore.activeWidgets.some(w => layoutStore.wasMoved(w.id))
    void refreshLayout({ forceAll: !anyMoved })
  }, 180)
}

function snap(value: number) {
  return Math.round(value / WIDGET_BOARD_GRID_PX) * WIDGET_BOARD_GRID_PX
}

function clampToCanvas(leftPx: number, topPx: number, el: HTMLElement) {
  const rect = canvasRect()
  if (!rect) return { left: 0, top: 0 }

  const maxLeft = Math.max(0, rect.width - el.offsetWidth)
  const maxTop = Math.max(0, rect.height - el.offsetHeight)
  return {
    left: Math.min(maxLeft, Math.max(0, leftPx)),
    top: Math.min(maxTop, Math.max(0, topPx)),
  }
}

function toPercent(left: number, top: number) {
  const rect = canvasRect()
  if (!rect) return { x: 0, y: 0 }
  return {
    x: (left / rect.width) * 100,
    y: (top / rect.height) * 100,
  }
}

function evaluatePlacement(id: string, left: number, top: number, el: HTMLElement) {
  const proposed: BoardRect = {
    left,
    top,
    right: left + el.offsetWidth,
    bottom: top + el.offsetHeight,
  }

  const blocked = new Set<string>()
  let invalid = false

  const hero = getHeroRect()
  if (hero && rectsOverlap(proposed, hero, 0)) {
    invalid = true
  }

  if (!canvasRef.value) {
    placementInvalid.value = invalid
    blockedIds.value = blocked
    return !invalid
  }

  for (const widget of widgetStore.activeWidgets) {
    if (widget.id === id) continue
    const other = canvasRef.value.querySelector(
      `[data-widget-id="${widget.id}"]`,
    ) as HTMLElement | null
    if (!other) continue
    const canvas = canvasRect()
    if (!canvas) continue
    const r = other.getBoundingClientRect()
    const otherRect: BoardRect = {
      left: r.left - canvas.left,
      top: r.top - canvas.top,
      right: r.right - canvas.left,
      bottom: r.bottom - canvas.top,
    }
    if (rectsOverlap(proposed, otherRect, COLLISION_PAD)) {
      invalid = true
      blocked.add(widget.id)
    }
  }

  placementInvalid.value = invalid
  blockedIds.value = blocked
  return !invalid
}

function closeWidget(id: string) {
  widgetStore.setWidgetEnabled(id, false)
  layoutStore.clearMoved(id)
}

function clearPress() {
  if (pressTimer) {
    clearTimeout(pressTimer)
    pressTimer = null
  }
  pressId = null
  pressItem = null
  window.removeEventListener('pointermove', onPressMove)
  window.removeEventListener('pointerup', onPressCancel)
  window.removeEventListener('pointercancel', onPressCancel)
}

function beginDrag(id: string, item: HTMLElement, clientX: number, clientY: number) {
  const rect = canvasRect()
  if (!rect) return

  const itemRect = item.getBoundingClientRect()
  const origin = {
    x: ((itemRect.left - rect.left) / rect.width) * 100,
    y: ((itemRect.top - rect.top) / rect.height) * 100,
  }

  draggingId.value = id
  dragOrigin.value = { ...origin }
  dragOffset.value = {
    x: clientX - itemRect.left,
    y: clientY - itemRect.top,
  }
  livePosition.value = { ...origin }
  placementInvalid.value = false
  blockedIds.value = new Set()
  updateHeroHint()

  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointercancel', onPointerUp)
}

function onPointerDown(event: PointerEvent, id: string) {
  if (event.button !== 0) return
  if (isInteractiveTarget(event.target)) return
  if (draggingId.value) return

  const item = event.currentTarget as HTMLElement
  pressId = id
  pressItem = item
  pressStart = { x: event.clientX, y: event.clientY }

  pressTimer = setTimeout(() => {
    if (pressId === id && pressItem) {
      beginDrag(id, pressItem, pressStart.x, pressStart.y)
      clearPress()
    }
  }, LONG_PRESS_MS)

  window.addEventListener('pointermove', onPressMove)
  window.addEventListener('pointerup', onPressCancel)
  window.addEventListener('pointercancel', onPressCancel)
}

function onPressMove(event: PointerEvent) {
  if (!pressId || !pressItem) return
  const dx = event.clientX - pressStart.x
  const dy = event.clientY - pressStart.y
  if (Math.hypot(dx, dy) < MOVE_THRESHOLD_PX) return

  const id = pressId
  const item = pressItem
  clearPress()
  beginDrag(id, item, event.clientX, event.clientY)
  onPointerMove(event)
}

function onPressCancel() {
  clearPress()
}

function onPointerMove(event: PointerEvent) {
  if (!draggingId.value) return
  const rect = canvasRect()
  const el = canvasRef.value?.querySelector(
    `[data-widget-id="${draggingId.value}"]`,
  ) as HTMLElement | null
  if (!rect || !el) return

  const rawLeft = event.clientX - rect.left - dragOffset.value.x
  const rawTop = event.clientY - rect.top - dragOffset.value.y
  const { left, top } = clampToCanvas(snap(rawLeft), snap(rawTop), el)
  livePosition.value = toPercent(left, top)
  evaluatePlacement(draggingId.value, left, top, el)
}

function onPointerUp() {
  if (draggingId.value && livePosition.value) {
    if (placementInvalid.value && dragOrigin.value) {
      livePosition.value = { ...dragOrigin.value }
      // Revert — do not mark as moved if they returned home without valid drop
    }
    else {
      layoutStore.setWidgetPosition(draggingId.value, livePosition.value, { moved: true })
    }
  }

  draggingId.value = null
  livePosition.value = null
  dragOrigin.value = null
  placementInvalid.value = false
  blockedIds.value = new Set()
  heroHintStyle.value = null

  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerUp)
}

onUnmounted(() => {
  clearPress()
  if (resizeTimer) clearTimeout(resizeTimer)
  window.removeEventListener('chronoboard:repack-widgets', onRepackEvent)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('orientationchange', onResize)
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerUp)
})
</script>

<style scoped>
.widget-board-grid {
  background-image:
    linear-gradient(
      to right,
      color-mix(in srgb, var(--color-muted) 18%, transparent) 1px,
      transparent 1px
    ),
    linear-gradient(
      to bottom,
      color-mix(in srgb, var(--color-muted) 18%, transparent) 1px,
      transparent 1px
    );
  background-size: 24px 24px;
  mask-image: radial-gradient(ellipse at center, black 35%, transparent 85%);
  opacity: 0.9;
}

.widget-hero-forbidden {
  border-radius: 16px;
  border: 1.5px dashed color-mix(in srgb, var(--color-muted) 35%, transparent);
  background: color-mix(in srgb, var(--color-muted) 6%, transparent);
  transition: border-color 0.15s ease, background 0.15s ease;
}

.widget-hero-forbidden--active {
  border-color: color-mix(in srgb, #ef4444 75%, transparent);
  background: color-mix(in srgb, #ef4444 12%, transparent);
}

.widget-board-item {
  position: absolute;
  touch-action: pan-y;
  z-index: 1;
  transition: box-shadow 0.18s ease, outline-color 0.15s ease;
  cursor: grab;
}

.widget-board-item--dragging {
  z-index: 20;
  cursor: grabbing;
  touch-action: none;
  outline: 1.5px solid color-mix(in srgb, var(--color-primary) 55%, transparent);
  outline-offset: 4px;
  border-radius: 14px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
}

.widget-board-item--invalid {
  outline-color: #ef4444;
  box-shadow: 0 12px 40px color-mix(in srgb, #ef4444 28%, transparent);
}

.widget-board-item--blocked {
  outline: 1.5px solid color-mix(in srgb, #ef4444 70%, transparent);
  outline-offset: 4px;
  border-radius: 14px;
}

.widget-board-close {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 3;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-muted);
  background: color-mix(in srgb, var(--color-bg) 75%, transparent);
  opacity: 0;
  transition: opacity 0.15s ease, color 0.15s ease, background 0.15s ease;
}

.widget-board-item:hover .widget-board-close,
.widget-board-item:focus-within .widget-board-close,
.widget-board-close:focus-visible {
  opacity: 1;
}

.widget-board-close:hover {
  color: var(--color-text);
  background: color-mix(in srgb, var(--color-surface) 95%, transparent);
}

.widget-board-card {
  width: 100%;
}

@media (pointer: coarse) {
  .widget-board-close {
    opacity: 0.85;
  }
}
</style>
