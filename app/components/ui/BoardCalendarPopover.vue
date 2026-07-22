<template>
  <Teleport to="body">
    <Transition name="board-cal">
      <div
        v-if="mode"
        class="board-cal"
        data-board-calendar
        role="dialog"
        aria-modal="true"
        :aria-label="mode === 'hijri' ? 'Hijri calendar' : 'Calendar'"
        @click="close"
      >
        <div
          class="board-cal-panel font-ui"
          :dir="mode === 'hijri' && hijriLocale === 'ar' ? 'rtl' : 'ltr'"
          @click.stop
        >
          <div class="board-cal-head">
            <CbHint text="Previous month">
              <button
                type="button"
                class="board-cal-nav cb-icobtn"
                aria-label="Previous month"
                @click="activePrev"
              >
                <Icon :name="chevronPrev" size="22" />
              </button>
            </CbHint>

            <p class="board-cal-title m-0">
              {{ activeLabel }}
            </p>

            <CbHint text="Next month">
              <button
                type="button"
                class="board-cal-nav cb-icobtn"
                aria-label="Next month"
                @click="activeNext"
              >
                <Icon :name="chevronNext" size="22" />
              </button>
            </CbHint>
          </div>

          <div
            class="board-cal-body"
            @pointerdown="onSwipePointerDown"
          >
            <p
              v-if="mode === 'hijri' && hijriLoading"
              class="board-cal-status m-0"
            >
              Loading…
            </p>

            <p
              v-else-if="mode === 'hijri' && hijriError"
              class="board-cal-status m-0"
            >
              Couldn’t load Hijri month
            </p>

            <div
              v-else
              class="board-cal-grid"
            >
              <span
                v-for="label in activeWeekdays"
                :key="label"
                class="board-cal-dow"
              >
                {{ label }}
              </span>

              <template v-for="(week, wi) in activeWeeks" :key="wi">
                <span
                  v-for="(day, di) in week"
                  :key="`${wi}-${di}`"
                  class="board-cal-day"
                  :data-today="day.isToday ? 'true' : 'false'"
                  :data-muted="day.isCurrentMonth ? 'false' : 'true'"
                >
                  <span class="board-cal-day-num">{{ day.date > 0 ? day.date : '' }}</span>
                </span>
              </template>
            </div>
          </div>

          <p class="board-cal-footnote m-0">
            {{ mode === 'hijri' ? 'Hijri calendar' : 'Gregorian calendar' }}
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { HijriLocale } from '../../../types/date'

const settings = useSettingsStore()
const { mode, close } = useBoardCalendar()

const hijriLocale = computed((): HijriLocale => settings.hijriLocale)

const gregorian = useCalendar()
const hijri = useHijriCalendar(hijriLocale)

const activeLabel = computed(() =>
  mode.value === 'hijri' ? hijri.monthLabel.value : gregorian.monthLabel.value,
)

const activeWeeks = computed(() =>
  mode.value === 'hijri' ? hijri.weeks.value : gregorian.weeks.value,
)

const activeWeekdays = computed(() =>
  mode.value === 'hijri' ? hijri.weekdayLabels.value : gregorian.weekdayLabels,
)

const hijriLoading = computed(() => hijri.loading.value)
const hijriError = computed(() => hijri.error.value)

const chevronPrev = computed(() =>
  mode.value === 'hijri' && hijriLocale.value === 'ar' ? 'mdi:chevron-right' : 'mdi:chevron-left',
)
const chevronNext = computed(() =>
  mode.value === 'hijri' && hijriLocale.value === 'ar' ? 'mdi:chevron-left' : 'mdi:chevron-right',
)

const isRtl = computed(
  () => mode.value === 'hijri' && hijriLocale.value === 'ar',
)

function activePrev() {
  if (mode.value === 'hijri') void hijri.prevMonth()
  else gregorian.prevMonth()
}

function activeNext() {
  if (mode.value === 'hijri') void hijri.nextMonth()
  else gregorian.nextMonth()
}

/** Touch/pen month swipe — mouse keeps using arrows */
const SWIPE_THRESHOLD_PX = 48
const AXIS_LOCK_PX = 10

let swipeTracking = false
let swipeStartX = 0
let swipeStartY = 0
let swipeAxis: 'h' | 'v' | null = null
let swipePointerId: number | null = null

function isTouchLike(event: PointerEvent) {
  return event.pointerType === 'touch' || event.pointerType === 'pen'
}

function unbindSwipeWindow() {
  window.removeEventListener('pointermove', onSwipePointerMove)
  window.removeEventListener('pointerup', onSwipePointerUp)
  window.removeEventListener('pointercancel', onSwipePointerUp)
}

function resetSwipe() {
  swipeTracking = false
  swipeAxis = null
  swipePointerId = null
  unbindSwipeWindow()
}

function onSwipePointerDown(event: PointerEvent) {
  if (event.button !== 0) return
  if (!isTouchLike(event)) return
  if (hijriLoading.value) return

  const target = event.target
  if (target instanceof Element && target.closest('button, a')) return

  resetSwipe()
  swipeTracking = true
  swipeAxis = null
  swipeStartX = event.clientX
  swipeStartY = event.clientY
  swipePointerId = event.pointerId

  window.addEventListener('pointermove', onSwipePointerMove, { passive: false })
  window.addEventListener('pointerup', onSwipePointerUp)
  window.addEventListener('pointercancel', onSwipePointerUp)
}

function onSwipePointerMove(event: PointerEvent) {
  if (!swipeTracking) return
  if (swipePointerId != null && event.pointerId !== swipePointerId) return

  const dx = event.clientX - swipeStartX
  const dy = event.clientY - swipeStartY

  if (!swipeAxis) {
    if (Math.abs(dx) < AXIS_LOCK_PX && Math.abs(dy) < AXIS_LOCK_PX) return
    swipeAxis = Math.abs(dx) >= Math.abs(dy) ? 'h' : 'v'
  }

  if (swipeAxis === 'h' && event.cancelable) event.preventDefault()
}

function onSwipePointerUp(event: PointerEvent) {
  if (!swipeTracking) return
  if (swipePointerId != null && event.pointerId !== swipePointerId) return

  const dx = event.clientX - swipeStartX
  const dy = event.clientY - swipeStartY
  const wasHorizontal = swipeAxis === 'h' || Math.abs(dx) >= Math.abs(dy) * 1.15

  resetSwipe()

  if (!wasHorizontal || Math.abs(dx) < SWIPE_THRESHOLD_PX) return

  // LTR: swipe left → next, right → prev. RTL: mirrored.
  if (dx < 0) {
    if (isRtl.value) activePrev()
    else activeNext()
  }
  else if (isRtl.value) {
    activeNext()
  }
  else {
    activePrev()
  }
}

watch(mode, (next) => {
  if (next === 'gregorian') gregorian.goToToday()
  if (next === 'hijri') void hijri.goToToday()
})

function onKeydown(event: KeyboardEvent) {
  if (!mode.value) return
  if (event.key === 'Escape') close()
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  resetSwipe()
  window.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.board-cal {
  position: fixed;
  inset: 0;
  z-index: 88;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(0.75rem, 2vw, 1.5rem);
  cursor: pointer;
  background: rgba(var(--color-bg-rgb), 0.38);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.board-cal-panel {
  position: relative;
  width: min(96vw, 860px);
  height: min(90vh, 820px);
  max-height: 90vh;
  padding: clamp(1.1rem, 2.2vw, 1.75rem);
  border-radius: 26px;
  cursor: default;
  display: flex;
  flex-direction: column;
  background: rgba(var(--color-surface-rgb), 0.62);
  border: 1px solid rgba(var(--color-muted-rgb), 0.3);
  box-shadow:
    0 28px 70px rgba(0, 0, 0, 0.34),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(28px) saturate(1.3);
  -webkit-backdrop-filter: blur(28px) saturate(1.3);
}

.board-cal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
  margin-bottom: clamp(0.85rem, 2vh, 1.25rem);
  flex: none;
}

.board-cal-title {
  flex: 1;
  min-width: 0;
  text-align: center;
  font-size: clamp(1.15rem, 2.6vw, 1.55rem);
  font-weight: 700;
  letter-spacing: 0.01em;
  color: var(--color-text);
}

.board-cal-nav {
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 999px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-muted);
  background: rgba(var(--color-muted-rgb), 0.12);
  cursor: pointer;
}

.board-cal-nav:hover,
.board-cal-nav:focus-visible {
  color: var(--color-text);
  background: rgba(var(--color-muted-rgb), 0.2);
  outline: none;
}

.board-cal-status {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 1rem;
  color: var(--color-muted);
}

.board-cal-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  touch-action: pan-y;
}

.board-cal-grid {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: minmax(0, 1fr);
  gap: clamp(0.35rem, 1vw, 0.55rem);
  text-align: center;
  align-content: stretch;
}

.board-cal-dow {
  font-size: clamp(0.7rem, 1.5vw, 0.85rem);
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem 0;
}

.board-cal-day {
  position: relative;
  isolation: isolate;
  font-size: clamp(1rem, 2.5vw, 1.35rem);
  line-height: 1;
  width: 100%;
  height: 100%;
  min-height: 2.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
  font-weight: 550;
  background: transparent;
}

.board-cal-day-num {
  position: relative;
  z-index: 1;
}

.board-cal-day[data-muted='true'] {
  color: rgba(var(--color-muted-rgb), 0.4);
}

/* Perfect circle behind the numeral — never covers the date */
.board-cal-day[data-today='true'] {
  color: var(--color-bg);
  font-weight: 700;
  background: transparent;
}

.board-cal-day[data-today='true']::before {
  content: '';
  position: absolute;
  z-index: 0;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: clamp(2.15rem, 7.5vmin, 2.9rem);
  height: clamp(2.15rem, 7.5vmin, 2.9rem);
  border-radius: 50%;
  background: var(--color-primary);
  pointer-events: none;
}

.board-cal-footnote {
  flex: none;
  margin-top: clamp(0.75rem, 1.8vh, 1.1rem);
  text-align: center;
  font-size: clamp(0.7rem, 1.4vw, 0.8rem);
  font-weight: 650;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--color-muted);
  opacity: 0.85;
}

.board-cal-enter-active,
.board-cal-leave-active {
  transition: opacity 0.22s ease;
}

.board-cal-enter-active .board-cal-panel,
.board-cal-leave-active .board-cal-panel {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.board-cal-enter-from,
.board-cal-leave-to {
  opacity: 0;
}

.board-cal-enter-from .board-cal-panel,
.board-cal-leave-to .board-cal-panel {
  opacity: 0;
  transform: translateY(10px) scale(0.97);
}

@media (prefers-reduced-motion: reduce) {
  .board-cal-enter-active,
  .board-cal-leave-active,
  .board-cal-enter-active .board-cal-panel,
  .board-cal-leave-active .board-cal-panel {
    transition: none;
  }
}

@media (max-width: 480px) {
  .board-cal-panel {
    width: min(100%, 96vw);
    height: min(88vh, 720px);
    border-radius: 20px;
  }

  .board-cal-nav {
    width: 36px;
    height: 36px;
  }

  .board-cal-day {
    min-height: 2.35rem;
  }
}
</style>
