<template>
  <BaseCard title="Notes" icon="mdi:note-text-outline">
    <textarea
      v-model="content"
      rows="5"
      placeholder="Jot something down..."
      class="w-full resize-none rounded-lg px-3 py-2 text-sm font-ui outline-none border-none"
      :style="{
        backgroundColor: 'rgba(var(--color-surface-rgb), 0.6)',
        color: 'var(--color-text)',
      }"
      aria-label="Notes"
    />
  </BaseCard>
</template>

<script setup lang="ts">
const { content } = useNotes()
</script>
