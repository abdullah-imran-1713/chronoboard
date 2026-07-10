<template>
  <div ref="rootRef" class="relative">
    <label
      v-if="label"
      class="block text-sm font-ui mb-1"
      :style="{ color: 'var(--color-text)' }"
    >
      {{ label }}
    </label>

    <div class="relative">
      <input
        ref="inputRef"
        v-model="searchQuery"
        type="text"
        class="w-full px-3 py-2 rounded-lg text-sm font-ui border-none outline-none"
        :style="{
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text)',
          fontFamily: isOpen ? 'var(--font-ui)' : modelValue,
        }"
        :placeholder="isOpen ? 'Search fonts...' : 'Select font'"
        :aria-expanded="isOpen"
        aria-haspopup="listbox"
        :aria-label="label || 'Font family'"
        @focus="openDropdown"
        @input="openDropdown"
      >

      <button
        type="button"
        class="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded opacity-60 hover:opacity-100"
        :style="{ color: 'var(--color-text)' }"
        aria-label="Toggle font list"
        @click.stop="toggleDropdown"
      >
        <Icon :name="isOpen ? 'mdi:chevron-up' : 'mdi:chevron-down'" size="18" />
      </button>
    </div>

    <div
      v-if="isOpen"
      class="absolute z-50 mt-1 w-full max-h-56 overflow-y-auto rounded-lg shadow-lg border"
      :style="{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-muted)',
      }"
      role="listbox"
    >
      <button
        v-for="font in filteredFonts"
        :key="font.family"
        type="button"
        role="option"
        class="w-full px-3 py-2 text-left text-sm transition-opacity hover:opacity-80"
        :style="{
          fontFamily: font.family,
          color: 'var(--color-text)',
          backgroundColor: font.family === modelValue ? 'var(--color-bg)' : 'transparent',
        }"
        :aria-selected="font.family === modelValue"
        @mousedown.prevent="selectFont(font.family)"
      >
        {{ font.label }}
      </button>

      <p
        v-if="filteredFonts.length === 0"
        class="px-3 py-4 text-sm text-center font-ui"
        :style="{ color: 'var(--color-muted)' }"
      >
        No fonts match "{{ searchQuery }}"
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CLOCK_FONTS, filterFonts, getFontLabel, loadGoogleFontForFamily } from '../../../utils/fonts'

const props = defineProps<{
  modelValue: string
  label?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const rootRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const isOpen = ref(false)
const searchQuery = ref('')

const filteredFonts = computed(() => filterFonts(searchQuery.value))

function openDropdown() {
  isOpen.value = true
  searchQuery.value = ''
  nextTick(() => inputRef.value?.focus())
}

function toggleDropdown() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    searchQuery.value = ''
    nextTick(() => inputRef.value?.focus())
  } else {
    syncInputToSelection()
  }
}

function selectFont(family: string) {
  loadGoogleFontForFamily(family)
  emit('update:modelValue', family)
  closeDropdown()
}

function closeDropdown() {
  isOpen.value = false
  syncInputToSelection()
}

function syncInputToSelection() {
  searchQuery.value = getFontLabel(props.modelValue)
}

function onClickOutside(event: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

watch(() => props.modelValue, () => {
  if (!isOpen.value) {
    syncInputToSelection()
  }
}, { immediate: true })

onMounted(() => {
  document.addEventListener('mousedown', onClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', onClickOutside)
})
</script>
