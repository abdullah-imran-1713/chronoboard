<template>
  <div class="flex flex-col gap-3.5">
    <h3 class="settings-section-title font-ui">
      Font
    </h3>

    <FontPicker
      :model-value="customization.fontFamily"
      @update:model-value="(v) => customization.setFont(v)"
    />

    <BaseSlider
      :model-value="fontSizeNumber"
      label="Size"
      :min="2"
      :max="16"
      :step="0.5"
      :display-value="`${fontSizeNumber}rem`"
      @update:model-value="(v) => customization.setFontSize(`${v}rem`)"
    />

    <BaseSelect
      :model-value="customization.fontWeight"
      label="Weight"
      :options="weightOptions"
      @update:model-value="(v) => customization.setFontWeight(v)"
    />
  </div>
</template>

<script setup lang="ts">
const customization = useCustomizationStore()

const fontSizeNumber = computed(() => {
  return parseFloat(customization.fontSize) || 6
})

const weightOptions = [
  { value: '200', label: '200 · Thin' },
  { value: '300', label: '300 · Light' },
  { value: '400', label: '400 · Regular' },
  { value: '500', label: '500 · Medium' },
  { value: '600', label: '600 · Semibold' },
  { value: '700', label: '700 · Bold' },
  { value: '800', label: '800 · Heavy' },
]
</script>
