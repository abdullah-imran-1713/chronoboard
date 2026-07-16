<template>
  <Teleport to="body">
    <Transition name="settings-scrim">
      <div
        v-if="open"
        class="fixed inset-0 z-[70] flex items-center justify-center p-4"
      >
        <button
          type="button"
          class="absolute inset-0 bg-black/55 border-none cursor-default"
          aria-label="Dismiss"
          @click="onDismiss"
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="islamic-features-title"
          aria-describedby="islamic-features-desc"
          class="relative w-full max-w-sm rounded-xl p-6 font-ui shadow-2xl"
          :style="{
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
            border: '1px solid color-mix(in srgb, var(--color-muted) 20%, transparent)',
          }"
          @keydown.escape.stop="onDismiss"
        >
          <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-2">
              <p
                class="text-[11px] font-bold uppercase tracking-[0.12em]"
                :style="{ color: 'var(--color-muted)' }"
              >
                Optional features
              </p>
              <h2 id="islamic-features-title" class="text-lg font-bold tracking-tight">
                Show Islamic features?
              </h2>
              <p
                id="islamic-features-desc"
                class="text-sm leading-relaxed"
                :style="{ color: 'var(--color-secondary)' }"
              >
                This unlocks Hijri date, prayer times, and Quran verse widgets.
                You can change this later in Settings.
              </p>
            </div>

            <div class="flex flex-col gap-2.5 pt-1">
              <button
                type="button"
                class="cb-btn-primary w-full"
                @click="onAccept"
              >
                Yes, Alhamdulillah
              </button>
              <button
                type="button"
                class="cb-btn-muted w-full"
                @click="onDecline"
              >
                No, hide these
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="board-toast">
      <div
        v-if="toastMessage"
        class="board-toast fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 px-3.5 py-2 rounded-lg text-[12px] font-ui pointer-events-none"
        :style="{
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text)',
          border: '1px solid color-mix(in srgb, var(--color-muted) 25%, transparent)',
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
const { open, accept, decline, dismiss } = useIslamicFeatures()

const toastMessage = ref('')
let toastTimer: ReturnType<typeof setTimeout> | null = null

const LOCATION_TOAST = 'Allow location to add Prayer Times'

function showToast(message: string) {
  toastMessage.value = message
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
    toastTimer = null
  }, 2200)
}

async function onAccept() {
  const result = await accept()
  if (result === 'location_denied') {
    showToast(LOCATION_TOAST)
  }
}

function onDecline() {
  decline()
}

function onDismiss() {
  dismiss()
}

onUnmounted(() => {
  if (toastTimer) clearTimeout(toastTimer)
})
</script>

<style scoped>
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
