<template>
  <Teleport to="body">
    <Transition name="settings-scrim">
      <div
        v-if="open"
        class="fixed inset-0 z-[70] flex items-center justify-center p-4"
        data-confirm-dialog
        data-layout-reset-modal
      >
        <button
          type="button"
          class="absolute inset-0 bg-black/55 border-none cursor-default"
          aria-label="Dismiss"
          @click="dismiss"
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="layout-reset-title"
          aria-describedby="layout-reset-desc"
          class="relative w-full max-w-sm rounded-xl p-6 font-ui shadow-2xl"
          :style="{
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
            border: '1px solid rgba(var(--color-muted-rgb), 0.2)',
          }"
          @keydown.escape.stop="dismiss"
        >
          <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-2">
              <p
                class="text-[11px] font-bold uppercase tracking-[0.12em]"
                :style="{ color: 'var(--color-muted)' }"
              >
                Widgets
              </p>
              <h2 id="layout-reset-title" class="text-lg font-bold tracking-tight">
                Reset layout?
              </h2>
              <p
                id="layout-reset-desc"
                class="text-sm leading-relaxed"
                :style="{ color: 'var(--color-secondary)' }"
              >
                Restore all widgets to their default positions? You can rearrange them again anytime.
              </p>
            </div>

            <div class="flex flex-col gap-2.5 pt-1">
              <button
                type="button"
                class="cb-btn-primary w-full"
                @click="confirm"
              >
                Reset layout
              </button>
              <button
                type="button"
                class="cb-btn-muted w-full"
                @click="dismiss"
              >
                Cancel
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
const { open, toastMessage, dismiss, confirm } = useLayoutReset()
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
