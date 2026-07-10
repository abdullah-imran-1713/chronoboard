<template>
  <BaseCard title="Stopwatch" icon="mdi:timer">
    <div class="space-y-3">
      <p
        class="text-3xl font-clock text-center tabular-nums"
        :style="{ color: 'var(--color-primary)' }"
      >
        {{ display }}
      </p>

      <div class="flex gap-2 justify-center">
        <button
          type="button"
          class="px-4 py-2 rounded-lg text-sm font-ui"
          :style="buttonStyle"
          @click="running ? pause() : start()"
        >
          {{ running ? 'Pause' : 'Start' }}
        </button>
        <button
          type="button"
          class="px-4 py-2 rounded-lg text-sm font-ui"
          :style="mutedButtonStyle"
          @click="reset()"
        >
          Reset
        </button>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
const { display, running, start, pause, reset } = useStopwatch()

const buttonStyle = {
  backgroundColor: 'var(--color-primary)',
  color: 'var(--color-bg)',
}

const mutedButtonStyle = {
  backgroundColor: 'color-mix(in srgb, var(--color-muted) 30%, transparent)',
  color: 'var(--color-text)',
}
</script>
