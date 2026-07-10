<template>
  <div>
    <div class="flex justify-between items-center mb-1">
      <label class="text-sm font-ui" :style="{ color: 'var(--color-text)' }">
        {{ label }}
      </label>
      <span class="text-xs font-ui" :style="{ color: 'var(--color-muted)' }">
        {{ displayValue }}
      </span>
    </div>
    <input
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :value="modelValue"
      class="w-full accent-white"
      :aria-label="label"
      @input="$emit('update:modelValue', Number(($event.target as HTMLInputElement).value))"
    >
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: number
  label: string
  min: number
  max: number
  step?: number
  displayValue?: string
}>()

defineEmits<{
  'update:modelValue': [value: number]
}>()
</script>
