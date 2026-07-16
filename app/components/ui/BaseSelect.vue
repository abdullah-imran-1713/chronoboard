<template>
  <div class="flex items-center justify-between gap-3">
    <label
      v-if="label"
      class="text-sm font-ui flex-none"
      :style="{ color: 'var(--color-text)' }"
    >
      {{ label }}
    </label>
    <select
      :value="modelValue"
      class="cb-select"
      :class="label ? 'w-[150px]' : 'w-full'"
      :aria-label="label"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
  label?: string
  options: { value: string, label: string }[]
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
