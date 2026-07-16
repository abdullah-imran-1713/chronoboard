<template>
  <label class="flex items-center justify-between gap-3 cursor-pointer">
    <span class="text-sm font-ui" :style="{ color: 'var(--color-text)' }">
      {{ label }}
    </span>
    <button
      type="button"
      role="switch"
      class="cb-tog"
      :data-on="modelValue ? 'true' : 'false'"
      :aria-checked="modelValue"
      :aria-label="label"
      @click="$emit('update:modelValue', !modelValue)"
    >
      <span class="cb-thumb" />
    </button>
  </label>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
  label: string
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>
