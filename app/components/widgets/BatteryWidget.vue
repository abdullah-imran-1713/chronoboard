<template>
  <BaseCard title="Battery" icon="mdi:battery">
    <div v-if="!supported" class="text-sm font-ui" :style="{ color: 'var(--color-muted)' }">
      Not supported
    </div>

    <div v-else class="flex items-center gap-3">
      <!-- Keep both trees mounted so Nuxt Icon doesn’t miss a dynamic swap on tablets -->
      <span class="battery-icon-slot" aria-hidden="true">
        <Icon
          v-show="charging"
          :name="chargingIcon"
          size="28"
          :style="{ color: 'var(--color-primary)' }"
        />
        <Icon
          v-show="!charging"
          :name="idleIcon"
          size="28"
          :style="{ color: 'var(--color-primary)' }"
        />
      </span>
      <div>
        <p class="text-2xl font-clock tabular-nums" :style="{ color: 'var(--color-text)' }">
          {{ level ?? '—' }}%
        </p>
        <p class="text-xs font-ui" :style="{ color: 'var(--color-muted)' }">
          {{ charging ? 'Charging' : 'On battery' }}
        </p>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { batteryIconName, useBattery } from '../../composables/useBattery'

const { level, charging, supported } = useBattery()

const chargingIcon = computed(() => batteryIconName(level.value, true))
const idleIcon = computed(() => batteryIconName(level.value, false))
</script>

<style scoped>
.battery-icon-slot {
  position: relative;
  display: inline-flex;
  width: 28px;
  height: 28px;
  flex: none;
  align-items: center;
  justify-content: center;
}

.battery-icon-slot :deep(svg) {
  display: block;
}
</style>
