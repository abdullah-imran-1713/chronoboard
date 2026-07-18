<template>
  <BaseCard title="Weather" icon="mdi:weather-partly-cloudy">
    <div v-if="loading && !weather" class="text-sm font-ui" :style="{ color: 'var(--color-muted)' }">
      Loading weather...
    </div>

    <div
      v-else-if="error && !weather"
      class="flex items-start justify-between gap-2"
    >
      <p class="text-sm font-ui m-0" :style="{ color: 'var(--color-muted)' }">
        {{ error }}
      </p>
      <CbHint text="Retry weather" :blocked="refreshing">
        <button
          type="button"
          class="weather-refresh weather-refresh--lg cb-icobtn"
          :disabled="refreshing"
          aria-label="Retry weather"
          @click.stop="onRefresh"
        >
          <Icon
            name="mdi:refresh"
            size="15"
            :class="{ 'weather-refresh-spin': refreshing }"
          />
        </button>
      </CbHint>
    </div>

    <div
      v-else-if="weather"
      class="weather-pane"
      data-widget-swipe
      @pointerdown="onPanePointerDown"
      @pointermove="onSwipePointerMove"
      @pointerup="onSwipePointerUp"
      @pointercancel="onSwipePointerUp"
      @mouseenter="onPaneEnter"
      @mouseleave="onPaneLeave"
    >
      <Transition :name="slideName" mode="out-in">
        <div
          :key="dayIndex"
          class="weather-main"
        >
          <div class="weather-copy min-w-0">
            <p class="text-2xl font-bold font-ui m-0" :style="{ color: 'var(--color-text)' }">
              {{ display.tempLabel }}
            </p>
            <p class="text-xs font-ui m-0" :style="{ color: 'var(--color-muted)' }">
              {{ display.description }}
            </p>
            <p
              v-if="display.rangeLabel"
              class="weather-range m-0"
              :style="{ color: 'var(--color-muted)' }"
            >
              {{ display.rangeLabel }}
            </p>

            <div v-if="dayIndex === 0" class="weather-city-row mt-1 min-w-0">
              <span
                class="weather-city-name truncate"
                :style="{ color: 'var(--color-secondary)' }"
              >
                {{ weather.city }}
              </span>
              <CbHint
                text="Refresh weather & location"
                :blocked="loading || refreshing"
              >
                <button
                  type="button"
                  class="weather-refresh cb-icobtn"
                  :disabled="loading || refreshing"
                  aria-label="Refresh weather"
                  @click.stop="onRefresh"
                >
                  <Icon
                    name="mdi:refresh"
                    size="13"
                    :class="{ 'weather-refresh-spin': refreshing }"
                  />
                </button>
              </CbHint>
            </div>

            <p
              v-if="dayIndex === 0 && updatedLabel"
              class="weather-updated m-0"
              :style="{ color: 'var(--color-muted)' }"
            >
              {{ updatedLabel }}
            </p>
            <p
              v-else-if="dayIndex === 1"
              class="weather-updated weather-updated--forecast m-0"
              :style="{ color: 'var(--color-muted)' }"
            >
              Expected forecast
            </p>
          </div>

          <Icon
            :name="display.icon"
            size="52"
            class="flex-none weather-condition-icon"
            :style="{ color: 'var(--color-primary)' }"
            :aria-label="display.description"
          />
        </div>
      </Transition>

      <div
        v-if="hasTomorrow"
        class="weather-pager"
        :data-reveal="pagerRevealed ? 'true' : 'false'"
        role="group"
        aria-label="Weather day"
      >
        <div class="weather-pager-side">
          <button
            v-if="canGoToday"
            type="button"
            class="weather-day-nav"
            aria-label="Show today’s weather"
            @click.stop="goToday"
          >
            <Icon name="mdi:chevron-left" size="16" />
          </button>
        </div>
        <span class="weather-pager-label tabular-nums">
          {{ dayIndex === 0 ? 'Today' : 'Tomorrow' }}
        </span>
        <div class="weather-pager-side">
          <button
            v-if="canGoTomorrow"
            type="button"
            class="weather-day-nav"
            aria-label="Show tomorrow’s weather"
            @click.stop="goTomorrow"
          >
            <Icon name="mdi:chevron-right" size="16" />
          </button>
        </div>
      </div>

      <p
        v-if="error"
        class="text-[11px] font-ui m-0"
        :style="{ color: 'var(--color-muted)' }"
      >
        {{ error }}
      </p>
    </div>
  </BaseCard>

  <Teleport to="body">
    <Transition name="board-toast">
      <div
        v-if="toastMessage"
        class="board-toast fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 px-3.5 py-2 rounded-lg text-[12px] font-ui pointer-events-none"
        :style="{
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text)',
          border: '1px solid rgba(var(--color-muted-rgb), 0.25)',
          boxShadow: '0 8px 28px rgba(0,0,0,.35)',
        }"
        role="status"
      >
        {{ toastMessage }}
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { resolveWeatherVisual } from '../../../utils/weatherVisual'

const { weather, loading, refreshing, error, lastFetchedAt, init, refresh } = useWeather()

const dayIndex = ref(0)
const slideDir = ref<'left' | 'right'>('left')
const pagerRevealed = ref(false)
const toastMessage = ref('')
let toastTimer: ReturnType<typeof setTimeout> | null = null
let pagerHideTimer: ReturnType<typeof setTimeout> | null = null

const { isCoarse } = useCoarsePointer()

const nowTick = ref(Date.now())
let tickTimer: ReturnType<typeof setInterval> | null = null

const SWIPE_THRESHOLD_PX = 42
const PAGER_REVEAL_MS = 2800
let swipeStartX = 0
let swipeStartY = 0
let swipeActive = false
let swipeLocked: 'h' | 'v' | null = null
let tapCandidate = false

const hasTomorrow = computed(() => Boolean(weather.value?.tomorrow))
const canGoTomorrow = computed(() => dayIndex.value === 0 && hasTomorrow.value)
const canGoToday = computed(() => dayIndex.value === 1)

const slideName = computed(() =>
  slideDir.value === 'left' ? 'weather-slide-left' : 'weather-slide-right',
)

const display = computed(() => {
  const w = weather.value
  if (!w) {
    return {
      tempLabel: '',
      description: '',
      icon: 'mdi:weather-partly-cloudy',
      rangeLabel: '',
    }
  }

  if (dayIndex.value === 1 && w.tomorrow) {
    const visual = resolveWeatherVisual({
      weatherCode: w.tomorrow.weatherCode,
      isDay: true,
    })
    return {
      tempLabel: `${w.tomorrow.tempMax}°C`,
      description: visual.label,
      icon: visual.icon,
      rangeLabel: `Low ${w.tomorrow.tempMin}°`,
    }
  }

  return {
    tempLabel: `${w.temp}°C`,
    description: w.description,
    icon: w.icon,
    rangeLabel: '',
  }
})

const updatedLabel = computed(() => {
  if (!lastFetchedAt.value) return ''
  void nowTick.value
  return formatUpdatedAgo(lastFetchedAt.value)
})

function formatUpdatedAgo(at: number): string {
  const sec = Math.max(0, Math.floor((Date.now() - at) / 1000))
  if (sec < 15) return 'Updated just now'
  if (sec < 60) return `Updated ${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `Updated ${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `Updated ${hr}h ago`
  return `Updated ${Math.floor(hr / 24)}d ago`
}

function clearPagerHide() {
  if (!pagerHideTimer) return
  clearTimeout(pagerHideTimer)
  pagerHideTimer = null
}

function revealPager(temporary: boolean) {
  pagerRevealed.value = true
  clearPagerHide()
  if (!temporary) return
  pagerHideTimer = setTimeout(() => {
    pagerRevealed.value = false
    pagerHideTimer = null
  }, PAGER_REVEAL_MS)
}

function onPaneEnter() {
  if (isCoarse.value) return
  revealPager(false)
}

function onPaneLeave() {
  if (isCoarse.value) return
  clearPagerHide()
  pagerRevealed.value = false
}

function goTomorrow() {
  if (!canGoTomorrow.value) return
  slideDir.value = 'left'
  dayIndex.value = 1
  if (isCoarse.value) revealPager(true)
}

function goToday() {
  if (!canGoToday.value) return
  slideDir.value = 'right'
  dayIndex.value = 0
  if (isCoarse.value) revealPager(true)
}

function onPanePointerDown(event: PointerEvent) {
  if (event.button !== 0) return
  if (!hasTomorrow.value) return

  const target = event.target
  if (target instanceof Element && target.closest('button, a')) {
    // Nav / refresh taps keep pager visible on touch
    if (isCoarse.value) revealPager(true)
    return
  }

  swipeActive = true
  swipeLocked = null
  tapCandidate = true
  swipeStartX = event.clientX
  swipeStartY = event.clientY
}

function onSwipePointerMove(event: PointerEvent) {
  if (!swipeActive) return
  const dx = event.clientX - swipeStartX
  const dy = event.clientY - swipeStartY
  if (Math.hypot(dx, dy) >= 10) {
    tapCandidate = false
    if (!swipeLocked) {
      swipeLocked = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v'
    }
  }
}

function onSwipePointerUp(event: PointerEvent) {
  if (!swipeActive) return
  const dx = event.clientX - swipeStartX
  const wasHorizontal = swipeLocked === 'h'
  const wasTap = tapCandidate && Math.hypot(dx, event.clientY - swipeStartY) < 10
  swipeActive = false
  swipeLocked = null
  tapCandidate = false

  if (wasTap && isCoarse.value) {
    revealPager(true)
    return
  }

  if (!wasHorizontal || Math.abs(dx) < SWIPE_THRESHOLD_PX) return

  if (isCoarse.value) revealPager(true)
  if (dx < 0) goTomorrow()
  else goToday()
}

watch(
  () => weather.value?.city,
  () => {
    dayIndex.value = 0
  },
)

onMounted(() => {
  void init()
  tickTimer = setInterval(() => {
    nowTick.value = Date.now()
  }, 15_000)
})

onUnmounted(() => {
  if (toastTimer) clearTimeout(toastTimer)
  if (tickTimer) clearInterval(tickTimer)
  clearPagerHide()
})

function showToast(message: string) {
  toastMessage.value = message
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
    toastTimer = null
  }, 2200)
}

async function onRefresh() {
  const result = await refresh()
  nowTick.value = Date.now()
  dayIndex.value = 0
  if (result.ok) {
    showToast(`Weather updated · ${result.city}`)
  }
  else {
    showToast(result.message)
  }
}
</script>

<style scoped>
.weather-pane {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  touch-action: pan-y;
}

.weather-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  min-width: 0;
}

.weather-copy {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.weather-pager {
  display: grid;
  grid-template-columns: 22px minmax(4.75rem, auto) 22px;
  align-items: center;
  justify-content: center;
  column-gap: 0.35rem;
  min-height: 22px;
}

.weather-pager-side {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
}

.weather-pager-label {
  min-width: 4.75rem;
  text-align: center;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-muted);
  line-height: 1;
}

.weather-day-nav {
  flex: none;
  width: 22px;
  height: 22px;
  padding: 0;
  border: none;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-muted);
  background: transparent;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.18s ease, color 0.15s ease, background 0.15s ease;
}

.weather-pager[data-reveal='true'] .weather-day-nav {
  opacity: 0.85;
  pointer-events: auto;
}

.weather-pager[data-reveal='true'] .weather-day-nav:hover,
.weather-pager[data-reveal='true'] .weather-day-nav:focus-visible {
  opacity: 1;
  color: var(--color-text);
  background: rgba(var(--color-muted-rgb), 0.14);
  outline: none;
}

@media (hover: none), (pointer: coarse) {
  .weather-pager[data-reveal='true'] .weather-day-nav {
    opacity: 0.9;
  }
}

.weather-city-row {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  max-width: 100%;
  line-height: 1;
}

.weather-city-name {
  font-size: 12px;
  font-family: inherit;
  line-height: 1;
}

.weather-range {
  margin-top: 2px;
  font-size: 11px;
  font-family: inherit;
  line-height: 1.2;
  opacity: 0.85;
}

.weather-updated {
  margin-top: 4px;
  font-size: 10px;
  font-family: inherit;
  letter-spacing: 0.01em;
  line-height: 1.2;
  opacity: 0.75;
}

.weather-updated--forecast {
  margin-top: 6px;
}

.weather-refresh {
  flex: none;
  width: 14px;
  height: 14px;
  padding: 0;
  margin: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--color-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  line-height: 0;
}

.weather-refresh:disabled {
  opacity: 0.4;
  cursor: default;
}

.weather-refresh:hover:not(:disabled) {
  color: var(--color-text);
}

.weather-refresh :deep(svg) {
  display: block;
  width: 13px;
  height: 13px;
}

.weather-refresh--lg {
  width: 24px;
  height: 24px;
}

.weather-refresh--lg :deep(svg) {
  width: 15px;
  height: 15px;
}

.weather-city-row :deep(.cb-hint) {
  flex: none;
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
}

.weather-refresh-spin {
  animation: weather-spin 0.8s linear infinite;
}

@keyframes weather-spin {
  to { transform: rotate(360deg); }
}

.weather-slide-left-enter-active,
.weather-slide-left-leave-active,
.weather-slide-right-enter-active,
.weather-slide-right-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.weather-slide-left-enter-from {
  opacity: 0;
  transform: translateX(12px);
}

.weather-slide-left-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}

.weather-slide-right-enter-from {
  opacity: 0;
  transform: translateX(-12px);
}

.weather-slide-right-leave-to {
  opacity: 0;
  transform: translateX(12px);
}

@media (prefers-reduced-motion: reduce) {
  .weather-refresh-spin,
  .weather-slide-left-enter-active,
  .weather-slide-left-leave-active,
  .weather-slide-right-enter-active,
  .weather-slide-right-leave-active {
    animation: none;
    transition: none;
  }
}
</style>

<style>
.board-toast-enter-active,
.board-toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.board-toast-enter-from,
.board-toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px);
}
</style>
