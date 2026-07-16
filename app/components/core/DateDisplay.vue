<template>
  <div
    class="text-center"
    role="status"
    :aria-label="`Date: ${formatted}`"
    :style="{ color: 'var(--color-secondary)' }"
  >
    <p
      class="font-ui px-1"
      :style="{
        fontSize: 'clamp(0.7rem, calc(var(--font-size-clock) * 0.18), 1.15rem)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      }"
    >
      {{ formatted }}
    </p>
  </div>
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

const nowRef = toRef(props, 'now')
const formatRef = toRef(props, 'format')
const localeRef = toRef(props, 'locale')

const { formatted } = useDate({
  now: nowRef,
  format: formatRef,
  locale: localeRef,
})
</script>
