<template>
  <div class="flex flex-col gap-3.5">
    <h3 class="settings-section-title font-ui">
      Effects
    </h3>

    <div class="flex items-center justify-between gap-3">
      <span class="text-sm font-ui" :style="{ color: 'var(--color-text)' }">Glow color</span>
      <input
        type="color"
        class="cb-color w-24"
        :value="customization.glowColor === 'transparent' ? '#ffffff' : customization.glowColor"
        @input="onGlowColorChange"
      >
    </div>

    <BaseSlider
      :model-value="customization.glowIntensity"
      label="Glow intensity"
      compact-value
      :min="0"
      :max="50"
      :step="1"
      :display-value="`${customization.glowIntensity}`"
      @update:model-value="(v) => customization.setGlow(safeGlowColor, v)"
    />

    <div class="flex items-center justify-between gap-3">
      <span class="text-sm font-ui" :style="{ color: 'var(--color-text)' }">Shadow color</span>
      <input
        type="color"
        class="cb-color w-24"
        :value="customization.shadowColor === 'transparent' ? '#000000' : customization.shadowColor"
        @input="onShadowColorChange"
      >
    </div>

    <BaseSlider
      :model-value="customization.shadowIntensity"
      label="Shadow intensity"
      compact-value
      :min="0"
      :max="60"
      :step="1"
      :display-value="`${customization.shadowIntensity}`"
      @update:model-value="(v) => customization.setShadow(safeShadowColor, v)"
    />
  </div>
</template>

<script setup lang="ts">
const customization = useCustomizationStore()

const safeGlowColor = computed(() =>
  customization.glowColor === 'transparent' ? '#ffffff' : customization.glowColor,
)

const safeShadowColor = computed(() =>
  customization.shadowColor === 'transparent' ? '#000000' : customization.shadowColor,
)

function onGlowColorChange(event: Event) {
  const color = (event.target as HTMLInputElement).value
  customization.setGlow(color, customization.glowIntensity || 10)
}

function onShadowColorChange(event: Event) {
  const color = (event.target as HTMLInputElement).value
  customization.setShadow(color, customization.shadowIntensity || 5)
}
</script>
