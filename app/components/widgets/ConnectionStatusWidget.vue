<template>
  <BaseCard title="Connection" icon="mdi:wifi">
    <div class="flex items-center gap-2">
      <span
        class="w-2.5 h-2.5 rounded-full shrink-0"
        :style="{ backgroundColor: isOnline ? '#22c55e' : '#ef4444' }"
        :aria-label="isOnline ? 'Online' : 'Offline'"
      />
      <span class="text-sm font-ui" :style="{ color: 'var(--color-text)' }">
        {{ isOnline ? 'Online' : 'Offline' }}
      </span>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
const { isOnline } = useConnectionStatus()
</script>
