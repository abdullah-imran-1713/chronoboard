<template>
  <div
    class="cb-card rounded-xl backdrop-blur-sm transition-all duration-200"
    :style="{
      backgroundColor: 'rgba(var(--color-surface-rgb), 0.8)',
      border: '1px solid rgba(var(--color-muted-rgb), 0.2)',
    }"
  >
    <div v-if="title" class="flex items-center gap-2 mb-2.5 sm:mb-3">
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

<style scoped>
.cb-card {
  padding: 0.85rem;
}

@media (min-width: 640px) {
  .cb-card {
    padding: 1rem;
  }
}
</style>
