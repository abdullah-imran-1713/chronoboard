<template>
  <div>
    <div class="flex justify-between text-xs font-ui mb-1">
      <span :style="{ color: 'var(--color-text)' }">{{ label }}</span>
      <span :style="{ color: 'var(--color-muted)' }">{{ value }}%</span>
    </div>
    <div
      class="w-full h-1.5 rounded-full overflow-hidden"
      :style="{ backgroundColor: 'var(--color-muted)', opacity: '0.3' }"
    >
      <div
        class="h-full rounded-full transition-all duration-1000"
        :style="{
          width: `${value}%`,
          backgroundColor: 'var(--color-primary)',
        }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: number
}>()
</script>
