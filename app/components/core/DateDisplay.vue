<template>
  <CbHint text="View calendar">
    <button
      type="button"
      class="date-display-btn"
      role="status"
      :aria-label="`Date: ${formatted}. View calendar`"
      :aria-expanded="mode === 'gregorian'"
      :style="{ color: 'var(--color-secondary)' }"
      @click.stop="toggle('gregorian')"
    >
      <p
        class="font-ui px-1 m-0"
        :style="{
          fontSize: 'max(0.7rem, calc(var(--font-size-clock) * 0.18))',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }"
      >
        {{ formatted }}
      </p>
    </button>
  </CbHint>
</template>

<script setup lang="ts">
import type { DateFormat } from '../../../types/date'

const props = withDefaults(defineProps<{
  now: Date
  format?: DateFormat
  locale?: string
}>(), {
  format: 'full',
  locale: 'en-US',
})

const { mode, toggle } = useBoardCalendar()

const nowRef = toRef(props, 'now')
const formatRef = toRef(props, 'format')
const localeRef = toRef(props, 'locale')

const { formatted } = useDate({
  now: nowRef,
  format: formatRef,
  locale: localeRef,
})
</script>

<style scoped>
.date-display-btn {
  display: block;
  width: 100%;
  margin: 0;
  padding: 0.15rem 0.35rem;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: center;
  border-radius: 0.5rem;
}

.date-display-btn:hover,
.date-display-btn:focus-visible {
  background: rgba(var(--color-muted-rgb), 0.12);
  outline: none;
}
</style>
