<template>
  <BaseCard title="World Clock" icon="mdi:earth">
    <div class="space-y-3">
      <div
        v-for="(timezone, index) in timezones"
        :key="`${timezone}-${index}`"
        class="flex items-center gap-2"
      >
        <select
          :value="timezone"
          class="flex-1 min-w-0 px-2 py-1 rounded text-xs font-ui border-none outline-none truncate"
          :style="{
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
          }"
          :aria-label="`Timezone ${index + 1}`"
          @change="updateTimezone(index, ($event.target as HTMLSelectElement).value)"
        >
          <option
            v-for="tz in availableTimezones"
            :key="tz"
            :value="tz"
          >
            {{ formatLabel(tz) }}
          </option>
        </select>
        <span
          class="text-lg font-clock tabular-nums shrink-0 w-[5.5rem] text-right"
          :style="{ color: 'var(--color-primary)' }"
        >
          {{ formatTime(timezone) }}
        </span>
        <CbHint
          v-if="timezones.length > 1"
          :text="`Remove ${formatLabel(timezone)}`"
        >
          <button
            type="button"
            class="p-1 shrink-0"
            :style="{ color: 'var(--color-muted)' }"
            :aria-label="`Remove ${formatLabel(timezone)}`"
            @click="removeTimezone(timezone)"
          >
            <Icon name="mdi:close" size="14" />
          </button>
        </CbHint>
      </div>

      <button
        v-if="timezones.length < 4"
        type="button"
        class="text-xs font-ui w-full py-1 rounded"
        :style="{
          color: 'var(--color-primary)',
          backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)',
        }"
        @click="onAddTimezone"
      >
        + Add timezone
      </button>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
const {
  timezones,
  availableTimezones,
  formatTime,
  formatLabel,
  addTimezone,
  removeTimezone,
  updateTimezone,
} = useWorldClock()

function onAddTimezone() {
  const unused = availableTimezones.value.find(tz => !timezones.value.includes(tz))
  if (unused) addTimezone(unused)
}
</script>
