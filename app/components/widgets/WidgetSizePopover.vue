<template>
  <div
    class="widget-size-popover font-ui"
    data-widget-size-popover
    role="dialog"
    aria-label="Widget size"
    :style="panelStyle"
    @pointerdown.stop
    @touchstart.stop
  >
    <div class="widget-size-head">
      <p class="widget-size-label m-0">
        Size
      </p>
      <span class="widget-size-value tabular-nums">
        {{ displayScale }}
      </span>
    </div>

    <div class="widget-size-section">
      <p class="widget-size-caption m-0">
        Preset
      </p>
      <div class="widget-size-track" role="group" aria-label="Size presets">
        <button
          v-for="preset in presets"
          :key="preset"
          type="button"
          class="widget-size-opt"
          :data-active="activePreset === preset ? 'true' : 'false'"
          :aria-pressed="activePreset === preset"
          @pointerdown.stop
          @click.stop="onPreset(preset)"
        >
          {{ preset }}
        </button>
      </div>
    </div>

    <div class="widget-size-section">
      <p class="widget-size-caption m-0">
        Custom
      </p>
      <input
        type="range"
        class="cb-range widget-size-range"
        :min="min"
        :max="max"
        :step="step"
        :value="localValue"
        aria-label="Custom size"
        @pointerdown.stop="onSlidePointerDown"
        @touchstart.stop.passive="onSlidePointerDown"
        @input="onSlideInput"
        @change="onSlideCommit"
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WidgetSizePreset } from '../../../types/settings'
import {
  WIDGET_SIZE_MAX,
  WIDGET_SIZE_MIN,
  WIDGET_SIZE_PRESETS,
  WIDGET_SIZE_SCALE,
  WIDGET_SIZE_STEP,
  clampWidgetScale,
  matchingWidgetSizePreset,
} from '../../../types/settings'

const props = defineProps<{
  modelValue: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
  commit: [value: number]
}>()

const presets = WIDGET_SIZE_PRESETS
const min = WIDGET_SIZE_MIN
const max = WIDGET_SIZE_MAX
const step = WIDGET_SIZE_STEP

/** Local thumb value so the range isn’t fighting parent re-renders mid-drag. */
const localValue = ref(props.modelValue)
const sliding = ref(false)
const pendingCommit = ref(false)

/**
 * Preset click vs custom slide are separate interaction modes:
 * - preset → chip stays active
 * - custom → chips clear for the whole slide gesture
 */
const mode = ref<'preset' | 'custom'>(
  matchingWidgetSizePreset(props.modelValue) ? 'preset' : 'custom',
)
const selectedPreset = ref<WidgetSizePreset | null>(
  matchingWidgetSizePreset(props.modelValue),
)

watch(
  () => props.modelValue,
  (scale) => {
    if (!sliding.value) localValue.value = scale
    if (mode.value === 'preset') {
      selectedPreset.value = matchingWidgetSizePreset(scale)
    }
  },
)

const activePreset = computed(() =>
  mode.value === 'preset' ? selectedPreset.value : null,
)

const displayScale = computed(() => {
  const value = sliding.value ? localValue.value : props.modelValue
  if (mode.value === 'preset' && selectedPreset.value) {
    return `${selectedPreset.value} · ${value.toFixed(2)}×`
  }
  return `${value.toFixed(2)}×`
})

const panelStyle = {
  backgroundColor: 'var(--color-surface)',
  color: 'var(--color-text)',
  border: '1px solid rgba(var(--color-muted-rgb), 0.28)',
  boxShadow: '0 10px 32px rgba(0,0,0,.35)',
}

function onPreset(preset: WidgetSizePreset) {
  sliding.value = false
  pendingCommit.value = false
  mode.value = 'preset'
  selectedPreset.value = preset
  const scale = WIDGET_SIZE_SCALE[preset]
  localValue.value = scale
  emit('update:modelValue', scale)
  emit('commit', scale)
}

function onSlidePointerDown() {
  sliding.value = true
  mode.value = 'custom'
  selectedPreset.value = null
  window.addEventListener('pointerup', onSlideCommit)
  window.addEventListener('pointercancel', onSlideCommit)
}

function onSlideInput(event: Event) {
  sliding.value = true
  pendingCommit.value = true
  mode.value = 'custom'
  selectedPreset.value = null
  const value = clampWidgetScale(Number((event.target as HTMLInputElement).value))
  localValue.value = value
  emit('update:modelValue', value)
}

function onSlideCommit() {
  window.removeEventListener('pointerup', onSlideCommit)
  window.removeEventListener('pointercancel', onSlideCommit)
  if (!pendingCommit.value && !sliding.value) return
  const shouldCommit = pendingCommit.value
  sliding.value = false
  pendingCommit.value = false
  if (shouldCommit) emit('commit', localValue.value)
}

onUnmounted(() => {
  window.removeEventListener('pointerup', onSlideCommit)
  window.removeEventListener('pointercancel', onSlideCommit)
})
</script>

<style scoped>
.widget-size-popover {
  position: absolute;
  top: 34px;
  left: 8px;
  z-index: 6;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 176px;
  padding: 11px;
  border-radius: 12px;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}

.widget-size-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.widget-size-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-muted);
  line-height: 1;
}

.widget-size-value {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text);
  line-height: 1;
  opacity: 0.85;
}

.widget-size-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.widget-size-caption {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-muted);
  line-height: 1;
  opacity: 0.9;
}

.widget-size-track {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px;
  border-radius: 999px;
  background: rgba(var(--color-muted-rgb), 0.14);
  border: 1px solid rgba(var(--color-muted-rgb), 0.2);
}

.widget-size-opt {
  flex: 1;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1;
  padding: 7px 0;
  border-radius: 999px;
  color: var(--color-muted);
  background: transparent;
  transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
  touch-action: manipulation;
}

.widget-size-opt:hover {
  color: var(--color-text);
}

.widget-size-opt[data-active='true'] {
  color: var(--color-text);
  background: rgba(var(--color-primary-rgb), 0.22);
  box-shadow: 0 0 0 1px rgba(var(--color-primary-rgb), 0.35);
}

.widget-size-range {
  width: 100%;
  margin: 0;
  display: block;
  touch-action: none;
  cursor: pointer;
}
</style>
