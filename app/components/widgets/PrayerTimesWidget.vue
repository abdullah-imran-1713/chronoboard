<template>
  <BaseCard title="Prayer Times" icon="mdi:mosque">
    <div v-if="loading" class="text-sm font-ui" :style="{ color: 'var(--color-muted)' }">
      Loading prayer times...
    </div>

    <div v-else-if="error" class="text-sm font-ui" :style="{ color: 'var(--color-muted)' }">
      {{ error }}
    </div>

    <div v-else-if="prayers" class="space-y-3">
      <div
        v-if="nextPrayer"
        class="text-center py-2 rounded-lg"
        :style="{ backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)' }"
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
        class="flex justify-between text-sm font-ui gap-2"
        :style="{
          color: nextPrayer?.name === name ? 'var(--color-primary)' : 'var(--color-text)',
          fontWeight: nextPrayer?.name === name ? '700' : '400',
        }"
      >
        <span>{{ name }}</span>
        <span class="tabular-nums">{{ prayers[name] }}</span>
      </div>

      <div class="flex justify-center pt-1">
        <div
          class="prayer-school-track"
          role="group"
          aria-label="Asr school"
        >
          <button
            type="button"
            class="prayer-school-opt"
            :data-active="asrSchool === 'shafi' ? 'true' : 'false'"
            @click="setAsrSchool('shafi')"
          >
            Shafi
          </button>
          <button
            type="button"
            class="prayer-school-opt"
            :data-active="asrSchool === 'hanafi' ? 'true' : 'false'"
            @click="setAsrSchool('hanafi')"
          >
            Hanafi
          </button>
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { PRAYER_DISPLAY_ORDER } from '../../../types/prayer'

const { prayers, nextPrayer, loading, error, asrSchool, init, setAsrSchool } = usePrayerTimes()

onMounted(() => {
  init()
})
</script>

<style scoped>
.prayer-school-track {
  display: inline-flex;
  align-items: center;
  padding: 2px;
  border-radius: 999px;
  gap: 1px;
  background: rgba(var(--color-muted-rgb), 0.14);
  border: 1px solid rgba(var(--color-muted-rgb), 0.2);
}

.prayer-school-opt {
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
  line-height: 1;
  padding: 6px 11px;
  border-radius: 999px;
  color: var(--color-muted);
  background: transparent;
  transition: background 0.18s ease, color 0.18s ease;
}

.prayer-school-opt:hover {
  color: var(--color-text);
}

.prayer-school-opt[data-active='true'] {
  color: var(--color-text);
  background: var(--color-surface);
  background: color-mix(in srgb, var(--color-primary) 22%, var(--color-surface));
  box-shadow: 0 0 0 1px rgba(var(--color-primary-rgb), 0.35);
}
</style>
