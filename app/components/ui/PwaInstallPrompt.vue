<template>
  <Teleport to="body">
    <Transition name="pwa-install">
      <div
        v-if="visible"
        class="pwa-install fixed inset-x-0 z-[60] flex justify-center px-4 pointer-events-none"
        role="dialog"
        aria-labelledby="pwa-install-title"
        aria-describedby="pwa-install-desc"
        data-pwa-install-prompt
      >
        <div
          class="pwa-install-card pointer-events-auto w-full max-w-sm rounded-2xl p-4 font-ui"
          :style="{
            backgroundColor: 'rgba(var(--color-surface-rgb), 0.94)',
            color: 'var(--color-text)',
            border: '1px solid rgba(var(--color-muted-rgb), 0.28)',
            boxShadow: '0 16px 48px rgba(0,0,0,.4)',
            backdropFilter: 'blur(16px)',
          }"
        >
          <div class="flex items-start gap-3">
            <div
              class="pwa-install-icon flex-none w-9 h-9 rounded-xl overflow-hidden"
              aria-hidden="true"
            >
              <img
                src="/icons/icon-192.png"
                alt=""
                width="36"
                height="36"
                class="w-full h-full object-cover"
                decoding="async"
              >
            </div>
            <div class="flex-1 min-w-0 flex flex-col gap-1.5">
              <p id="pwa-install-title" class="text-[13px] font-semibold m-0 leading-snug">
                Add to Home Screen
              </p>
              <p
                id="pwa-install-desc"
                class="text-[12px] m-0 leading-relaxed"
                :style="{ color: 'var(--color-muted)' }"
              >
                Tap Share, then Add to Home Screen for a full-screen clock.
              </p>

              <button
                type="button"
                class="pwa-install-btn self-start mt-1 border-none cursor-pointer rounded-lg px-3 py-1.5 text-[12px] font-semibold"
                :style="{
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-bg)',
                }"
                @click="dismiss"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * iOS has no beforeinstallprompt — show a one-time tip.
 * Chromium uses the browser’s native install control once the manifest + SW are valid.
 */
const IOS_TIP_KEY = 'chronoboard_pwa_ios_tip_dismissed'

const visible = ref(false)

function isStandalone(): boolean {
  if (!import.meta.client) return true
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return (
    nav.standalone === true
    || window.matchMedia('(display-mode: standalone)').matches
    || window.matchMedia('(display-mode: fullscreen)').matches
  )
}

function isIosDevice(): boolean {
  if (!import.meta.client) return false
  const ua = window.navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua)) return true
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
}

function dismiss() {
  visible.value = false
  try {
    localStorage.setItem(IOS_TIP_KEY, '1')
  }
  catch {
    // ignore
  }
}

onMounted(() => {
  if (!import.meta.client || isStandalone()) return
  if (!isIosDevice()) return
  try {
    if (localStorage.getItem(IOS_TIP_KEY) === '1') return
  }
  catch {
    // ignore
  }
  visible.value = true
})
</script>

<style scoped>
.pwa-install {
  bottom: max(5.5rem, calc(env(safe-area-inset-bottom, 0px) + 4.75rem));
}

.pwa-install-enter-active,
.pwa-install-leave-active {
  transition: opacity 0.28s ease, transform 0.28s ease;
}

.pwa-install-enter-from,
.pwa-install-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

@media (prefers-reduced-motion: reduce) {
  .pwa-install-enter-active,
  .pwa-install-leave-active {
    transition: opacity 0.15s ease;
  }

  .pwa-install-enter-from,
  .pwa-install-leave-to {
    transform: none;
  }
}
</style>
