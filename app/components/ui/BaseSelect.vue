<template>
  <div
    ref="rootRef"
    class="base-select font-ui"
    :class="label ? 'base-select--inline' : 'base-select--block'"
  >
    <label
      v-if="label"
      class="base-select-label text-sm flex-none"
      :style="{ color: 'var(--color-text)' }"
    >
      {{ label }}
    </label>

    <div class="base-select-field relative" :class="label ? 'w-[150px]' : 'w-full'">
      <button
        type="button"
        class="cb-field w-full"
        :aria-expanded="isOpen"
        aria-haspopup="listbox"
        :aria-label="label || 'Select option'"
        @click="toggle"
      >
        <span class="truncate">{{ selectedLabel }}</span>
        <Icon name="mdi:chevron-down" size="18" class="opacity-60 flex-none" />
      </button>

      <div
        v-if="isOpen"
        class="cb-dropdown"
        role="listbox"
        :aria-label="label || 'Options'"
      >
        <div class="settings-scroll max-h-[220px] overflow-y-auto py-1">
          <button
            v-for="option in options"
            :key="option.value"
            type="button"
            role="option"
            class="cb-opt w-full px-3 py-[9px] text-left text-sm flex items-center justify-between gap-2 border-none cursor-pointer font-ui"
            :data-sel="option.value === modelValue ? 'true' : 'false'"
            :style="{ color: 'var(--color-text)' }"
            :aria-selected="option.value === modelValue"
            @mousedown.prevent="selectOption(option.value)"
          >
            <span>{{ option.label }}</span>
            <Icon
              v-if="option.value === modelValue"
              name="mdi:check"
              size="16"
              class="flex-none"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  label?: string
  options: { value: string, label: string }[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const rootRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)

const selectedLabel = computed(() => {
  const match = props.options.find(o => o.value === props.modelValue)
  return match?.label ?? props.modelValue
})

function toggle() {
  isOpen.value = !isOpen.value
}

function selectOption(value: string) {
  emit('update:modelValue', value)
  isOpen.value = false
}

function onPointerDownOutside(event: PointerEvent) {
  if (!isOpen.value) return
  const target = event.target
  if (!(target instanceof Node)) return
  if (rootRef.value?.contains(target)) return
  isOpen.value = false
}

onMounted(() => {
  if (!import.meta.client) return
  document.addEventListener('pointerdown', onPointerDownOutside, true)
})

onUnmounted(() => {
  if (!import.meta.client) return
  document.removeEventListener('pointerdown', onPointerDownOutside, true)
})
</script>

<style scoped>
.base-select--inline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.base-select--block {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.base-select-field {
  flex: none;
  min-width: 0;
}
</style>
