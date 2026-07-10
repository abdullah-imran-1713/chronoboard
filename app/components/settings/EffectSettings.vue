<template>
  <div class="space-y-3">
    <h3 class="text-sm font-bold font-ui uppercase tracking-wider" :style="{ color: 'var(--color-muted)' }">
      Effects
    </h3>

    <div class="space-y-2">
      <label class="text-sm font-ui" :style="{ color: 'var(--color-text)' }">Glow Color</label>
      <input
        type="color"
        :value="customization.glowColor === 'transparent' ? '#ffffff' : customization.glowColor"
        class="w-full h-8 rounded cursor-pointer"
        @input="onGlowColorChange"
      >
    </div>

    <BaseSlider
      :model-value="customization.glowIntensity"
      label="Glow Intensity"
      :min="0"
      :max="40"
      :step="1"
      :display-value="`${customization.glowIntensity}px`"
      @update:model-value="(v) => customization.setGlow(customization.glowColor, v)"
    />

    <div class="space-y-2">
      <label class="text-sm font-ui" :style="{ color: 'var(--color-text)' }">Shadow Color</label>
      <input
        type="color"
        :value="customization.shadowColor === 'transparent' ? '#000000' : customization.shadowColor"
        class="w-full h-8 rounded cursor-pointer"
        @input="onShadowColorChange"
      >
    </div>

    <BaseSlider
      :model-value="customization.shadowIntensity"
      label="Shadow Intensity"
      :min="0"
      :max="20"
      :step="1"
      :display-value="`${customization.shadowIntensity}px`"
      @update:model-value="(v) => customization.setShadow(customization.shadowColor, v)"
    />
  </div>
</template>

<script setup lang="ts">
const customization = useCustomizationStore()

function onGlowColorChange(event: Event) {
  const color = (event.target as HTMLInputElement).value
  customization.setGlow(color, customization.glowIntensity || 10)
}

function onShadowColorChange(event: Event) {
  const color = (event.target as HTMLInputElement).value
  customization.setShadow(color, customization.shadowIntensity || 5)
}
</script>
