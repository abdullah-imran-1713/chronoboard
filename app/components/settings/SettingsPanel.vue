<template>
  <Teleport to="body">
    <Transition name="fade">
      <button
        v-if="isOpen"
        type="button"
        class="fixed inset-0 bg-black/50 z-40 border-none cursor-default"
        aria-label="Close settings"
        @click="$emit('close')"
      />
    </Transition>

    <Transition name="slide">
      <div
        v-if="isOpen"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        tabindex="-1"
        ref="panelRef"
        class="fixed right-0 top-0 h-full w-80 max-w-[90vw] z-50 overflow-y-auto p-6 space-y-6"
        :style="{
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text)',
        }"
      >
        <div class="flex items-center justify-between">
          <h2 id="settings-title" class="text-lg font-bold font-ui">
            Settings
          </h2>
          <button
            type="button"
            class="p-2 rounded-lg hover:opacity-70"
            aria-label="Close settings"
            @click="$emit('close')"
          >
            <Icon name="mdi:close" size="20" />
          </button>
        </div>

        <ClockSettings />
        <ThemeSettings />
        <FontSettings />
        <EffectSettings />

        <WidgetManager />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean
}>()

defineEmits<{
  close: []
}>()

const panelRef = ref<HTMLElement | null>(null)

watch(() => props.isOpen, (open) => {
  if (open) {
    nextTick(() => panelRef.value?.focus())
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
