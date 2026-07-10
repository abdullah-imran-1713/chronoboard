<template>
  <BaseCard title="Prayer Times" icon="mdi:mosque">
    <div v-if="loading" class="text-sm font-ui" :style="{ color: 'var(--color-muted)' }">
      Loading prayer times...
    </div>

    <div v-else-if="error" class="text-sm font-ui" :style="{ color: 'var(--color-muted)' }">
      {{ error }}
    </div>

    <div v-else-if="prayers" class="space-y-2">
      <div
        v-if="nextPrayer"
        class="text-center py-2 rounded-lg mb-3"
        :style="{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }"
      >
        <p class="text-xs font-ui" :style="{ color: 'var(--color-muted)' }">
          Next Prayer
        </p>
        <p class="text-lg font-bold font-ui" :style="{ color: 'var(--color-primary)' }">
          {{ nextPrayer.name }} — {{ nextPrayer.countdown }}
        </p>
      </div>

      <div
        v-for="name in PRAYER_DISPLAY_ORDER"
        :key="name"
        class="flex justify-between text-sm font-ui"
        :style="{
          color: nextPrayer?.name === name ? 'var(--color-primary)' : 'var(--color-text)',
          fontWeight: nextPrayer?.name === name ? '700' : '400',
        }"
      >
        <span>{{ name }}</span>
        <span>{{ prayers[name] }}</span>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { PRAYER_DISPLAY_ORDER } from '../../../types/prayer'

const { prayers, nextPrayer, loading, error, init } = usePrayerTimes()

onMounted(() => {
  init()
})
</script>
