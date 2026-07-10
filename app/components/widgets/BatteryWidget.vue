<template>
  <BaseCard title="Battery" icon="mdi:battery">
    <div v-if="!supported" class="text-sm font-ui" :style="{ color: 'var(--color-muted)' }">
      Not supported
    </div>

    <div v-else class="flex items-center gap-3">
      <Icon
        :name="charging ? 'mdi:battery-charging' : 'mdi:battery'"
        size="28"
        :style="{ color: 'var(--color-primary)' }"
      />
      <div>
        <p class="text-2xl font-clock tabular-nums" :style="{ color: 'var(--color-text)' }">
          {{ level }}%
        </p>
        <p class="text-xs font-ui" :style="{ color: 'var(--color-muted)' }">
          {{ charging ? 'Charging' : 'On battery' }}
        </p>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
const { level, charging, supported } = useBattery()
</script>
