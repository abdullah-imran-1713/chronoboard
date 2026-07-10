<template>
  <BaseCard title="Quote of the Day" icon="mdi:format-quote-close">
    <div v-if="loading" class="text-sm font-ui" :style="{ color: 'var(--color-muted)' }">
      Loading quote...
    </div>

    <blockquote v-else-if="quote" class="space-y-2">
      <p class="text-sm font-ui italic leading-relaxed" :style="{ color: 'var(--color-text)' }">
        "{{ quote.text }}"
      </p>
      <footer class="text-xs font-ui" :style="{ color: 'var(--color-muted)' }">
        — {{ quote.author }}
      </footer>
    </blockquote>
  </BaseCard>
</template>

<script setup lang="ts">
const { quote, loading } = useQuote()
</script>
