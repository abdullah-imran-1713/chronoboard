<template>
  <div class="space-y-3">
    <h3 class="text-sm font-bold font-ui uppercase tracking-wider" :style="{ color: 'var(--color-muted)' }">
      Clock
    </h3>

    <BaseSelect
      :model-value="settings.clock.format"
      label="Format"
      :options="[
        { value: '12h', label: '12-hour (AM/PM)' },
        { value: '24h', label: '24-hour' },
      ]"
      @update:model-value="(v) => settings.clock.format = v as '12h' | '24h'"
    />

    <BaseToggle
      :model-value="settings.clock.showSeconds"
      label="Show Seconds"
      @update:model-value="settings.toggleSeconds"
    />

    <BaseToggle
      :model-value="settings.clock.blinkingColon"
      label="Blinking Colon"
      @update:model-value="settings.toggleBlinkingColon"
    />

    <BaseToggle
      :model-value="settings.showDate"
      label="Show Date"
      @update:model-value="settings.toggleDate"
    />

    <BaseToggle
      :model-value="settings.showHijriDate"
      label="Show Hijri Date"
      @update:model-value="settings.toggleHijriDate"
    />
  </div>
</template>

<script setup lang="ts">
const settings = useSettingsStore()
</script>
