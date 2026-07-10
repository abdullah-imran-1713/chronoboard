<template>
  <BaseCard title="Quran Verse" icon="mdi:book-open-page-variant">
    <div v-if="loading" class="text-sm font-ui" :style="{ color: 'var(--color-muted)' }">
      Loading verse...
    </div>

    <div v-else-if="error" class="text-sm font-ui" :style="{ color: 'var(--color-muted)' }">
      {{ error }}
    </div>

    <div v-else-if="verse" class="space-y-3">
      <p
        class="text-lg leading-loose text-right font-ui"
        dir="rtl"
        :style="{ color: 'var(--color-text)' }"
      >
        {{ verse.arabic }}
      </p>
      <p class="text-sm font-ui leading-relaxed" :style="{ color: 'var(--color-secondary)' }">
        {{ verse.translation }}
      </p>
      <p class="text-xs font-ui" :style="{ color: 'var(--color-muted)' }">
        {{ verse.surah }} · Ayah {{ verse.ayah }}
      </p>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
const { verse, loading, error } = useQuranVerse()
</script>
