<template>
  <Teleport to="body">
    <Transition name="settings-scrim">
      <button
        v-if="isOpen"
        type="button"
        class="panel-backdrop fixed inset-0 bg-black/50 z-40 border-none cursor-default"
        aria-label="Close widgets"
        @click="emitClose"
      />
    </Transition>

    <Transition name="settings-drawer">
      <div
        v-if="isOpen"
        role="dialog"
        aria-modal="true"
        aria-labelledby="widgets-panel-title"
        tabindex="-1"
        ref="panelRef"
        class="settings-panel fixed right-0 top-0 h-full w-80 max-w-[90vw] z-50 flex flex-col font-ui"
        :style="{
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text)',
        }"
      >
        <div class="settings-panel-header sticky top-0 z-[2] flex items-center justify-between px-6 py-5 gap-3">
          <h2 id="widgets-panel-title" class="text-lg font-bold tracking-tight m-0">
            Widgets
          </h2>
          <button
            type="button"
            class="cb-icobtn w-8 h-8 rounded-lg border-none bg-transparent flex items-center justify-center cursor-pointer flex-none"
            :style="{ color: 'var(--color-text)' }"
            aria-label="Close widgets"
            @click="emitClose"
          >
            <Icon name="mdi:close" size="20" />
          </button>
        </div>

        <div class="settings-scroll flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <WidgetManager />

          <div class="settings-section flex justify-end">
            <button type="button" class="cb-btn-primary" @click="emitClose">
              Done
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

function emitClose() {
  emit('close')
}

const panelRef = ref<HTMLElement | null>(null)

usePanelDismiss(() => props.isOpen, panelRef, emitClose)

watch(() => props.isOpen, (open) => {
  if (open) {
    nextTick(() => panelRef.value?.focus())
  }
})
</script>
