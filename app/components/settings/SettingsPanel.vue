<template>
  <Teleport to="body">
    <Transition name="settings-scrim">
      <button
        v-if="isOpen"
        type="button"
        class="panel-backdrop fixed inset-0 bg-black/50 z-40 border-none cursor-default"
        aria-label="Close settings"
        @click="emitClose"
      />
    </Transition>

    <Transition name="settings-drawer">
      <div
        v-if="isOpen"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        tabindex="-1"
        ref="panelRef"
        class="settings-panel fixed right-0 top-0 h-full w-80 max-w-[90vw] z-50 flex flex-col font-ui"
        :style="{
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text)',
        }"
      >
        <div class="settings-panel-header sticky top-0 z-[2] flex items-center justify-between px-6 py-5 gap-3">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="settings-brand-mark flex-none" aria-hidden="true">
              <BrandMark />
            </div>
            <h2 id="settings-title" class="settings-brand-title font-brand m-0 truncate">
              Settings
            </h2>
          </div>
          <CbHint text="Close">
            <button
              type="button"
              class="cb-icobtn w-8 h-8 rounded-lg border-none bg-transparent flex items-center justify-center cursor-pointer flex-none"
              :style="{ color: 'var(--color-text)' }"
              aria-label="Close settings"
              @click="emitClose"
            >
              <Icon name="mdi:close" size="20" />
            </button>
          </CbHint>
        </div>

        <div class="settings-scroll flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <ClockSettings class="settings-section" />
          <ThemeSettings class="settings-section" />
          <FontSettings class="settings-section" />
          <EffectSettings class="settings-section" />
          <SupportSettings class="settings-section" />

          <div class="settings-section flex gap-2.5">
            <button type="button" class="cb-btn-muted" @click="resetAll">
              Reset
            </button>
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
const settings = useSettingsStore()
const themeStore = useThemeStore()
const customization = useCustomizationStore()
const widgetStore = useWidgetStore()
const layoutStore = useLayoutStore()

usePanelDismiss(() => props.isOpen, panelRef, emitClose)

watch(() => props.isOpen, (open) => {
  if (open) {
    nextTick(() => panelRef.value?.focus())
  }
})

function resetAll() {
  settings.$reset()
  themeStore.$reset()
  customization.$reset()
  widgetStore.$reset()
  layoutStore.$reset()
  themeStore.applyTheme()
  customization.applyToCSS()
  window.dispatchEvent(new CustomEvent('chronoboard:repack-widgets', {
    detail: { forceAll: true },
  }))
}
</script>
