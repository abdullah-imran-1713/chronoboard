<template>
  <div class="space-y-4">
    <h3 class="text-sm font-bold font-ui uppercase tracking-wider" :style="{ color: 'var(--color-muted)' }">
      Widgets
    </h3>

    <div
      v-for="(widgets, category) in widgetStore.widgetsByCategory"
      :key="category"
      class="space-y-2"
    >
      <template v-if="widgets.length > 0">
        <p class="text-xs font-ui" :style="{ color: 'var(--color-muted)' }">
          {{ categoryLabels[category] }}
        </p>

        <BaseToggle
          v-for="widget in widgets"
          :key="widget.id"
          :model-value="widgetStore.isEnabled(widget.id)"
          :label="widget.name"
          @update:model-value="(enabled) => widgetStore.setWidgetEnabled(widget.id, enabled)"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WidgetCategory } from '../../../types/widget'

const widgetStore = useWidgetStore()

const categoryLabels: Record<WidgetCategory, string> = {
  time: 'Time',
  productivity: 'Productivity',
  info: 'Info',
  religious: 'Religious',
  ambient: 'Ambient',
  system: 'System',
}
</script>
