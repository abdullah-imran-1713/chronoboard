<template>
  <div ref="rootRef" class="relative">
    <label
      v-if="label"
      class="block text-sm font-ui mb-1.5"
      :style="{ color: 'var(--color-text)' }"
    >
      {{ label }}
    </label>

    <div class="flex items-center gap-1.5">
      <button
        type="button"
        class="cb-field flex-1 min-w-0"
        :aria-expanded="isOpen"
        aria-haspopup="listbox"
        :aria-label="label || 'Font family'"
        @click="toggleDropdown"
      >
        <span class="truncate" :style="{ fontFamily: modelValue }">
          {{ selectedLabel }}
        </span>
        <Icon name="mdi:chevron-down" size="18" class="opacity-60 flex-none" />
      </button>

      <button
        type="button"
        class="cb-icobtn font-random-btn flex-none w-[38px] h-[38px] rounded-lg border-none flex items-center justify-center cursor-pointer"
        :style="{ backgroundColor: 'var(--color-bg)' }"
        title="Random font"
        aria-label="Pick a random font"
        @click="pickRandom"
      >
        <Icon
          name="mdi:dice-5"
          size="18"
          class="font-random-icon"
          :class="{ 'font-random-icon--spin': diceSpinning }"
        />
      </button>
    </div>

    <div
      v-if="isOpen"
      class="cb-dropdown"
      role="listbox"
    >
      <div class="p-2 border-b" :style="{ borderColor: 'color-mix(in srgb, var(--color-muted) 20%, transparent)' }">
        <div
          class="flex items-center gap-2 rounded-md px-2.5 py-[7px]"
          :style="{ backgroundColor: 'var(--color-bg)' }"
        >
          <Icon name="mdi:magnify" size="16" class="opacity-60 flex-none" :style="{ color: 'var(--color-text)' }" />
          <input
            ref="inputRef"
            v-model="searchQuery"
            type="text"
            placeholder="Search fonts"
            class="flex-1 bg-transparent border-none outline-none text-[13px] font-ui"
            :style="{ color: 'var(--color-text)' }"
            @keydown.escape.stop="closeDropdown"
          >
        </div>
      </div>

      <div class="settings-scroll max-h-[200px] overflow-y-auto py-1">
        <button
          v-for="font in filteredFonts"
          :key="font.family"
          type="button"
          role="option"
          class="cb-opt w-full px-3 py-[9px] text-left text-sm flex items-center justify-between gap-2 border-none cursor-pointer font-ui"
          :data-sel="font.family === modelValue ? 'true' : 'false'"
          :style="{
            fontFamily: font.family,
            color: 'var(--color-text)',
          }"
          :aria-selected="font.family === modelValue"
          @mousedown.prevent="selectFont(font.family)"
        >
          <span>{{ font.label }}</span>
          <Icon
            v-if="font.family === modelValue"
            name="mdi:check"
            size="16"
            class="flex-none"
          />
        </button>

        <p
          v-if="filteredFonts.length === 0"
          class="px-3 py-[22px] text-[13px] text-center font-ui"
          :style="{ color: 'var(--color-muted)' }"
        >
          No fonts found
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  filterFonts,
  getFontLabel,
  loadGoogleFontForFamily,
  pickRandomFontFamily,
} from '../../../utils/fonts'

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
const diceSpinning = ref(false)
let diceSpinTimer: ReturnType<typeof setTimeout> | null = null

const filteredFonts = computed(() => filterFonts(searchQuery.value))
const selectedLabel = computed(() => getFontLabel(props.modelValue) || props.modelValue)

function openDropdown() {
  isOpen.value = true
  searchQuery.value = ''
  nextTick(() => inputRef.value?.focus())
}

function toggleDropdown() {
  if (isOpen.value) {
    closeDropdown()
  }
  else {
    openDropdown()
  }
}

function selectFont(family: string) {
  loadGoogleFontForFamily(family)
  emit('update:modelValue', family)
  closeDropdown()
}

function pickRandom() {
  const family = pickRandomFontFamily(props.modelValue)
  loadGoogleFontForFamily(family)
  emit('update:modelValue', family)
  closeDropdown()

  diceSpinning.value = false
  // Retrigger CSS animation
  requestAnimationFrame(() => {
    diceSpinning.value = true
  })
  if (diceSpinTimer) clearTimeout(diceSpinTimer)
  diceSpinTimer = setTimeout(() => {
    diceSpinning.value = false
    diceSpinTimer = null
  }, 420)
}

function closeDropdown() {
  isOpen.value = false
  searchQuery.value = ''
}

function onClickOutside(event: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('mousedown', onClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', onClickOutside)
  if (diceSpinTimer) clearTimeout(diceSpinTimer)
})
</script>

<style scoped>
.font-random-btn {
  color: var(--color-muted);
}

.font-random-btn:hover {
  opacity: 1;
  color: var(--color-text);
}

.font-random-icon {
  display: block;
}

.font-random-icon--spin {
  animation: font-dice-spin 0.4s ease;
}

@keyframes font-dice-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
