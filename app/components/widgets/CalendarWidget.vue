<template>
  <BaseCard title="Calendar" icon="mdi:calendar-month">
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <button
          type="button"
          class="p-1 rounded"
          :style="{ color: 'var(--color-muted)' }"
          aria-label="Previous month"
          @click="prevMonth"
        >
          <Icon name="mdi:chevron-left" size="20" />
        </button>
        <span class="text-sm font-ui font-medium" :style="{ color: 'var(--color-text)' }">
          {{ monthLabel }}
        </span>
        <button
          type="button"
          class="p-1 rounded"
          :style="{ color: 'var(--color-muted)' }"
          aria-label="Next month"
          @click="nextMonth"
        >
          <Icon name="mdi:chevron-right" size="20" />
        </button>
      </div>

      <div class="grid grid-cols-7 gap-1 text-center">
        <span
          v-for="label in weekdayLabels"
          :key="label"
          class="text-[10px] font-ui uppercase"
          :style="{ color: 'var(--color-muted)' }"
        >
          {{ label }}
        </span>

        <template v-for="(week, wi) in weeks" :key="wi">
          <span
            v-for="(day, di) in week"
            :key="`${wi}-${di}`"
            class="text-xs font-ui py-1 rounded"
            :style="dayStyle(day)"
          >
            {{ day.date }}
          </span>
        </template>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
const { monthLabel, weeks, weekdayLabels, prevMonth, nextMonth } = useCalendar()

function dayStyle(day: { isToday: boolean, isCurrentMonth: boolean }) {
  if (day.isToday) {
    return {
      backgroundColor: 'var(--color-primary)',
      color: 'var(--color-bg)',
      fontWeight: '600',
    }
  }
  if (!day.isCurrentMonth) {
    return { color: 'color-mix(in srgb, var(--color-muted) 50%, transparent)' }
  }
  return { color: 'var(--color-text)' }
}
</script>
