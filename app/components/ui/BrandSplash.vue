<template>
  <Teleport to="body">
    <Transition name="brand-splash" @after-leave="onAfterLeave">
      <div
        v-if="visible"
        class="brand-splash"
        role="dialog"
        aria-modal="true"
        aria-label="ChronoBoard"
        @click="finish"
      >
        <div class="brand-splash-stage" :data-phase="phase">
          <!--
            Outer: radius + overflow + opacity only.
            Inner: scale motion. Separating these avoids mobile WebKit
            clip bugs that looked like a top→bottom wipe.
          -->
          <div class="brand-splash-mark" aria-hidden="true">
            <div class="brand-splash-mark-motion">
              <BrandMark decoding="sync" fetchpriority="high" />
            </div>
          </div>
          <p class="brand-splash-name">
            <BrandWordmark />
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * First-visit brand moment — calm presence only:
 * soft scale + fade (mark), then wordmark. No bounce / spin / glow.
 *
 * Board stays gated (html.brand-splash-pending) until this finishes,
 * so the clock never flashes before the logo.
 */
const MARK_SRC = '/icons/chronoboard-mark-512.png'
const HOLD_MS = 1200
const FADE_MS = 520
/** Hard unlock if something stalls — never leave the board hidden forever */
const SAFETY_UNLOCK_MS = 4500

const { unlockBoard, hasSeenSplash, markSplashSeen } = useBrandSplashGate()

const visible = ref(false)
const phase = ref<'enter' | 'hold' | 'exit'>('enter')

let holdTimer: ReturnType<typeof setTimeout> | null = null
let exitTimer: ReturnType<typeof setTimeout> | null = null
let safetyTimer: ReturnType<typeof setTimeout> | null = null
let unlocked = false

function clearTimers() {
  if (holdTimer) {
    clearTimeout(holdTimer)
    holdTimer = null
  }
  if (exitTimer) {
    clearTimeout(exitTimer)
    exitTimer = null
  }
  if (safetyTimer) {
    clearTimeout(safetyTimer)
    safetyTimer = null
  }
}

function releaseGate() {
  if (unlocked) return
  unlocked = true
  unlockBoard()
}

function onAfterLeave() {
  releaseGate()
}

function finish() {
  if (!visible.value || phase.value === 'exit') return
  clearTimers()
  phase.value = 'exit'
  markSplashSeen()
  exitTimer = setTimeout(() => {
    visible.value = false
    exitTimer = null
    // after-leave also unlocks; call here too in case transition is skipped
    releaseGate()
  }, FADE_MS)
}

function prefersReducedMotion(): boolean {
  if (!import.meta.client) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Decode mark fully before animating — avoids partial paint on mobile. */
async function preloadMark(): Promise<void> {
  if (!import.meta.client) return
  try {
    const img = new Image()
    img.src = MARK_SRC
    if (typeof img.decode === 'function') {
      await img.decode()
      return
    }
    await new Promise<void>((resolve) => {
      img.onload = () => resolve()
      img.onerror = () => resolve()
    })
  }
  catch {
    // Still show splash — better a late image than a stuck gate
  }
}

/** Two frames so the enter state is painted before hold (mobile-safe). */
function afterPaint(fn: () => void) {
  requestAnimationFrame(() => {
    requestAnimationFrame(fn)
  })
}

async function startSplash() {
  visible.value = true
  phase.value = 'enter'

  safetyTimer = setTimeout(() => {
    safetyTimer = null
    if (unlocked) return
    if (holdTimer) {
      clearTimeout(holdTimer)
      holdTimer = null
    }
    if (exitTimer) {
      clearTimeout(exitTimer)
      exitTimer = null
    }
    markSplashSeen()
    visible.value = false
    releaseGate()
  }, SAFETY_UNLOCK_MS)

  await preloadMark()

  if (prefersReducedMotion()) {
    phase.value = 'hold'
    holdTimer = setTimeout(finish, 650)
    return
  }

  afterPaint(() => {
    if (!visible.value || phase.value === 'exit') return
    phase.value = 'hold'
  })
  holdTimer = setTimeout(finish, HOLD_MS + 380)
}

onMounted(() => {
  if (hasSeenSplash()) {
    releaseGate()
    return
  }
  void startSplash()
})

onUnmounted(() => {
  clearTimers()
  releaseGate()
})
</script>

<style scoped>
.brand-splash {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg, #0a0a0a);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.brand-splash-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.05rem;
  pointer-events: none;
}

.brand-splash-mark {
  width: min(28vw, 128px);
  height: min(28vw, 128px);
  border-radius: 28%;
  overflow: hidden;
  box-shadow: 0 14px 44px rgba(0, 0, 0, 0.38);
  opacity: 0;
  transition: opacity 0.55s ease;
}

.brand-splash-mark-motion {
  width: 100%;
  height: 100%;
  transform: scale(0.94);
  transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}

.brand-splash-name {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--color-text, #f5f5f5);
  opacity: 0;
  transform: translateY(8px);
  transition:
    opacity 0.5s ease 0.18s,
    transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.18s;
}

.brand-splash-stage[data-phase='hold'] .brand-splash-mark,
.brand-splash-stage[data-phase='hold'] .brand-splash-name {
  opacity: 1;
}

.brand-splash-stage[data-phase='hold'] .brand-splash-mark-motion,
.brand-splash-stage[data-phase='hold'] .brand-splash-name {
  transform: none;
}

/* Exit: settle into the board — soft fade + tiny scale-down (not bounce out) */
.brand-splash-stage[data-phase='exit'] .brand-splash-mark {
  opacity: 0;
  transition-duration: 0.5s;
  transition-timing-function: ease;
}

.brand-splash-stage[data-phase='exit'] .brand-splash-mark-motion {
  transform: scale(0.97);
  transition-duration: 0.5s;
  transition-timing-function: ease;
}

.brand-splash-stage[data-phase='exit'] .brand-splash-name {
  opacity: 0;
  transform: translateY(-2px);
  transition-delay: 0s;
  transition-duration: 0.4s, 0.4s;
}

.brand-splash-enter-active,
.brand-splash-leave-active {
  transition: opacity 0.45s ease;
}

.brand-splash-enter-from,
.brand-splash-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .brand-splash-mark,
  .brand-splash-name {
    transition: opacity 0.22s ease;
  }

  .brand-splash-mark-motion,
  .brand-splash-name {
    transform: none !important;
    transition: none;
  }

  .brand-splash-stage[data-phase='hold'] .brand-splash-mark,
  .brand-splash-stage[data-phase='hold'] .brand-splash-name {
    opacity: 1;
  }
}
</style>
