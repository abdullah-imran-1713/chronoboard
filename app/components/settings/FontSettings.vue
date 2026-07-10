<template>
  <div class="space-y-3">
    <h3 class="text-sm font-bold font-ui uppercase tracking-wider" :style="{ color: 'var(--color-muted)' }">
      Font
    </h3>

    <FontPicker
      :model-value="customization.fontFamily"
      label="Font Family"
      @update:model-value="(v) => customization.setFont(v)"
    />

    <BaseSlider
      :model-value="fontSizeNumber"
      label="Font Size"
      :min="2"
      :max="16"
      :step="0.5"
      :display-value="`${fontSizeNumber}rem`"
      @update:model-value="(v) => customization.setFontSize(`${v}rem`)"
    />

    <BaseSelect
      :model-value="customization.fontWeight"
      label="Font Weight"
      :options="[
        { value: '300', label: 'Light (300)' },
        { value: '400', label: 'Regular (400)' },
        { value: '600', label: 'SemiBold (600)' },
        { value: '700', label: 'Bold (700)' },
        { value: '800', label: 'ExtraBold (800)' },
      ]"
      @update:model-value="(v) => customization.setFontWeight(v)"
    />
  </div>
</template>

<script setup lang="ts">
const customization = useCustomizationStore()

const fontSizeNumber = computed(() => {
  return parseFloat(customization.fontSize) || 6
})
</script>
