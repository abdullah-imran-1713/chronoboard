<template>
  <main class="relative w-full flex flex-col items-center py-8" aria-label="ChronoBoard dashboard">
    <div class="text-center space-y-4">
      <ClockDisplay
        :now="now"
        :format="settings.clock.format"
        :show-seconds="settings.clock.showSeconds"
        :blinking-colon="settings.clock.blinkingColon"
      />

      <DateDisplay
        v-if="settings.showDate"
        :now="now"
        :format="settings.dateFormat"
        :locale="settings.dateLocale"
      />

      <HijriDateDisplay
        v-if="settings.showHijriDate"
        :now="now"
        :locale="settings.hijriLocale"
      />
    </div>

    <WidgetGrid />

    <button
      type="button"
      class="fixed bottom-6 right-20 p-3 rounded-full transition-opacity duration-500 z-30"
      :class="isIdle ? 'opacity-0 pointer-events-none' : 'opacity-30 hover:opacity-100'"
      :style="{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }"
      aria-label="Toggle fullscreen"
      @click="toggleFullscreen"
    >
      <Icon :name="isFullscreen ? 'mdi:fullscreen-exit' : 'mdi:fullscreen'" size="24" />
    </button>

    <button
      v-if="layoutStore.showSettingsButton"
      type="button"
      class="fixed bottom-6 right-6 p-3 rounded-full transition-opacity duration-500 z-30"
      :class="isIdle ? 'opacity-0 pointer-events-none' : 'opacity-30 hover:opacity-100'"
      :style="{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }"
      aria-label="Open settings"
      @click="showSettings = true"
    >
      <Icon name="mdi:cog" size="24" />
    </button>

    <SettingsPanel
      :is-open="showSettings"
      @close="showSettings = false"
    />
  </main>
</template>

<script setup lang="ts">
const settings = useSettingsStore()
const layoutStore = useLayoutStore()
const showSettings = ref(false)
const { now } = useNow()
provide(NOW_INJECTION_KEY, now)

const { isFullscreen, toggle: toggleFullscreen } = useFullscreen()
const { isIdle } = useCursorAutoHide(3000)

useKeyboardShortcuts({
  f: toggleFullscreen,
  s: () => { showSettings.value = !showSettings.value },
  escape: () => { showSettings.value = false },
})
</script>
