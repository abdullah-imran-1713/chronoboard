<template>
  <div
    v-if="widgetStore.activeWidgets.length > 0 || layoutStore.showSupportOnBoard"
    ref="canvasRef"
    class="widget-canvas absolute inset-x-0 top-0 z-[15] pointer-events-none"
    :data-dragging="draggingId ? 'true' : 'false'"
    :style="{
      height: `${boardHeightPx}px`,
      minHeight: '100vh',
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
        'widget-board-item--editing': editingId === widget.id,
        'widget-board-item--chrome': chromeId === widget.id || editingId === widget.id,
      }"
      :style="itemStyle(widget.id)"
      :data-widget-id="widget.id"
      :data-chrome="chromeId === widget.id || editingId === widget.id ? 'true' : 'false'"
      @pointerdown.capture="onChromeWake($event, widget.id)"
      @pointerdown="onPointerDown($event, widget.id)"
    >
      <div
        class="widget-board-body"
        :style="{
          width: `min(${cardWidthPx}px, calc(100vw - 1.25rem))`,
          zoom: widgetScale(widget.id),
          '--widget-scale-fallback': String(widgetScale(widget.id)),
        }"
      >
        <component
          :is="resolveWidget(widget.component)"
          class="widget-board-card"
        />
      </div>

      <div
        class="widget-board-actions"
        data-widget-chrome
        :aria-hidden="chromeId === widget.id || editingId === widget.id ? 'false' : 'true'"
      >
        <button
          type="button"
          class="widget-board-chrome-btn"
          :tabindex="chromeId === widget.id || editingId === widget.id ? 0 : -1"
          :aria-label="`Edit ${widget.name} size`"
          :aria-expanded="editingId === widget.id"
          @pointerdown.stop
          @click.stop="toggleEdit(widget.id)"
        >
          <Icon name="mdi:pencil" size="15" />
        </button>
        <button
          type="button"
          class="widget-board-chrome-btn"
          :tabindex="chromeId === widget.id || editingId === widget.id ? 0 : -1"
          :aria-label="`Close ${widget.name}`"
          @pointerdown.stop
          @click.stop="closeWidget(widget.id)"
        >
          <Icon name="mdi:close" size="16" />
        </button>
      </div>

      <WidgetSizePopover
        v-if="editingId === widget.id"
        :model-value="widgetScale(widget.id)"
        @update:model-value="onScalePreview(widget.id, $event)"
        @commit="onScaleCommit(widget.id, $event)"
      />
    </div>

    <div
      v-if="layoutStore.showSupportOnBoard && supportReady"
      class="widget-support-slot pointer-events-auto"
      :style="supportSlotStyle"
      data-board-support-footer
    >
      <SupportFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import {
  BOARD_FAB_CLEARANCE_PX,
  SUPPORT_FOOTER_END_PAD_PX,
  SUPPORT_FOOTER_GAP_PX,
  SUPPORT_FOOTER_HEIGHT_PX,
  SUPPORT_FOOTER_VIEWPORT_INSET_PX,
  WIDGET_BOARD_CARD_WIDTH_PX,
  WIDGET_BOARD_GRID_PX,
} from '../../../types/settings'

const LONG_PRESS_MS_FINE = 280
const LONG_PRESS_MS_COARSE = 420
/** Same hide cadence as board FAB rail (`useCursorAutoHide(3000)`). */
const CHROME_VISIBLE_MS = 3000
const MOVE_THRESHOLD_PX = 7
/** Touch finger wobble — don't treat as drag */
const COARSE_TAP_SLOP_PX = 18
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
const { isCoarse } = useCoarsePointer()

function isTouchLikePointer(event: PointerEvent) {
  return isCoarse.value || event.pointerType === 'touch'
}
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
const boardHeightPx = ref(resolveInitialBoardHeight())
const editingId = ref<string | null>(null)
const chromeId = ref<string | null>(null)
const scalePreview = ref<Record<string, number>>({})
/** Pixel offset from canvas top — set only after client mount (avoid SSR top:0 flash). */
const footerTopPx = ref(0)
/** Prefer CSS `bottom` when pinned to the first viewport; use `top` when content pushes further. */
const footerPinBottom = ref(true)
const supportReady = ref(false)

const supportSlotStyle = computed(() => {
  if (footerPinBottom.value) {
    return {
      top: 'auto',
      // CSS var clears the FAB rail on phones; desktop/tablet keep 36px.
      bottom: 'var(--support-footer-inset)',
    }
  }
  const top = Number.isFinite(footerTopPx.value) ? Math.max(0, footerTopPx.value) : 0
  return {
    top: `${top}px`,
    bottom: 'auto',
  }
})

/** Resolved pinned footer inset (px) — matches `--support-footer-inset`. */
function supportFooterInsetPx() {
  if (!import.meta.client) return SUPPORT_FOOTER_VIEWPORT_INSET_PX
  const probe = document.createElement('div')
  probe.style.cssText = [
    'position:fixed',
    'left:0',
    'bottom:0',
    'width:0',
    'height:var(--support-footer-inset)',
    'visibility:hidden',
    'pointer-events:none',
  ].join(';')
  document.body.appendChild(probe)
  const px = probe.getBoundingClientRect().height
  probe.remove()
  return px > 0 ? px : SUPPORT_FOOTER_VIEWPORT_INSET_PX
}

function resolveInitialBoardHeight() {
  if (!import.meta.client) return 800
  const saved = layoutStore.boardHeightPx
  const viewport = window.innerHeight
  // Use persisted height so % positions don’t jump onto the clock on refresh
  if (saved >= viewport) return saved
  return Math.max(viewport, 1)
}

let pressTimer: ReturnType<typeof setTimeout> | null = null
let pressId: string | null = null
let pressStart = { x: 0, y: 0 }
let pressItem: HTMLElement | null = null
/** True when finger moved past tap slop (swipe) — cancel pending long-press drag */
let pressExceededTapSlop = false
/** Active pointer for press/drag — ignore other pointers; used for setPointerCapture */
let activePointerId: number | null = null
let chromeTimer: ReturnType<typeof setTimeout> | null = null

function capturePointer(el: HTMLElement, pointerId: number) {
  try {
    if (!el.hasPointerCapture?.(pointerId)) el.setPointerCapture(pointerId)
  }
  catch {
    // Older WebViews may throw if the pointer is already gone
  }
}

function releasePointer(el: HTMLElement | null, pointerId: number | null) {
  if (!el || pointerId == null) return
  try {
    if (el.hasPointerCapture?.(pointerId)) el.releasePointerCapture(pointerId)
  }
  catch {
    // ignore
  }
}

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
  }
}

function clearChromeTimer() {
  if (!chromeTimer) return
  clearTimeout(chromeTimer)
  chromeTimer = null
}

/** Touch/tablet: briefly reveal edit/close chrome after a tap. */
function revealChrome(id: string) {
  chromeId.value = id
  clearChromeTimer()
  chromeTimer = setTimeout(() => {
    if (editingId.value === id) return
    if (chromeId.value === id) chromeId.value = null
    chromeTimer = null
  }, CHROME_VISIBLE_MS)
}

function hideChrome(id?: string) {
  if (id && chromeId.value !== id) return
  chromeId.value = null
  clearChromeTimer()
}

function toggleEdit(id: string) {
  if (editingId.value === id) {
    clearScalePreview(id)
    editingId.value = null
    if (isCoarse.value) revealChrome(id)
    return
  }
  editingId.value = id
  if (isCoarse.value) {
    chromeId.value = id
    clearChromeTimer()
  }
}

function widgetScale(id: string) {
  return scalePreview.value[id] ?? layoutStore.getSizeScale(id)
}

function clearScalePreview(id: string) {
  const { [id]: _, ...rest } = scalePreview.value
  scalePreview.value = rest
}

/** Live scale while sliding — no store write or board pack, so mouse drag stays smooth. */
function onScalePreview(id: string, scale: number) {
  scalePreview.value = { ...scalePreview.value, [id]: scale }
}

/** Pack once after preset click or when the custom slider is released. */
function onScaleCommit(id: string, scale?: number) {
  layoutStore.setWidgetScale(id, scale ?? widgetScale(id))
  clearScalePreview(id)
  nextTick(() => {
    void refreshLayout({ forceAll: false })
  })
}

function closeEditOnOutside(event: PointerEvent) {
  const target = event.target
  if (!(target instanceof Element)) return

  if (editingId.value) {
    if (target.closest(`[data-widget-id="${editingId.value}"]`)) return
    clearScalePreview(editingId.value)
    editingId.value = null
  }

  if (chromeId.value) {
    if (target.closest(`[data-widget-id="${chromeId.value}"]`)) return
    hideChrome()
  }
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  // Hidden edit/close chrome must never swallow the tap that reveals it
  if (target.closest('[data-widget-chrome]')) return false
  // Note: do NOT treat [data-widget-swipe] as interactive — weather swipe
  // must still allow a short tap to reveal edit/close chrome.
  return Boolean(
    target.closest(
      'button, a, input, textarea, select, option, label, [role="switch"], [role="slider"], [contenteditable="true"], [data-widget-size-popover]',
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

function measureLowestContentBottom(): number {
  if (!canvasRef.value) return 0
  const canvas = canvasRect()
  if (!canvas) return 0

  let maxBottom = 0
  for (const widget of widgetStore.activeWidgets) {
    const el = canvasRef.value.querySelector(
      `[data-widget-id="${widget.id}"]`,
    ) as HTMLElement | null
    if (!el) continue
    const r = el.getBoundingClientRect()
    maxBottom = Math.max(maxBottom, r.bottom - canvas.top)
  }
  return maxBottom
}

/**
 * Footer sits under the lowest widget (or pinned near the viewport bottom).
 * Page height ends at the footer — no empty scroll below.
 */
function syncBoardExtent() {
  if (!import.meta.client) return

  const viewportH = Math.max(1, window.innerHeight || 800)
  const contentBottom = Math.max(0, measureLowestContentBottom())
  const showSupport = layoutStore.showSupportOnBoard

  let nextHeight: number
  if (showSupport) {
    const inset = supportFooterInsetPx()
    const pinnedTop = Math.max(
      0,
      viewportH - inset - SUPPORT_FOOTER_HEIGHT_PX,
    )
    const belowContent = contentBottom > 0
      ? contentBottom + SUPPORT_FOOTER_GAP_PX
      : pinnedTop
    const nextTop = Math.max(pinnedTop, belowContent)
    footerTopPx.value = nextTop
    // Pin with CSS `bottom` when we're still on the first screen — avoids SSR/hydration top:0.
    footerPinBottom.value = nextTop <= pinnedTop + 1
    nextHeight = Math.max(
      viewportH,
      nextTop + SUPPORT_FOOTER_HEIGHT_PX + SUPPORT_FOOTER_END_PAD_PX,
    )
  }
  else {
    footerPinBottom.value = true
    nextHeight = Math.max(
      viewportH,
      contentBottom > 0 ? contentBottom + BOARD_FAB_CLEARANCE_PX : viewportH,
    )
  }

  const prevH = Math.max(boardHeightPx.value, 1)
  if (Math.abs(nextHeight - prevH) >= 0.5) {
    const snapshots = widgetStore.activeWidgets.flatMap((widget) => {
      const pos = (draggingId.value === widget.id && livePosition.value)
        ? livePosition.value
        : layoutStore.getPosition(widget.id)
      if (!pos) return []
      return [{
        id: widget.id,
        x: pos.x,
        topPx: (pos.y / 100) * prevH,
      }]
    })

    boardHeightPx.value = nextHeight

    for (const snap of snapshots) {
      const nextPos = {
        x: snap.x,
        y: (snap.topPx / nextHeight) * 100,
      }
      if (draggingId.value === snap.id && livePosition.value) {
        livePosition.value = nextPos
      }
      else {
        layoutStore.setWidgetPosition(snap.id, nextPos)
      }
    }
  }

  emit('board-height', boardHeightPx.value)
  layoutStore.setBoardHeightPx(boardHeightPx.value)
}

function packBoard(options?: { forceAll?: boolean }) {
  const canvas = canvasRef.value
  if (!canvas) {
    syncBoardExtent()
    return
  }

  if (widgetStore.activeWidgets.length === 0) {
    cardWidthPx.value = WIDGET_BOARD_CARD_WIDTH_PX
    syncBoardExtent()
    return
  }

  const forceAll = options?.forceAll === true
  const ids = widgetStore.activeWidgets.map(w => w.id)

  // Critical: if every widget already has a saved spot, do not rewrite positions.
  // Refresh/resize used to re-percent them against the wrong board height and
  // slide widgets onto the clock or over each other.
  if (!forceAll && ids.every(id => layoutStore.getPosition(id))) {
    syncBoardExtent()
    return
  }

  const width = canvas.clientWidth || window.innerWidth
  const viewportH = window.innerHeight
  const currentBoardH = Math.max(boardHeightPx.value, viewportH)
  const fixedPositions = forceAll
    ? []
    : widgetStore.activeWidgets.flatMap((widget) => {
        const position = layoutStore.getPosition(widget.id)
        if (!position) return []
        return [{
          id: widget.id,
          x: position.x,
          topPx: (position.y / 100) * currentBoardH,
        }]
      })

  const result = layoutStore.packDefaultLayout(
    ids,
    width,
    viewportH,
    measureHeights(),
    {
      forceAll,
      originYPx: packOriginY(viewportH),
      currentBoardHeightPx: currentBoardH,
      currentCardWidthPx: cardWidthPx.value,
    },
  )

  for (const fixed of fixedPositions) {
    layoutStore.setWidgetPosition(fixed.id, {
      x: fixed.x,
      y: (fixed.topPx / result.boardHeight) * 100,
    })
  }

  cardWidthPx.value = result.cardWidth
  boardHeightPx.value = result.boardHeight
  layoutStore.setBoardHeightPx(result.boardHeight)
  syncBoardExtent()
}

async function refreshLayout(options?: { forceAll?: boolean }) {
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  await nextTick()
  packBoard(options)
  // Async widgets may still grow — second pass
  await new Promise<void>(resolve => setTimeout(resolve, 80))
  packBoard(options)
  // Weather / prayer / Quran often settle later — keep footer under content
  scheduleSupportResync()
}

let supportResyncTimers: ReturnType<typeof setTimeout>[] = []
function clearSupportResyncTimers() {
  for (const t of supportResyncTimers) clearTimeout(t)
  supportResyncTimers = []
}

function scheduleSupportResync() {
  if (!import.meta.client || !layoutStore.showSupportOnBoard) return
  clearSupportResyncTimers()
  for (const delay of [120, 400, 900, 1600]) {
    supportResyncTimers.push(setTimeout(() => {
      syncBoardExtent()
    }, delay))
  }
}

watch(
  () => widgetStore.enabledWidgets.slice(),
  async (_enabled, previouslyEnabled = []) => {
    const enabled = new Set(_enabled)
    for (const id of previouslyEnabled) {
      if (!enabled.has(id)) layoutStore.clearWidgetPosition(id)
    }
    await refreshLayout()
    await nextTick()
    refreshWidgetResizeObserver()
  },
)

watch(
  () => layoutStore.showSupportOnBoard,
  () => {
    nextTick(() => syncBoardExtent())
  },
)

onMounted(async () => {
  const migrated = layoutStore.migrateLayoutRev()
  if (layoutStore.boardHeightPx > boardHeightPx.value) {
    boardHeightPx.value = layoutStore.boardHeightPx
  }
  // Only full-pack when layout was wiped by migration or nothing is saved yet.
  // Never reshuffle existing placements on ordinary refresh.
  const needsFullPack = migrated || Object.keys(layoutStore.widgetPositions).length === 0
  await refreshLayout({ forceAll: needsFullPack })
  syncBoardExtent()
  supportReady.value = true
  // Second pass after paint — widget async cards can still settle.
  await nextTick()
  requestAnimationFrame(() => syncBoardExtent())
  scheduleSupportResync()
  bindWidgetResizeObserver()
  window.addEventListener('chronoboard:repack-widgets', onRepackEvent)
  window.addEventListener('chronoboard:support-visibility', onSupportVisibility)
  window.addEventListener('resize', onResize)
  window.addEventListener('orientationchange', onResize)
  document.addEventListener('pointerdown', closeEditOnOutside, true)
})

let widgetResizeObserver: ResizeObserver | null = null
let resizeSyncRaf = 0

function bindWidgetResizeObserver() {
  if (!import.meta.client || typeof ResizeObserver === 'undefined') return
  unbindWidgetResizeObserver()
  widgetResizeObserver = new ResizeObserver(() => {
    if (resizeSyncRaf) cancelAnimationFrame(resizeSyncRaf)
    resizeSyncRaf = requestAnimationFrame(() => {
      resizeSyncRaf = 0
      syncBoardExtent()
    })
  })
  const canvas = canvasRef.value
  if (!canvas) return
  for (const el of canvas.querySelectorAll('[data-widget-id]')) {
    widgetResizeObserver.observe(el)
  }
}

function unbindWidgetResizeObserver() {
  if (resizeSyncRaf) {
    cancelAnimationFrame(resizeSyncRaf)
    resizeSyncRaf = 0
  }
  widgetResizeObserver?.disconnect()
  widgetResizeObserver = null
}

function refreshWidgetResizeObserver() {
  if (!widgetResizeObserver || !canvasRef.value) {
    bindWidgetResizeObserver()
    return
  }
  widgetResizeObserver.disconnect()
  for (const el of canvasRef.value.querySelectorAll('[data-widget-id]')) {
    widgetResizeObserver.observe(el)
  }
}

function onRepackEvent(event: Event) {
  const forceAll = event instanceof CustomEvent && event.detail?.forceAll === true
  void refreshLayout({ forceAll })
}

function onSupportVisibility() {
  nextTick(() => {
    syncBoardExtent()
    scheduleSupportResync()
  })
}

let resizeTimer: ReturnType<typeof setTimeout> | null = null
function onResize() {
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    // Resize must never force-repack placed widgets
    void refreshLayout({ forceAll: false })
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
  if (editingId.value === id) editingId.value = null
  hideChrome(id)
  layoutStore.clearWidgetPosition(id)
  widgetStore.setWidgetEnabled(id, false)
}

function clearPress() {
  if (pressTimer) {
    clearTimeout(pressTimer)
    pressTimer = null
  }
  pressId = null
  pressItem = null
  pressExceededTapSlop = false
  window.removeEventListener('pointermove', onPressMove)
  window.removeEventListener('pointerup', onPressUp)
  window.removeEventListener('pointercancel', onPressCancel)
}

function beginDrag(id: string, item: HTMLElement, clientX: number, clientY: number) {
  clearScalePreview(id)
  editingId.value = null
  hideChrome()
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

  if (activePointerId != null) capturePointer(item, activePointerId)

  // passive:false so we can preventDefault and stop the board from scrolling
  window.addEventListener('pointermove', onPointerMove, { passive: false })
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointercancel', onPointerUp)
}

function onPointerDown(event: PointerEvent, id: string) {
  if (event.button !== 0) return
  if (isInteractiveTarget(event.target)) return
  if (draggingId.value) return
  if (editingId.value === id) return

  const item = event.currentTarget as HTMLElement
  pressId = id
  pressItem = item
  pressExceededTapSlop = false
  pressStart = { x: event.clientX, y: event.clientY }
  activePointerId = event.pointerId
  capturePointer(item, event.pointerId)
  // Keep the board from stealing this gesture once a press starts
  if (event.cancelable) event.preventDefault()

  const touchLike = isTouchLikePointer(event)
  const holdMs = touchLike ? LONG_PRESS_MS_COARSE : LONG_PRESS_MS_FINE
  pressTimer = setTimeout(() => {
    if (pressId === id && pressItem) {
      beginDrag(id, pressItem, pressStart.x, pressStart.y)
      clearPress()
    }
  }, holdMs)

  window.addEventListener('pointermove', onPressMove, { passive: false })
  window.addEventListener('pointerup', onPressUp)
  window.addEventListener('pointercancel', onPressCancel)
}

function onPressMove(event: PointerEvent) {
  if (!pressId || !pressItem) return
  if (activePointerId != null && event.pointerId !== activePointerId) return
  const dist = Math.hypot(event.clientX - pressStart.x, event.clientY - pressStart.y)

  // Touch: finger wobble must not start a drag. Drag only via long-press.
  if (isTouchLikePointer(event)) {
    if (dist >= COARSE_TAP_SLOP_PX) {
      pressExceededTapSlop = true
      if (pressTimer) {
        clearTimeout(pressTimer)
        pressTimer = null
      }
    }
    return
  }

  if (dist < MOVE_THRESHOLD_PX) return

  const id = pressId
  const item = pressItem
  clearPress()
  beginDrag(id, item, event.clientX, event.clientY)
  onPointerMove(event)
}

function onPressUp(event: PointerEvent) {
  if (activePointerId != null && event.pointerId !== activePointerId) return
  const item = pressItem
  const pid = activePointerId
  clearPress()
  releasePointer(item, pid)
  activePointerId = null
}

function onPressCancel(event: PointerEvent) {
  if (activePointerId != null && event.pointerId !== activePointerId) return
  const item = pressItem
  const pid = activePointerId
  clearPress()
  releasePointer(item, pid)
  activePointerId = null
}

/**
 * Board-FAB pattern: any press on the widget wakes edit/close chrome
 * (same idea as tapping the board to show the FAB rail).
 * Capture phase so weather swipe / child handlers cannot swallow it.
 */
function onChromeWake(event: PointerEvent, id: string) {
  if (event.button !== 0) return
  if (draggingId.value) return
  const target = event.target
  if (target instanceof Element) {
    // Don't fight the chrome / size controls themselves
    if (target.closest('[data-widget-chrome], [data-widget-size-popover]')) return
  }
  revealChrome(id)
}

function onPointerMove(event: PointerEvent) {
  if (!draggingId.value) return
  if (activePointerId != null && event.pointerId !== activePointerId) return
  // Stop page/board scroll from eating the drag (esp. vertical moves)
  if (event.cancelable) event.preventDefault()

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
  // Do NOT syncBoardExtent while dragging — height jumps cancel the gesture
}

function onPointerUp(event: PointerEvent) {
  if (activePointerId != null && event.pointerId !== activePointerId) return

  const el = draggingId.value
    ? canvasRef.value?.querySelector(`[data-widget-id="${draggingId.value}"]`) as HTMLElement | null
    : null
  const pid = activePointerId

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
  activePointerId = null

  releasePointer(el, pid)
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerUp)

  nextTick(() => {
    syncBoardExtent()
  })
}

let extentRaf: number | null = null
function scheduleExtentSync() {
  if (extentRaf != null) return
  extentRaf = requestAnimationFrame(() => {
    extentRaf = null
    syncBoardExtent()
  })
}

onUnmounted(() => {
  clearPress()
  clearChromeTimer()
  clearSupportResyncTimers()
  unbindWidgetResizeObserver()
  if (extentRaf != null) cancelAnimationFrame(extentRaf)
  if (resizeTimer) clearTimeout(resizeTimer)
  window.removeEventListener('chronoboard:repack-widgets', onRepackEvent)
  window.removeEventListener('chronoboard:support-visibility', onSupportVisibility)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('orientationchange', onResize)
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerUp)
  document.removeEventListener('pointerdown', closeEditOnOutside, true)
})
</script>

<style scoped>
.widget-board-grid {
  background-image:
    linear-gradient(
      to right,
      rgba(var(--color-muted-rgb), 0.18) 1px,
      transparent 1px
    ),
    linear-gradient(
      to bottom,
      rgba(var(--color-muted-rgb), 0.18) 1px,
      transparent 1px
    );
  background-size: 24px 24px;
  mask-image: radial-gradient(ellipse at center, black 35%, transparent 85%);
  opacity: 0.9;
}

.widget-hero-forbidden {
  border-radius: 16px;
  border: 1.5px dashed rgba(var(--color-muted-rgb), 0.35);
  background: rgba(var(--color-muted-rgb), 0.06);
  transition: border-color 0.15s ease, background 0.15s ease;
}

.widget-hero-forbidden--active {
  border-color: rgba(239, 68, 68, 0.75);
  background: rgba(239, 68, 68, 0.12);
}

.widget-board-item {
  position: absolute;
  /* none — parent board scroll must not steal vertical drag after long-press */
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  z-index: 1;
  width: max-content;
  max-width: calc(100% - 1.25rem);
  transition: box-shadow 0.18s ease, outline-color 0.15s ease;
  cursor: grab;
}

.widget-board-item--dragging {
  z-index: 20;
  cursor: grabbing;
  touch-action: none;
  outline: 1.5px solid rgba(var(--color-primary-rgb), 0.55);
  outline-offset: 4px;
  border-radius: 14px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
}

.widget-board-item--invalid {
  outline-color: #ef4444;
  box-shadow: 0 12px 40px rgba(239, 68, 68, 0.28);
}

.widget-board-item--blocked {
  outline: 1.5px solid rgba(239, 68, 68, 0.7);
  outline-offset: 4px;
  border-radius: 14px;
}

.widget-board-item--editing {
  z-index: 8;
  cursor: default;
  touch-action: manipulation;
}

.widget-board-item--chrome {
  z-index: 6;
}

.widget-board-actions {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 12;
  display: flex;
  align-items: center;
  gap: 6px;
  /* FAB-rail pattern: whole group fades in/out (not per-button opacity fights) */
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.35s ease;
}

.widget-board-item:hover .widget-board-actions,
.widget-board-item:focus-within .widget-board-actions,
.widget-board-item[data-chrome='true'] .widget-board-actions {
  opacity: 1;
  pointer-events: auto;
}

.widget-board-chrome-btn {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  border: 1px solid rgba(var(--color-muted-rgb), 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text);
  background: rgba(var(--color-surface-rgb), 0.85);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: none;
  padding: 0;
  transition:
    color 0.2s ease,
    border-color 0.2s ease,
    transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

.widget-board-chrome-btn:hover {
  border-color: rgba(var(--color-muted-rgb), 0.35);
  transform: scale(1.04);
}

.widget-board-chrome-btn:focus-visible {
  outline: 2px solid rgba(var(--color-primary-rgb), 0.55);
  outline-offset: 2px;
}

.widget-board-body {
  display: block;
}

.widget-board-card {
  width: 100%;
}

.widget-support-slot {
  position: absolute;
  left: 50%;
  z-index: 2;
  transform: translateX(-50%);
  width: max-content;
  max-width: calc(100% - 7.5rem);
  pointer-events: auto;
}

/* Phones / tablets: no sticky :hover — chrome only via data-chrome / focus-within */
@media (hover: none), (pointer: coarse) {
  .widget-board-item:hover .widget-board-actions {
    opacity: 0;
    pointer-events: none;
  }

  .widget-board-item[data-chrome='true'] .widget-board-actions,
  .widget-board-item:focus-within .widget-board-actions {
    opacity: 1;
    pointer-events: auto;
  }
}

/* Firefox / older engines without CSS zoom — scale without clipping text */
@supports not (zoom: 1) {
  .widget-board-body {
    transform: scale(var(--widget-scale-fallback, 1));
    transform-origin: top left;
  }
}
</style>
