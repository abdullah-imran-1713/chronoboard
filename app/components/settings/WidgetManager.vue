<template>
  <div class="flex flex-col gap-5">
    <div class="flex items-center justify-end">
      <button
        type="button"
        class="widget-reset-link border-none bg-transparent p-0 font-ui text-[11px]"
        :class="canResetLayout ? 'cursor-pointer' : 'cursor-default'"
        :style="{
          color: 'var(--color-muted)',
          opacity: canResetLayout ? 1 : 0.35,
        }"
        :disabled="!canResetLayout"
        :title="resetTitle"
        @click="resetPositions"
      >
        Reset layout
      </button>
    </div>

    <div
      v-for="(widgets, category) in visibleCategories"
      :key="category"
      class="flex flex-col gap-2.5"
    >
      <template v-if="widgets.length > 0">
        <p class="settings-subsection-title font-ui m-0">
          {{ categoryLabels[category] }}
        </p>

        <div class="widget-tile-grid" role="group" :aria-label="categoryLabels[category]">
          <button
            v-for="widget in widgets"
            :key="widget.id"
            type="button"
            class="widget-tile"
            :data-on="widgetStore.isEnabled(widget.id) ? 'true' : 'false'"
            :aria-pressed="widgetStore.isEnabled(widget.id)"
            :title="widget.description"
            @click="onTileClick(widget.id, widget.category)"
          >
            <Icon :name="widget.icon" size="22" class="widget-tile-icon" />
            <span class="widget-tile-label">{{ shortLabel(widget.name) }}</span>
          </button>
        </div>
      </template>
    </div>

    <Teleport to="body">
      <Transition name="board-toast">
        <div
          v-if="toastMessage"
          class="board-toast fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 px-3.5 py-2 rounded-lg text-[12px] font-ui pointer-events-none"
          :style="{
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
            border: '1px solid color-mix(in srgb, var(--color-muted) 25%, transparent)',
            boxShadow: '0 8px 28px rgba(0,0,0,.35)',
          }"
          role="status"
        >
          {{ toastMessage }}
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { WidgetCategory } from '../../../types/widget'

const widgetStore = useWidgetStore()
const layoutStore = useLayoutStore()
const { isHidden, onReligiousWidgetToggle, migrateIfNeeded } = useIslamicFeatures()

const toastMessage = ref('')
let toastTimer: ReturnType<typeof setTimeout> | null = null

const categoryLabels: Record<WidgetCategory, string> = {
  time: 'Time',
  productivity: 'Productivity',
  info: 'Info',
  religious: 'Faith',
  system: 'System',
}

const SHORT_LABELS: Record<string, string> = {
  'World Clock': 'World',
  'Pomodoro Timer': 'Pomodoro',
  'Quick Notes': 'Notes',
  'Day Progress': 'Progress',
  'Quote of the Day': 'Quote',
  'Prayer Times': 'Prayer',
  'Quran Verse': 'Quran',
  'Connection Status': 'Network',
}

const visibleCategories = computed(() => {
  const all = widgetStore.widgetsByCategory
  if (!isHidden.value) return all

  const filtered = { ...all }
  filtered.religious = []
  return filtered
})

const canResetLayout = computed(() =>
  widgetStore.activeWidgets.some(w => layoutStore.wasMoved(w.id)),
)

const resetTitle = computed(() => {
  if (widgetStore.activeWidgets.length === 0) return 'Enable a widget first'
  if (!canResetLayout.value) return 'Layout is already default'
  return 'Restore default widget layout'
})

function shortLabel(name: string): string {
  return SHORT_LABELS[name] ?? name
}

function showToast(message: string) {
  toastMessage.value = message
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
    toastTimer = null
  }, 2200)
}

function resetPositions() {
  if (!canResetLayout.value) return
  layoutStore.resetWidgetPositions()
  window.dispatchEvent(new CustomEvent('chronoboard:repack-widgets'))
  showToast('Layout reset')
}

const LOCATION_TOAST = 'Allow location to add Prayer Times'

function onTileClick(id: string, category: WidgetCategory) {
  const next = !widgetStore.isEnabled(id)
  if (category === 'religious') {
    void onReligiousTileClick(id, next)
    return
  }
  widgetStore.setWidgetEnabled(id, next)
}

async function onReligiousTileClick(id: string, next: boolean) {
  const result = await onReligiousWidgetToggle(id, next)
  if (next && id === 'prayer-times' && result === 'location_denied') {
    showToast(LOCATION_TOAST)
  }
}

onMounted(() => {
  migrateIfNeeded()
})

onUnmounted(() => {
  if (toastTimer) clearTimeout(toastTimer)
})
</script>

<style scoped>
.widget-reset-link:not(:disabled):hover {
  color: var(--color-text) !important;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.widget-tile-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

@media (max-width: 380px) {
  .widget-tile-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.widget-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 72px;
  padding: 10px 6px 8px;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--color-muted) 22%, transparent);
  background: color-mix(in srgb, var(--color-bg) 70%, transparent);
  color: var(--color-muted);
  cursor: pointer;
  font-family: inherit;
  transition:
    background 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    transform 0.12s ease;
}

.widget-tile:hover {
  color: var(--color-text);
  border-color: color-mix(in srgb, var(--color-muted) 40%, transparent);
}

.widget-tile:active {
  transform: scale(0.97);
}

.widget-tile[data-on='true'] {
  color: var(--color-text);
  background: color-mix(in srgb, var(--color-primary) 20%, var(--color-bg));
  border-color: color-mix(in srgb, var(--color-primary) 55%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 18%, transparent);
}

.widget-tile[data-on='true'] .widget-tile-icon {
  color: var(--color-primary);
}

.widget-tile-icon {
  display: block;
  flex: none;
}

.widget-tile-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.02em;
  line-height: 1.2;
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.board-toast-enter-active,
.board-toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.board-toast-enter-from,
.board-toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px);
}
</style>
