<template>
  <div>
    <label class="block text-sm font-ui mb-1" :style="{ color: 'var(--color-text)' }">
      {{ label }}
    </label>
    <select
      :value="modelValue"
      class="w-full px-3 py-2 rounded-lg text-sm font-ui border-none outline-none"
      :style="{
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-text)',
      }"
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
  label: string
  options: { value: string, label: string }[]
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
