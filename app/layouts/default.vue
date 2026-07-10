<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center transition-colors duration-300"
    :style="layoutStyle"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
const themeStore = useThemeStore()

const layoutStyle = computed(() => {
  const base: Record<string, string> = {
    backgroundColor: 'var(--color-bg)',
  }

  if (themeStore.backgroundStyle) {
    base.background = themeStore.backgroundStyle
  }

  return base
})
</script>
