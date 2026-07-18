<template>
  <CbHint layout="fab" :text="isDark ? 'Light mode' : 'Dark mode'">
    <button
      type="button"
      class="board-fab cb-icobtn appearance-toggle"
      :class="isDark ? 'appearance-toggle--sun' : 'appearance-toggle--moon'"
      :style="fabStyle"
      :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
      @click="themeStore.toggleAppearance()"
    >
      <span class="appearance-stage" aria-hidden="true">
        <!-- Sun: shown while dark (tap → light) -->
        <svg
          class="appearance-glyph appearance-glyph--sun"
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
        >
          <circle cx="12" cy="12" r="4.2" fill="currentColor" stroke="none" />
          <line x1="12" y1="2" x2="12" y2="4" />
          <line x1="12" y1="20" x2="12" y2="22" />
          <line x1="2" y1="12" x2="4" y2="12" />
          <line x1="20" y1="12" x2="22" y2="12" />
          <line x1="4.5" y1="4.5" x2="5.9" y2="5.9" />
          <line x1="18.1" y1="18.1" x2="19.5" y2="19.5" />
          <line x1="4.5" y1="19.5" x2="5.9" y2="18.1" />
          <line x1="18.1" y1="5.9" x2="19.5" y2="4.5" />
        </svg>

        <!-- Moon: shown while light (tap → dark) -->
        <svg
          class="appearance-glyph appearance-glyph--moon"
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="currentColor"
        >
          <path d="M12.1 2.2a9.8 9.8 0 0 0 0 19.6 9.8 9.8 0 0 0 8.4-4.7 8.2 8.2 0 0 1-8.4-14.9z" />
        </svg>
      </span>
    </button>
  </CbHint>
</template>

<script setup lang="ts">
defineProps<{
  fabStyle: Record<string, string>
}>()

const themeStore = useThemeStore()

/** Icon = destination: dark UI shows sun, light UI shows moon */
const isDark = computed(() => themeStore.resolvedScheme === 'dark')
</script>

<style scoped>
.appearance-stage {
  position: relative;
  width: 22px;
  height: 22px;
  display: block;
}

.appearance-glyph {
  position: absolute;
  inset: 0;
  display: block;
  transform-origin: center;
  transition:
    opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.55s cubic-bezier(0.4, 0, 0.2, 1);
}

.appearance-glyph--sun {
  opacity: 0;
  transform: rotate(-90deg) scale(0.4);
}

.appearance-glyph--moon {
  opacity: 0;
  transform: rotate(90deg) scale(0.4);
}

.appearance-toggle--sun .appearance-glyph--sun {
  opacity: 1;
  transform: rotate(0deg) scale(1);
}

.appearance-toggle--moon .appearance-glyph--moon {
  opacity: 1;
  transform: rotate(0deg) scale(1);
}

@media (prefers-reduced-motion: reduce) {
  .appearance-glyph {
    transition-duration: 0.01ms;
  }
}
</style>
