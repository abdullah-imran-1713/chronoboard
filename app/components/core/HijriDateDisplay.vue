<template>
  <div
    class="text-center mt-1"
    role="status"
    :aria-label="`Hijri date: ${formatted}`"
    :style="{ color: 'var(--color-muted)' }"
  >
    <p
      class="font-ui px-1"
      :style="{
        fontSize: 'clamp(0.65rem, calc(var(--font-size-clock) * 0.14), 0.95rem)',
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
