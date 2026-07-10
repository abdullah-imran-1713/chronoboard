<template>
  <div
    class="select-none"
    role="timer"
    :aria-label="spokenTime"
  >
    <span class="sr-only" aria-live="polite" aria-atomic="true">{{ spokenTime }}</span>
    <div
      class="font-clock flex items-baseline justify-center clock-effects"
      :style="{
        fontSize: 'var(--font-size-clock)',
        fontWeight: 'var(--font-weight-clock)',
        letterSpacing: 'var(--letter-spacing-clock)',
        color: 'var(--color-primary)',
      }"
    >
      <span class="tabular-nums">{{ hours }}</span>

      <span
        class="mx-1 transition-opacity duration-200"
        :class="{ 'opacity-0': blinkingColon && !colonVisible }"
      >:</span>

      <span class="tabular-nums">{{ minutes }}</span>

      <template v-if="showSeconds">
        <span
          class="mx-1 transition-opacity duration-200"
          :class="{ 'opacity-0': blinkingColon && !colonVisible }"
        >:</span>
        <span class="tabular-nums">{{ seconds }}</span>
      </template>

      <span
        v-if="period"
        class="ml-3"
        :style="{
          fontSize: 'calc(var(--font-size-clock) * 0.3)',
          color: 'var(--color-secondary)',
        }"
      >
        {{ period }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ClockFormat } from '../../../types/clock'

const props = withDefaults(defineProps<{
  now: Date
  format?: ClockFormat
  showSeconds?: boolean
  blinkingColon?: boolean
}>(), {
  format: '12h',
  showSeconds: true,
  blinkingColon: true,
})

const nowRef = toRef(props, 'now')
const formatRef = toRef(props, 'format')
const showSecondsRef = toRef(props, 'showSeconds')

const {
  hours,
  minutes,
  seconds,
  period,
  colonVisible,
} = useClock({
  now: nowRef,
  format: formatRef,
  showSeconds: showSecondsRef,
})

const spokenTime = computed(() => {
  const parts = [`${hours.value} hours`, `${minutes.value} minutes`]
  if (props.showSeconds) {
    parts.push(`${seconds.value} seconds`)
  }
  if (period.value) {
    parts.push(period.value)
  }
  return `Current time: ${parts.join(', ')}`
})
</script>
