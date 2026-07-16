<template>
  <main
    class="board-shell relative w-full"
    :style="{ minHeight: `${pageMinHeight}px` }"
    aria-label="ChronoBoard dashboard"
  >
    <div
      data-board-hero
      class="board-hero absolute left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none"
    >
      <div class="pointer-events-auto board-hero-stack">
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
    </div>

    <WidgetCanvas @board-height="onBoardHeight" />

    <div class="board-fab-rail" :class="{ 'board-fab-rail--idle': isIdle }">
      <button
        v-if="layoutStore.showSettingsButton"
        type="button"
        class="board-fab cb-icobtn"
        :style="fabStyle"
        aria-label="Open settings"
        @click="openSettings"
      >
        <Icon name="mdi:cog-outline" size="22" />
      </button>

      <button
        type="button"
        class="board-fab cb-icobtn"
        :style="fabStyle"
        aria-label="Open widgets"
        @click="openWidgets"
      >
        <Icon name="mdi:widgets-outline" size="22" />
      </button>

      <button
        v-if="themeStore.showAppearanceToggle"
        type="button"
        class="board-fab cb-icobtn"
        :style="fabStyle"
        :aria-label="themeStore.currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
        @click="themeStore.toggleAppearance()"
      >
        <Icon
          :name="themeStore.currentTheme === 'dark' ? 'mdi:white-balance-sunny' : 'mdi:moon-waning-crescent'"
          size="22"
        />
      </button>

      <button
        type="button"
        class="board-fab cb-icobtn"
        :style="fabStyle"
        aria-label="Toggle fullscreen"
        @click="toggleFullscreen"
      >
        <Icon :name="isFullscreen ? 'mdi:fullscreen-exit' : 'mdi:fullscreen'" size="22" />
      </button>
    </div>

    <SettingsPanel
      :is-open="showSettings"
      @close="showSettings = false"
    />

    <WidgetsPanel
      :is-open="showWidgets"
      @close="showWidgets = false"
    />

    <IslamicFeaturesModal />
    <DesktopExperienceTip />
  </main>
</template>

<script setup lang="ts">
const settings = useSettingsStore()
const layoutStore = useLayoutStore()
const themeStore = useThemeStore()
const showSettings = ref(false)
const showWidgets = ref(false)
const { now } = useNow()
provide(NOW_INJECTION_KEY, now)

const { isFullscreen, toggle: toggleFullscreen } = useFullscreen()
const { isIdle } = useCursorAutoHide(3000)

const { open: islamicModalOpen, dismiss: dismissIslamicModal } = useIslamicFeatures()

const boardHeightPx = ref(typeof window !== 'undefined' ? window.innerHeight : 800)
const pageMinHeight = computed(() =>
  Math.max(boardHeightPx.value, typeof window !== 'undefined' ? window.innerHeight : 800),
)

const widgetStore = useWidgetStore()

watch(
  () => widgetStore.activeWidgets.length,
  (count) => {
    if (count === 0 && typeof window !== 'undefined') {
      boardHeightPx.value = window.innerHeight
    }
  },
)

function onBoardHeight(h: number) {
  boardHeightPx.value = Math.max(h, typeof window !== 'undefined' ? window.innerHeight : h)
}

function openSettings() {
  showWidgets.value = false
  showSettings.value = true
}

function openWidgets() {
  showSettings.value = false
  showWidgets.value = true
}

function toggleSettings() {
  if (showSettings.value) {
    showSettings.value = false
    return
  }
  openSettings()
}

function toggleWidgets() {
  if (showWidgets.value) {
    showWidgets.value = false
    return
  }
  openWidgets()
}

const fabStyle = {
  backgroundColor: 'color-mix(in srgb, var(--color-surface) 85%, transparent)',
  color: 'var(--color-text)',
  borderColor: 'color-mix(in srgb, var(--color-muted) 20%, transparent)',
  backdropFilter: 'blur(14px)',
}

useKeyboardShortcuts({
  f: toggleFullscreen,
  s: toggleSettings,
  w: toggleWidgets,
  escape: () => {
    if (islamicModalOpen.value) {
      dismissIslamicModal()
      return
    }
    if (showWidgets.value) {
      showWidgets.value = false
      return
    }
    showSettings.value = false
  },
})
</script>

<style scoped>
.board-shell {
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.board-shell::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.board-hero {
  top: 50dvh;
  width: min(100%, 56rem);
  padding-inline: max(0.75rem, env(safe-area-inset-left, 0px), env(safe-area-inset-right, 0px));
}

.board-hero-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.85rem;
}

.board-fab-rail {
  position: fixed;
  z-index: 30;
  right: calc(var(--fab-edge) + var(--safe-right));
  bottom: calc(var(--fab-edge) + var(--safe-bottom));
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  gap: var(--fab-gap);
  transition: opacity 0.35s ease;
}

.board-fab-rail--idle {
  opacity: 0;
  pointer-events: none;
}

.board-fab {
  width: var(--fab-size);
  height: var(--fab-size);
  border-radius: 999px;
  border-width: 1px;
  border-style: solid;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  transition: opacity 0.2s ease;
}

.board-fab:hover {
  opacity: 1;
}

@media (max-width: 640px) {
  .board-hero-stack {
    gap: 0.55rem;
  }
}

@media (max-height: 520px) and (orientation: landscape) {
  .board-hero-stack {
    gap: 0.35rem;
  }
}
</style>
