<template>
  <BaseCard title="Notes" icon="mdi:note-text-outline">
    <textarea
      v-model="content"
      rows="5"
      placeholder="Jot something down..."
      class="w-full resize-none rounded-lg px-3 py-2 text-sm font-ui outline-none border-none"
      :style="{
        backgroundColor: 'color-mix(in srgb, var(--color-surface) 60%, transparent)',
        color: 'var(--color-text)',
      }"
      aria-label="Notes"
    />
  </BaseCard>
</template>

<script setup lang="ts">
const { content } = useNotes()
</script>
