<template>
  <div class="flex flex-col gap-3.5">
    <h3 class="settings-section-title font-ui">
      Clock
    </h3>

    <div
      class="flex rounded-lg p-[3px] gap-[3px]"
      :style="{ backgroundColor: 'var(--color-bg)' }"
    >
      <button
        type="button"
        class="cb-seg"
        :data-active="settings.clock.format === '12h' ? 'true' : 'false'"
        @click="settings.clock.format = '12h'"
      >
        12H
      </button>
      <button
        type="button"
        class="cb-seg"
        :data-active="settings.clock.format === '24h' ? 'true' : 'false'"
        @click="settings.clock.format = '24h'"
      >
        24H
      </button>
    </div>

    <BaseToggle
      :model-value="settings.clock.showSeconds"
      label="Show seconds"
      @update:model-value="settings.toggleSeconds"
    />

    <BaseToggle
      :model-value="settings.clock.blinkingColon"
      label="Blinking colon"
      @update:model-value="settings.toggleBlinkingColon"
    />

    <BaseToggle
      :model-value="settings.showDate"
      label="Show date"
      @update:model-value="settings.toggleDate"
    />

    <BaseToggle
      v-if="!isHidden"
      :model-value="settings.showHijriDate"
      label="Show Hijri date"
      @update:model-value="onHijriToggle"
    />

    <div
      v-else
      class="flex flex-col gap-2 rounded-lg p-3"
      :style="{ backgroundColor: 'var(--color-bg)' }"
    >
      <p class="text-sm font-ui" :style="{ color: 'var(--color-text)' }">
        Islamic features hidden
      </p>
      <p class="text-xs font-ui leading-relaxed" :style="{ color: 'var(--color-muted)' }">
        Hijri date and Faith widgets stay off. You can turn them back on anytime.
      </p>
      <button
        type="button"
        class="cb-btn-muted w-full mt-1"
        @click="requestReenable"
      >
        Show Islamic features
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const settings = useSettingsStore()
const { isHidden, onHijriToggle, requestReenable, migrateIfNeeded } = useIslamicFeatures()

onMounted(() => {
  migrateIfNeeded()
})
</script>
