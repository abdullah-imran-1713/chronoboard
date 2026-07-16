<template>
  <Teleport to="body">
    <Transition name="desktop-tip">
      <div
        v-if="visible"
        class="desktop-tip fixed inset-x-0 z-[60] flex justify-center px-4 pointer-events-none"
        role="status"
      >
        <div
          class="desktop-tip-card pointer-events-auto w-full max-w-sm rounded-2xl p-4 font-ui"
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
              class="desktop-tip-icon flex-none w-9 h-9 rounded-xl flex items-center justify-center"
              :style="{
                backgroundColor: 'rgba(var(--color-primary-rgb), 0.14)',
                color: 'var(--color-primary)',
              }"
            >
              <Icon name="mdi:monitor" size="20" />
            </div>
            <div class="flex-1 min-w-0 flex flex-col gap-1.5">
              <p class="text-[13px] font-semibold m-0 leading-snug">
                Best on a larger screen
              </p>
              <p
                class="text-[12px] m-0 leading-relaxed"
                :style="{ color: 'var(--color-muted)' }"
              >
                ChronoBoard is designed for tablets and desktops. Open it there for the full clock experience.
              </p>
              <button
                type="button"
                class="desktop-tip-btn self-start mt-1 border-none cursor-pointer rounded-lg px-3 py-1.5 text-[12px] font-semibold"
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
const STORAGE_KEY = 'chronoboard_desktop_tip_dismissed'
const MOBILE_MQ = '(max-width: 768px)'

const visible = ref(false)

function isMobileViewport(): boolean {
  if (!import.meta.client) return false
  return window.matchMedia(MOBILE_MQ).matches
}

function dismiss() {
  visible.value = false
  try {
    localStorage.setItem(STORAGE_KEY, '1')
  }
  catch {
    // ignore
  }
}

onMounted(() => {
  if (!isMobileViewport()) return
  try {
    if (localStorage.getItem(STORAGE_KEY) === '1') return
  }
  catch {
    // show tip anyway
  }
  // Slight delay so the board paints first
  window.setTimeout(() => {
    if (isMobileViewport()) visible.value = true
  }, 600)
})
</script>

<style scoped>
.desktop-tip {
  bottom: calc(5.5rem + env(safe-area-inset-bottom, 0px));
}

.desktop-tip-enter-active,
.desktop-tip-leave-active {
  transition: opacity 0.28s ease, transform 0.28s ease;
}

.desktop-tip-enter-from,
.desktop-tip-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

.desktop-tip-btn:hover {
  opacity: 0.92;
}
</style>
