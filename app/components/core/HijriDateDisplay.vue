<template>
  <CbHint text="View Hijri calendar">
    <button
      type="button"
      class="hijri-display-btn"
      role="status"
      :aria-label="`Hijri date: ${formatted}. View Hijri calendar`"
      :aria-expanded="mode === 'hijri'"
      :style="{ color: 'var(--color-muted)' }"
      @click.stop="toggle('hijri')"
    >
      <p
        class="font-ui px-1 m-0"
        :style="{
          fontSize: 'max(0.65rem, calc(var(--font-size-clock) * 0.14))',
          letterSpacing: '0.05em',
        }"
        :dir="locale === 'ar' ? 'rtl' : 'ltr'"
      >
        {{ formatted }}
      </p>
    </button>
  </CbHint>
</template>

<script setup lang="ts">
import type { HijriLocale } from '../../../types/date'

const props = withDefaults(defineProps<{
  now: Date
  locale?: HijriLocale
}>(), {
  locale: 'en',
})

const { mode, toggle } = useBoardCalendar()

const nowRef = toRef(props, 'now')
const localeRef = toRef(props, 'locale')

const { formatted } = useHijriDate({
  now: nowRef,
  locale: localeRef,
})
</script>

<style scoped>
.hijri-display-btn {
  display: block;
  width: 100%;
  margin: 0.15rem 0 0;
  padding: 0.15rem 0.35rem;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: center;
  border-radius: 0.5rem;
}

.hijri-display-btn:hover,
.hijri-display-btn:focus-visible {
  background: rgba(var(--color-muted-rgb), 0.12);
  outline: none;
}
</style>
