<template>
  <BaseCard title="Ambient Sounds" icon="mdi:volume-high">
    <div class="space-y-3">
      <div
        v-for="sound in sounds"
        :key="sound.id"
        class="space-y-1"
      >
        <div class="flex items-center justify-between">
          <button
            type="button"
            class="flex items-center gap-2 text-sm font-ui"
            :aria-label="`${states[sound.id]?.playing ? 'Pause' : 'Play'} ${sound.label}`"
            :aria-pressed="states[sound.id]?.playing ?? false"
            :style="{ color: states[sound.id]?.playing ? 'var(--color-primary)' : 'var(--color-text)' }"
            @click="toggle(sound.id, sound.file)"
          >
            <Icon :name="sound.icon" size="18" />
            {{ sound.label }}
          </button>
          <Icon
            :name="states[sound.id]?.playing ? 'mdi:pause' : 'mdi:play'"
            size="16"
            :style="{ color: 'var(--color-muted)' }"
          />
        </div>
        <BaseSlider
          :model-value="states[sound.id]?.volume ?? 0.5"
          :label="`${sound.label} volume`"
          :min="0"
          :max="1"
          :step="0.05"
          :display-value="`${Math.round((states[sound.id]?.volume ?? 0.5) * 100)}%`"
          @update:model-value="setVolume(sound.id, sound.file, $event)"
        />
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
const { sounds, states, toggle, setVolume } = useAmbientSounds()
</script>
