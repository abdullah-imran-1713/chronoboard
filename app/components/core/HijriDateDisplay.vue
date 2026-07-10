<template>
  <div
    class="text-center mt-1"
    role="status"
    :aria-label="`Hijri date: ${formatted}`"
    :style="{ color: 'var(--color-muted)' }"
  >
    <p
      class="font-ui"
      :style="{
        fontSize: 'calc(var(--font-size-clock) * 0.15)',
        letterSpacing: '0.05em',
      }"
      :dir="locale === 'ar' ? 'rtl' : 'ltr'"
    >
      {{ formatted }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { HijriLocale } from '../../../types/date'

const props = withDefaults(defineProps<{
  now: Date
  locale?: HijriLocale
}>(), {
  locale: 'en',
})

const nowRef = toRef(props, 'now')
const localeRef = toRef(props, 'locale')

const { formatted } = useHijriDate({
  now: nowRef,
  locale: localeRef,
})
</script>
