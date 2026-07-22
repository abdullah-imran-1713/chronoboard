<template>
  <BaseCard title="Countdown" icon="mdi:clock-end">
    <div class="space-y-3">
      <div>
        <label
          class="block text-xs font-ui mb-1"
          :style="{ color: 'var(--color-muted)' }"
        >
          Target date & time
        </label>

        <div class="countdown-field">
          <input
            ref="datetimeRef"
            v-model="targetInput"
            type="datetime-local"
            class="countdown-datetime w-full px-3 py-2 pr-10 rounded-lg text-sm font-ui border-none outline-none"
            :style="datetimeStyle"
            @change="applyTarget"
          >
          <CbHint text="Pick date & time">
            <button
              type="button"
              class="countdown-cal-btn cb-icobtn"
              aria-label="Pick date & time"
              @click.stop="openPicker"
            >
              <Icon
                name="mdi:calendar-month-outline"
                size="18"
                :style="{ color: 'var(--color-text)' }"
              />
            </button>
          </CbHint>
        </div>
      </div>

      <div
        v-if="remaining"
        class="countdown-status text-center space-y-1"
        :class="{ 'countdown-status--celebrate': celebrating }"
      >
        <div
          v-if="remaining.finished"
          class="countdown-finish"
          :class="{ 'countdown-finish--celebrate': celebrating }"
        >
          <span class="countdown-finish-ring" aria-hidden="true" />
          <span class="countdown-finish-flash" aria-hidden="true" />
          <span
            v-for="dot in finishDots"
            :key="dot.id"
            class="countdown-finish-dot"
            :style="dot.style"
            aria-hidden="true"
          />
          <div class="countdown-finish-copy">
            <Icon
              name="mdi:check-circle"
              size="22"
              class="countdown-finish-check"
              :style="{ color: 'var(--color-primary)' }"
            />
            <p
              class="countdown-finish-label text-xl font-bold font-ui m-0"
              :style="{ color: 'var(--color-primary)' }"
            >
              Finished!
            </p>
          </div>
        </div>
        <template v-else>
          <p
            class="text-2xl font-clock tabular-nums"
            :style="{ color: 'var(--color-primary)' }"
          >
            {{ remainingLabel }}
          </p>
          <p class="text-xs font-ui" :style="{ color: 'var(--color-muted)' }">
            remaining
          </p>
        </template>
      </div>

      <p
        v-else
        class="text-sm font-ui text-center"
        :style="{ color: 'var(--color-muted)' }"
      >
        Set a target date above
      </p>

      <div v-if="targetDate" class="flex justify-center">
        <button
          type="button"
          class="px-4 py-2 rounded-lg text-sm font-ui"
          :style="mutedButtonStyle"
          @click="clearTarget"
        >
          Clear
        </button>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
const FINISH_DOT_COUNT = 16
const CELEBRATE_MS = 1600

const themeStore = useThemeStore()
const { showCountdownComplete } = useFocusAlert()
const { remaining, remainingLabel, targetDate, setTarget, clear } = useCountdown()
const targetInput = ref('')
const datetimeRef = ref<HTMLInputElement | null>(null)

const celebrating = ref(false)
const celebratedForTarget = ref(false)
let celebrateTimer: ReturnType<typeof setTimeout> | null = null

const mutedButtonStyle = {
  backgroundColor: 'rgba(var(--color-muted-rgb), 0.3)',
  color: 'var(--color-text)',
}

const datetimeStyle = computed(() => ({
  backgroundColor: 'var(--color-bg)',
  color: 'var(--color-text)',
  colorScheme: themeStore.resolvedScheme,
}))

const finishDots = computed(() => {
  return Array.from({ length: FINISH_DOT_COUNT }, (_, i) => {
    const angle = (360 / FINISH_DOT_COUNT) * i - 90
    const dist = 42 + (i % 4) * 10
    const rad = (angle * Math.PI) / 180
    const tx = Math.cos(rad) * dist
    const ty = Math.sin(rad) * dist
    const delay = (i % 6) * 35
    const size = 5 + (i % 4)
    return {
      id: i,
      style: {
        '--tx': `${tx.toFixed(1)}px`,
        '--ty': `${ty.toFixed(1)}px`,
        '--delay': `${delay}ms`,
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: i % 3 === 0
          ? 'var(--color-primary)'
          : i % 3 === 1
            ? 'rgba(var(--color-primary-rgb), 0.75)'
            : 'var(--color-text)',
      } as Record<string, string>,
    }
  })
})

function prefersReducedMotion(): boolean {
  if (!import.meta.client) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function clearCelebrateTimer() {
  if (!celebrateTimer) return
  clearTimeout(celebrateTimer)
  celebrateTimer = null
}

function triggerCelebrate() {
  if (celebratedForTarget.value) return
  celebratedForTarget.value = true

  // Board-level cue (same overlay system as Focus) — visible across the screen
  showCountdownComplete()

  if (prefersReducedMotion()) return

  clearCelebrateTimer()
  celebrating.value = false
  requestAnimationFrame(() => {
    celebrating.value = true
    celebrateTimer = setTimeout(() => {
      celebrating.value = false
      celebrateTimer = null
    }, CELEBRATE_MS)
  })
}

function resetCelebrate() {
  clearCelebrateTimer()
  celebrating.value = false
  celebratedForTarget.value = false
}

watch(
  () => remaining.value?.finished === true,
  (finished, wasFinished) => {
    if (finished && !wasFinished) triggerCelebrate()
  },
)

function openPicker() {
  const el = datetimeRef.value
  if (!el) return
  try {
    if (typeof el.showPicker === 'function') {
      el.showPicker()
      return
    }
  }
  catch {
    // Some browsers throw if showPicker is blocked — fall through to focus/click
  }
  el.focus()
  el.click()
}

function applyTarget() {
  if (!targetInput.value) return
  resetCelebrate()
  setTarget(new Date(targetInput.value))
  nextTick(() => {
    if (remaining.value?.finished) triggerCelebrate()
  })
}

function clearTarget() {
  targetInput.value = ''
  resetCelebrate()
  clear()
}

onUnmounted(() => {
  clearCelebrateTimer()
})
</script>

<style scoped>
.countdown-field {
  position: relative;
}

.countdown-datetime {
  color-scheme: inherit;
}

.countdown-datetime::-webkit-calendar-picker-indicator {
  opacity: 0;
  width: 2.25rem;
  height: 100%;
  cursor: pointer;
}

.countdown-cal-btn {
  position: absolute;
  top: 50%;
  right: 6px;
  transform: translateY(-50%);
  z-index: 2;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 8px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  cursor: pointer;
}

.countdown-cal-btn:hover,
.countdown-cal-btn:focus-visible {
  background: rgba(var(--color-muted-rgb), 0.16);
  outline: none;
}

.countdown-status {
  position: relative;
  min-height: 3.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  overflow: hidden;
}

.countdown-status--celebrate {
  animation: countdown-status-glow 1.35s ease-out both;
}

.countdown-finish {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3rem;
  min-width: 8.5rem;
  padding: 0.55rem 1rem;
}

.countdown-finish-copy {
  position: relative;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.countdown-finish-label,
.countdown-finish-check {
  position: relative;
  z-index: 2;
}

.countdown-finish-ring,
.countdown-finish-flash,
.countdown-finish-dot {
  position: absolute;
  pointer-events: none;
}

.countdown-finish-ring {
  left: 50%;
  top: 50%;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border: 2px solid rgba(var(--color-primary-rgb), 0.85);
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.4);
  z-index: 0;
}

.countdown-finish-flash {
  inset: 0;
  border-radius: 12px;
  background: radial-gradient(
    circle at center,
    rgba(var(--color-primary-rgb), 0.32) 0%,
    rgba(var(--color-primary-rgb), 0.08) 45%,
    transparent 72%
  );
  opacity: 0;
  z-index: 0;
}

.countdown-finish-dot {
  left: 50%;
  top: 50%;
  border-radius: 999px;
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.4);
  z-index: 1;
}

.countdown-finish--celebrate .countdown-finish-copy {
  animation: countdown-finish-pulse 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.countdown-finish--celebrate .countdown-finish-ring {
  animation: countdown-finish-ring 1.15s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.countdown-finish--celebrate .countdown-finish-flash {
  animation: countdown-finish-flash 1.2s ease-out both;
}

.countdown-finish--celebrate .countdown-finish-dot {
  animation: countdown-finish-burst 1.2s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: var(--delay, 0ms);
}

@keyframes countdown-status-glow {
  0% {
    background: rgba(var(--color-primary-rgb), 0);
    box-shadow: inset 0 0 0 0 rgba(var(--color-primary-rgb), 0);
  }
  25% {
    background: rgba(var(--color-primary-rgb), 0.14);
    box-shadow: inset 0 0 0 1px rgba(var(--color-primary-rgb), 0.35);
  }
  100% {
    background: rgba(var(--color-primary-rgb), 0);
    box-shadow: inset 0 0 0 0 rgba(var(--color-primary-rgb), 0);
  }
}

@keyframes countdown-finish-pulse {
  0% {
    transform: scale(0.82);
    opacity: 0.4;
  }
  40% {
    transform: scale(1.12);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes countdown-finish-ring {
  0% {
    opacity: 0.95;
    transform: translate(-50%, -50%) scale(0.35);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(4.2);
  }
}

@keyframes countdown-finish-flash {
  0% {
    opacity: 0;
  }
  18% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes countdown-finish-burst {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.35);
  }
  14% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate(
      calc(-50% + var(--tx, 0px)),
      calc(-50% + var(--ty, 0px))
    ) scale(0.2);
  }
}

@media (prefers-reduced-motion: reduce) {
  .countdown-status--celebrate,
  .countdown-finish--celebrate .countdown-finish-copy,
  .countdown-finish--celebrate .countdown-finish-ring,
  .countdown-finish--celebrate .countdown-finish-flash,
  .countdown-finish--celebrate .countdown-finish-dot {
    animation: none;
  }
}
</style>
