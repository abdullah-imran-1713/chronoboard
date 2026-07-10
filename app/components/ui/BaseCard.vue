<template>
  <div
    class="rounded-xl p-4 backdrop-blur-sm transition-all duration-200"
    :style="{
      backgroundColor: 'color-mix(in srgb, var(--color-surface) 80%, transparent)',
      border: '1px solid color-mix(in srgb, var(--color-muted) 20%, transparent)',
    }"
  >
    <div v-if="title" class="flex items-center gap-2 mb-3">
      <Icon v-if="icon" :name="icon" size="16" :style="{ color: 'var(--color-muted)' }" />
      <span class="text-xs font-ui uppercase tracking-wider" :style="{ color: 'var(--color-muted)' }">
        {{ title }}
      </span>
    </div>

    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  icon?: string
}>()
</script>
