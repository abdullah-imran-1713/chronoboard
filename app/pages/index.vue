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

    <div
      data-board-fab-rail
      class="board-fab-rail"
      :class="{
        'board-fab-rail--idle': isIdle,
        'board-fab-rail--panel-open': panelOpen,
      }"
    >
      <CbHint
        v-if="layoutStore.showSettingsButton"
        layout="fab"
        :text="showSettings ? 'Close settings' : 'Settings'"
      >
        <button
          type="button"
          class="board-fab cb-icobtn"
          :class="{ 'board-fab--active': showSettings }"
          :style="fabButtonStyle(showSettings)"
          :aria-label="showSettings ? 'Close settings' : 'Open settings'"
          :aria-pressed="showSettings"
          @click="toggleSettings"
        >
          <Icon
            name="mdi:cog-outline"
            size="22"
            class="board-fab-glyph board-fab-glyph--cog"
            :class="{ 'board-fab-glyph--open': showSettings }"
          />
        </button>
      </CbHint>

      <CbHint
        layout="fab"
        :text="showWidgets ? 'Close widgets' : 'Widgets'"
      >
        <button
          type="button"
          class="board-fab cb-icobtn"
          :class="{ 'board-fab--active': showWidgets }"
          :style="fabButtonStyle(showWidgets)"
          :aria-label="showWidgets ? 'Close widgets' : 'Open widgets'"
          :aria-pressed="showWidgets"
          @click="toggleWidgets"
        >
          <Icon
            name="mdi:widgets-outline"
            size="22"
            class="board-fab-glyph board-fab-glyph--widgets"
            :class="{ 'board-fab-glyph--open': showWidgets }"
          />
        </button>
      </CbHint>

      <AppearanceToggle
        v-if="themeStore.showAppearanceToggle"
        :fab-style="fabStyle"
      />

      <CbHint
        layout="fab"
        :text="isFullscreen ? 'Exit fullscreen' : 'Fullscreen'"
      >
        <button
          type="button"
          class="board-fab cb-icobtn"
          :style="fabStyle"
          aria-label="Toggle fullscreen"
          @click="toggleFullscreen"
        >
          <Icon :name="isFullscreen ? 'mdi:fullscreen-exit' : 'mdi:fullscreen'" size="22" />
        </button>
      </CbHint>
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
    <BrandSplash />
  </main>
</template>

<script setup lang="ts">
const settings = useSettingsStore()
const layoutStore = useLayoutStore()
const themeStore = useThemeStore()
const showSettings = ref(false)
const showWidgets = ref(false)
const panelOpen = computed(() => showSettings.value || showWidgets.value)
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
  backgroundColor: 'rgba(var(--color-surface-rgb), 0.85)',
  color: 'var(--color-text)',
  borderColor: 'rgba(var(--color-muted-rgb), 0.2)',
  backdropFilter: 'blur(14px)',
}

function fabButtonStyle(active: boolean) {
  if (!active) return fabStyle
  return {
    ...fabStyle,
    color: 'var(--color-primary)',
    borderColor: 'rgba(var(--color-primary-rgb), 0.45)',
  }
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
  top: 50vh;
  top: 50dvh;
  /* Hug clock/date — grow with font size, never force the time onto two lines */
  width: max-content;
  max-width: calc(100% - 1.5rem);
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
  z-index: 55;
  right: calc(var(--fab-edge) + var(--safe-right));
  bottom: calc(var(--fab-edge) + var(--safe-bottom));
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  gap: var(--fab-gap);
  transition:
    opacity 0.35s ease,
    transform 0.32s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

.board-fab-rail--idle {
  opacity: 0;
  pointer-events: none;
}

.board-fab-rail--panel-open {
  /* Clear the right drawer (w-80 / max 90vw) + small gap */
  transform: translateX(calc(-1 * min(20rem, 90vw) - 0.75rem));
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
  transition:
    opacity 0.2s ease,
    border-color 0.28s ease,
    color 0.28s ease,
    box-shadow 0.28s ease,
    transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

.board-fab:hover {
  opacity: 1;
}

.board-fab--active {
  box-shadow: 0 0 0 1px rgba(var(--color-primary-rgb), 0.22);
  transform: scale(1.04);
}

.board-fab-glyph {
  display: block;
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
}

.board-fab-glyph--cog.board-fab-glyph--open {
  transform: rotate(90deg);
}

.board-fab-glyph--widgets.board-fab-glyph--open {
  transform: scale(0.9) rotate(-12deg);
}

@media (prefers-reduced-motion: reduce) {
  .board-fab-rail,
  .board-fab,
  .board-fab-glyph {
    transition-duration: 0.01ms;
  }
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
