<template>
  <div class="flex items-center gap-3">
    <label
      class="text-sm font-ui flex-none"
      :class="compactValue ? 'w-24' : undefined"
      :style="{ color: 'var(--color-text)' }"
    >
      {{ label }}
    </label>
    <input
      type="range"
      class="cb-range"
      :min="min"
      :max="max"
      :step="step"
      :value="modelValue"
      :aria-label="label"
      @input="$emit('update:modelValue', Number(($event.target as HTMLInputElement).value))"
    >
    <span
      class="text-xs font-ui flex-none text-right tabular-nums"
      :class="compactValue ? 'w-7' : 'w-[42px]'"
      :style="{ color: 'var(--color-muted)' }"
    >
      {{ displayValue ?? modelValue }}
    </span>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  modelValue: number
  label: string
  min: number
  max: number
  step?: number
  displayValue?: string
  compactValue?: boolean
}>(), {
  step: 1,
  compactValue: false,
})

defineEmits<{
  'update:modelValue': [value: number]
}>()
</script>
