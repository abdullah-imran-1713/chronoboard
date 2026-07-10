<template>
  <label class="flex items-center justify-between cursor-pointer group">
    <span class="text-sm font-ui" :style="{ color: 'var(--color-text)' }">
      {{ label }}
    </span>
    <button
      type="button"
      role="switch"
      :aria-checked="modelValue"
      :aria-label="label"
      class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200"
      :style="{
        backgroundColor: modelValue ? 'var(--color-primary)' : 'var(--color-muted)',
      }"
      @click="$emit('update:modelValue', !modelValue)"
    >
      <span
        class="inline-block h-4 w-4 transform rounded-full transition-transform duration-200"
        :class="modelValue ? 'translate-x-6' : 'translate-x-1'"
        :style="{ backgroundColor: thumbColor }"
      />
    </button>
  </label>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  label: string
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const themeStore = useThemeStore()

function isLightColor(hex: string): boolean {
  const normalized = hex.replace('#', '')
  const full = normalized.length === 3
    ? normalized.split('').map(c => c + c).join('')
    : normalized.slice(0, 6)
  const r = parseInt(full.slice(0, 2), 16) / 255
  const g = parseInt(full.slice(2, 4), 16) / 255
  const b = parseInt(full.slice(4, 6), 16) / 255
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return luminance > 0.55
}

const thumbColor = computed(() => {
  if (!props.modelValue) {
    return '#4b5563'
  }
  const trackColor = themeStore.activeColors.primary
  return isLightColor(trackColor) ? '#1f2937' : '#ffffff'
})
</script>
