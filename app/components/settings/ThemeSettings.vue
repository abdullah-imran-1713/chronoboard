<template>
  <div class="flex flex-col gap-3.5">
    <h3 class="settings-section-title font-ui">
      Theme
    </h3>

    <div class="grid grid-cols-2 gap-2">
      <button
        v-for="theme in themes"
        :key="theme.name"
        type="button"
        class="cb-chip"
        :data-sel="themeStore.currentTheme === theme.name ? 'true' : 'false'"
        @click="themeStore.setTheme(theme.name)"
      >
        <span
          class="w-full h-[22px] rounded"
          :style="{ background: theme.preview }"
        />
        <span class="text-[11px]">{{ theme.label }}</span>
      </button>
    </div>

    <p
      v-if="themeStore.currentTheme === 'system'"
      class="text-xs font-ui leading-relaxed"
      :style="{ color: 'var(--color-muted)' }"
    >
      Follows your device appearance. Currently {{ themeStore.resolvedScheme }}.
    </p>

    <template v-if="themeStore.currentTheme === 'custom'">
      <!-- Built-in presets carousel -->
      <div class="flex flex-col gap-2.5 mt-0.5">
        <p class="settings-subsection-title font-ui">
          Presets
        </p>

        <div class="flex items-center gap-1">
          <button
            type="button"
            class="cb-icobtn flex-none w-7 h-7 rounded-lg border-none bg-transparent flex items-center justify-center cursor-pointer disabled:opacity-25 disabled:cursor-default"
            :style="{ color: 'var(--color-muted)' }"
            :disabled="presetPage <= 0 || isSliding"
            aria-label="Previous presets"
            @click="goPresetPage(presetPage - 1)"
          >
            <Icon name="mdi:chevron-left" size="20" />
          </button>

          <div
            class="preset-viewport flex-1 min-w-0 overflow-hidden"
            @pointerdown="builtinSwipe.onPointerDown"
            @pointermove="builtinSwipe.onPointerMove"
            @pointerup="builtinSwipe.onPointerUp"
            @pointercancel="builtinSwipe.onPointerCancel"
            @click.capture="builtinSwipe.onClickCapture"
          >
            <div
              class="preset-track flex"
              :class="{ 'preset-track--animate': animateSlide }"
              :style="{ transform: `translate3d(-${presetPage * 100}%, 0, 0)` }"
              @transitionend="onSlideEnd"
            >
              <div
                v-for="(page, pageIndex) in presetPages"
                :key="pageIndex"
                class="preset-page grid grid-cols-3 gap-2"
              >
                <CbHint
                  v-for="palette in page"
                  :key="palette.id"
                  layout="fill"
                  :text="palette.name"
                >
                  <button
                    type="button"
                    class="preset-sw"
                    @click="themeStore.applyPalette(palette)"
                  >
                    <span
                      class="preset-sw-pill w-full h-7 rounded-full overflow-hidden flex"
                      :data-sel="isBuiltinActive(palette) ? 'true' : 'false'"
                    >
                      <span class="flex-[1.4]" :style="{ backgroundColor: palette.colors.bg }" />
                      <span class="flex-1" :style="{ backgroundColor: palette.colors.surface }" />
                      <span class="w-2.5 flex-none" :style="{ backgroundColor: palette.colors.primary }" />
                    </span>
                    <span
                      class="text-[10px] leading-tight text-center"
                      :style="{ color: isBuiltinActive(palette) ? 'var(--color-text)' : 'var(--color-muted)' }"
                    >
                      {{ palette.name }}
                    </span>
                  </button>
                </CbHint>
              </div>
            </div>
          </div>

          <button
            type="button"
            class="cb-icobtn flex-none w-7 h-7 rounded-lg border-none bg-transparent flex items-center justify-center cursor-pointer disabled:opacity-25 disabled:cursor-default"
            :style="{ color: 'var(--color-muted)' }"
            :disabled="presetPage >= presetPageCount - 1 || isSliding"
            aria-label="Next presets"
            @click="goPresetPage(presetPage + 1)"
          >
            <Icon name="mdi:chevron-right" size="20" />
          </button>
        </div>
      </div>

      <!-- Custom color fields + save -->
      <div class="flex flex-col gap-2.5">
        <div class="flex items-center justify-between gap-2">
          <p class="settings-subsection-title font-ui">
            Colors
          </p>
          <CbHint
            :text="editId ? 'Finish editing to save a new preset' : saveButtonTitle"
            :blocked="!canSavePreset || !!editId"
          >
            <button
              type="button"
              class="cb-icobtn flex items-center gap-1 rounded-full px-2.5 py-1 border-none cursor-pointer disabled:opacity-35 disabled:cursor-default"
              :style="{
                color: 'var(--color-text)',
                background: 'rgba(var(--color-muted-rgb), 0.22)',
              }"
              :disabled="!canSavePreset || !!editId"
              aria-label="Save as preset"
              @click="openSaveForm"
            >
              <Icon name="mdi:plus" size="16" />
              <span class="text-[11px] font-semibold">Save</span>
            </button>
          </CbHint>
        </div>

        <p
          v-if="editId"
          class="text-[11px] font-ui m-0"
          :style="{ color: 'var(--color-muted)' }"
        >
          Editing “{{ editName || 'preset' }}” — adjust colors, then update below.
        </p>

        <div
          v-if="saveOpen"
          class="flex flex-col gap-2 rounded-lg p-3"
          :style="{ backgroundColor: 'var(--color-bg)' }"
        >
          <label class="text-[11px]" :style="{ color: 'var(--color-muted)' }">
            Preset name
          </label>
          <input
            ref="saveInputRef"
            v-model="saveName"
            type="text"
            maxlength="24"
            placeholder="My warm desk"
            class="w-full px-3 py-2 rounded-lg text-sm font-ui border-none outline-none"
            :style="{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }"
            @keydown.enter="confirmSave"
            @keydown.escape="saveOpen = false"
          >
          <div class="flex items-center justify-end gap-3 pt-0.5">
            <button
              type="button"
              class="preset-mini-btn preset-mini-btn--ghost"
              @click="saveOpen = false"
            >
              Cancel
            </button>
            <button
              type="button"
              class="preset-mini-btn preset-mini-btn--primary"
              @click="confirmSave"
            >
              Save
            </button>
          </div>
          <p v-if="saveError" class="text-[11px]" :style="{ color: '#ef4444' }">
            {{ saveError }}
          </p>
        </div>

        <div class="grid grid-cols-2 gap-2.5">
          <div
            v-for="field in customColorFields"
            :key="field.key"
            class="flex flex-col gap-[5px]"
          >
            <span class="text-[11px]" :style="{ color: 'var(--color-muted)' }">
              {{ field.label }}
            </span>
            <input
              type="color"
              class="cb-color"
              :value="themeStore.customColors[field.key]"
              @input="onCustomColorChange(field.key, $event)"
            >
          </div>
        </div>
      </div>

      <!-- My presets (same carousel language as built-in) -->
      <div
        class="flex flex-col gap-2.5"
        :class="{ 'opacity-45': presetsStore.userPresets.length === 0 }"
      >
        <div class="flex items-center gap-1.5">
          <p class="settings-subsection-title font-ui m-0">
            My presets
          </p>
          <CbHint
            v-if="presetsStore.userPresets.length === 0"
            text="Save colors to keep a combo on this device."
            mode="info"
          >
            <button
              type="button"
              class="cb-icobtn w-5 h-5 rounded border-none bg-transparent flex items-center justify-center cursor-default p-0"
              :style="{ color: 'var(--color-muted)' }"
              aria-label="About my presets"
            >
              <Icon name="mdi:information-outline" size="14" />
            </button>
          </CbHint>
        </div>

        <p
          v-if="presetsStore.userPresets.length === 0"
          class="text-[11px] font-ui"
          :style="{ color: 'var(--color-muted)' }"
        >
          Empty
        </p>

        <!-- 1–3: no arrows · left → center → right -->
        <div
          v-else-if="!showMyArrows"
          class="grid grid-cols-3 gap-2"
        >
          <div
            v-for="preset in presetsStore.userPresets"
            :key="preset.id"
            class="relative group"
          >
            <CbHint layout="fill" :text="preset.name">
              <button
                type="button"
                class="preset-sw w-full"
                @click="themeStore.applyCustomColors(preset.colors)"
              >
                <span
                  class="preset-sw-pill w-full h-7 rounded-full overflow-hidden flex"
                  :data-sel="isUserActive(preset) || editId === preset.id ? 'true' : 'false'"
                  :data-edit="editId === preset.id ? 'true' : undefined"
                >
                  <span class="flex-[1.4]" :style="{ backgroundColor: preset.colors.bg }" />
                  <span class="flex-1" :style="{ backgroundColor: preset.colors.surface }" />
                  <span class="w-2.5 flex-none" :style="{ backgroundColor: preset.colors.primary }" />
                </span>
                <span
                  class="text-[10px] leading-tight text-center line-clamp-1 w-full"
                  :style="{ color: isUserActive(preset) ? 'var(--color-text)' : 'var(--color-muted)' }"
                >
                  {{ preset.name }}
                </span>
              </button>
            </CbHint>

            <div
              class="preset-actions absolute -top-1 -right-1 flex gap-0.5 transition-opacity"
              :class="editId === preset.id || isCoarse
                ? 'opacity-100'
                : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100'"
            >
              <CbHint text="Edit preset">
                <button
                  type="button"
                  class="w-5 h-5 rounded-full flex items-center justify-center border-none cursor-pointer"
                  :style="{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }"
                  aria-label="Edit preset"
                  @click.stop="startEdit(preset)"
                >
                  <Icon name="mdi:pencil" size="11" />
                </button>
              </CbHint>
              <CbHint text="Delete preset">
                <button
                  type="button"
                  class="w-5 h-5 rounded-full flex items-center justify-center border-none cursor-pointer"
                  :style="{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }"
                  aria-label="Delete preset"
                  @click.stop="askDeletePreset(preset)"
                >
                  <Icon name="mdi:close" size="12" />
                </button>
              </CbHint>
            </div>
          </div>
        </div>

        <!-- 4+: arrows · last page centers 1 or 2 leftovers -->
        <div
          v-else
          class="flex items-center gap-1"
        >
          <button
            type="button"
            class="cb-icobtn flex-none w-7 h-7 rounded-lg border-none bg-transparent flex items-center justify-center cursor-pointer disabled:opacity-25 disabled:cursor-default"
            :style="{ color: 'var(--color-muted)' }"
            :disabled="myPage <= 0 || mySliding"
            aria-label="Previous my presets"
            @click="goMyPage(myPage - 1)"
          >
            <Icon name="mdi:chevron-left" size="20" />
          </button>

          <div
            class="preset-viewport flex-1 min-w-0 overflow-hidden"
            @pointerdown="mySwipe.onPointerDown"
            @pointermove="mySwipe.onPointerMove"
            @pointerup="mySwipe.onPointerUp"
            @pointercancel="mySwipe.onPointerCancel"
            @click.capture="mySwipe.onClickCapture"
          >
            <div
              class="preset-track flex"
              :class="{ 'preset-track--animate': myAnimate }"
              :style="{ transform: `translate3d(-${myPage * 100}%, 0, 0)` }"
              @transitionend="onMySlideEnd"
            >
              <div
                v-for="(page, pageIndex) in myPages"
                :key="pageIndex"
                class="preset-page"
                :class="page.length === 3 ? 'grid grid-cols-3 gap-2' : 'flex justify-center gap-2'"
              >
                <div
                  v-for="preset in page"
                  :key="preset.id"
                  class="relative group"
                  :class="page.length < 3 ? 'preset-slot' : undefined"
                >
                  <CbHint layout="fill" :text="preset.name">
                    <button
                      type="button"
                      class="preset-sw w-full"
                      @click="themeStore.applyCustomColors(preset.colors)"
                    >
                      <span
                        class="preset-sw-pill w-full h-7 rounded-full overflow-hidden flex"
                        :data-sel="isUserActive(preset) || editId === preset.id ? 'true' : 'false'"
                        :data-edit="editId === preset.id ? 'true' : undefined"
                      >
                        <span class="flex-[1.4]" :style="{ backgroundColor: preset.colors.bg }" />
                        <span class="flex-1" :style="{ backgroundColor: preset.colors.surface }" />
                        <span class="w-2.5 flex-none" :style="{ backgroundColor: preset.colors.primary }" />
                      </span>
                      <span
                        class="text-[10px] leading-tight text-center line-clamp-1 w-full"
                        :style="{ color: isUserActive(preset) ? 'var(--color-text)' : 'var(--color-muted)' }"
                      >
                        {{ preset.name }}
                      </span>
                    </button>
                  </CbHint>

                  <div
                    class="preset-actions absolute -top-1 -right-1 flex gap-0.5 transition-opacity"
                    :class="editId === preset.id || isCoarse
                      ? 'opacity-100'
                      : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100'"
                  >
                    <CbHint text="Edit preset">
                      <button
                        type="button"
                        class="w-5 h-5 rounded-full flex items-center justify-center border-none cursor-pointer"
                        :style="{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }"
                        aria-label="Edit preset"
                        @click.stop="startEdit(preset)"
                      >
                        <Icon name="mdi:pencil" size="11" />
                      </button>
                    </CbHint>
                    <CbHint text="Delete preset">
                      <button
                        type="button"
                        class="w-5 h-5 rounded-full flex items-center justify-center border-none cursor-pointer"
                        :style="{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }"
                        aria-label="Delete preset"
                        @click.stop="askDeletePreset(preset)"
                      >
                        <Icon name="mdi:close" size="12" />
                      </button>
                    </CbHint>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            class="cb-icobtn flex-none w-7 h-7 rounded-lg border-none bg-transparent flex items-center justify-center cursor-pointer disabled:opacity-25 disabled:cursor-default"
            :style="{ color: 'var(--color-muted)' }"
            :disabled="myPage >= myPageCount - 1 || mySliding"
            aria-label="Next my presets"
            @click="goMyPage(myPage + 1)"
          >
            <Icon name="mdi:chevron-right" size="20" />
          </button>
        </div>

        <div
          v-if="editId"
          class="flex flex-col gap-2 rounded-lg p-3 opacity-100"
          :style="{ backgroundColor: 'var(--color-bg)' }"
        >
          <label class="text-[11px]" :style="{ color: 'var(--color-muted)' }">
            Preset name
          </label>
          <input
            ref="editInputRef"
            v-model="editName"
            type="text"
            maxlength="24"
            class="w-full px-3 py-2 rounded-lg text-sm font-ui border-none outline-none"
            :style="{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }"
            @keydown.enter="confirmEdit"
            @keydown.escape="cancelEdit"
          >
          <div class="flex items-center justify-end gap-3 pt-0.5">
            <button
              type="button"
              class="preset-mini-btn preset-mini-btn--ghost"
              @click="cancelEdit"
            >
              Cancel
            </button>
            <button
              type="button"
              class="preset-mini-btn preset-mini-btn--primary"
              @click="confirmEdit"
            >
              Update
            </button>
          </div>
          <p v-if="editError" class="text-[11px]" :style="{ color: '#ef4444' }">
            {{ editError }}
          </p>
        </div>
      </div>

      <div class="flex items-center justify-end gap-2 pt-1">
        <CbHint
          :text="presetsStore.hasUserPresets ? 'Export my presets' : 'Save a preset first to export'"
          :blocked="!presetsStore.hasUserPresets"
        >
          <button
            type="button"
            class="preset-io-btn"
            :disabled="!presetsStore.hasUserPresets"
            @click="exportPresets"
          >
            Export
          </button>
        </CbHint>
        <button
          type="button"
          class="preset-io-btn"
          @click="importInputRef?.click()"
        >
          Import
        </button>
        <input
          ref="importInputRef"
          type="file"
          accept="application/json,.json"
          class="hidden"
          @change="onImportFile"
        >
      </div>
    </template>

    <Teleport to="body">
      <Transition name="preset-toast">
        <div
          v-if="toastMessage"
          class="preset-toast fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 px-3.5 py-2 rounded-lg text-[12px] font-ui pointer-events-none"
          :style="{
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
            border: '1px solid rgba(var(--color-muted-rgb), 0.25)',
            boxShadow: '0 8px 28px rgba(0,0,0,.35)',
          }"
          role="status"
        >
          {{ toastMessage }}
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="settings-scrim">
        <div
          v-if="pendingDelete"
          class="fixed inset-0 z-[70] flex items-center justify-center p-4"
          data-confirm-dialog
        >
          <button
            type="button"
            class="absolute inset-0 bg-black/55 border-none cursor-default"
            aria-label="Cancel"
            @click="cancelDeletePreset"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-preset-title"
            aria-describedby="delete-preset-desc"
            class="relative w-full max-w-sm rounded-xl p-6 font-ui shadow-2xl"
            :style="{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              border: '1px solid rgba(var(--color-muted-rgb), 0.2)',
            }"
            @keydown.escape.stop="cancelDeletePreset"
          >
            <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-2">
                <p
                  class="text-[11px] font-bold uppercase tracking-[0.12em] m-0"
                  :style="{ color: 'var(--color-muted)' }"
                >
                  My presets
                </p>
                <h2
                  id="delete-preset-title"
                  class="text-lg font-bold tracking-tight m-0"
                >
                  Delete preset?
                </h2>
                <p
                  id="delete-preset-desc"
                  class="text-sm leading-relaxed m-0"
                  :style="{ color: 'var(--color-secondary)' }"
                >
                  Remove “{{ pendingDelete.name }}”? This can’t be undone.
                </p>
              </div>

              <div class="flex flex-col gap-2.5 pt-1">
                <button
                  type="button"
                  class="cb-btn-primary w-full"
                  @click="confirmDeletePreset"
                >
                  Delete
                </button>
                <button
                  type="button"
                  class="cb-btn-muted w-full"
                  @click="cancelDeletePreset"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { ThemeColors, ThemeName, UserColorPreset } from '../../../types/theme'
import { MAX_USER_PRESETS } from '../../../types/theme'
import {
  COLOR_PALETTES,
  PRESET_PAGE_SIZE,
  isPaletteActive,
  type ColorPalette,
} from '../../../utils/palettes'

const themeStore = useThemeStore()
const presetsStore = usePresetsStore()
const { isCoarse } = useCoarsePointer()

const presetPage = ref(0)
const animateSlide = ref(false)
const isSliding = ref(false)

const myPage = ref(0)
const myAnimate = ref(false)
const mySliding = ref(false)

const saveOpen = ref(false)
const saveName = ref('')
const saveError = ref('')
const saveInputRef = ref<HTMLInputElement | null>(null)

const editId = ref<string | null>(null)
const editName = ref('')
const editError = ref('')
const editInputRef = ref<HTMLInputElement | null>(null)
let editRestoreColors: ThemeColors | null = null

const importInputRef = ref<HTMLInputElement | null>(null)
const toastMessage = ref('')
let toastTimer: ReturnType<typeof setTimeout> | null = null
const pendingDelete = ref<UserColorPreset | null>(null)

const themes: { name: ThemeName, label: string, preview: string }[] = [
  { name: 'dark', label: 'Dark', preview: '#0a0a0a' },
  { name: 'light', label: 'Light', preview: '#f5f5f5' },
  {
    name: 'system',
    label: 'System',
    preview: 'linear-gradient(90deg, #0a0a0a 50%, #f5f5f5 50%)',
  },
  {
    name: 'custom',
    label: 'Custom',
    preview: 'repeating-linear-gradient(45deg, #333 0 3px, #555 3px 6px)',
  },
]

const customColorFields: { key: keyof ThemeColors, label: string }[] = [
  { key: 'primary', label: 'Primary' },
  { key: 'secondary', label: 'Secondary' },
  { key: 'bg', label: 'Background' },
  { key: 'surface', label: 'Surface' },
  { key: 'text', label: 'Text' },
  { key: 'muted', label: 'Muted' },
]

const matchesExistingPreset = computed(() => {
  const colors = themeStore.customColors
  const matchesBuiltin = COLOR_PALETTES.some(p => isPaletteActive(p, colors))
  const matchesUser = presetsStore.userPresets.some(p => presetsStore.isActive(p, colors))
  return matchesBuiltin || matchesUser
})

const canSavePreset = computed(() =>
  presetsStore.canSaveMore && !matchesExistingPreset.value,
)

const saveButtonTitle = computed(() => {
  if (!presetsStore.canSaveMore) return `Preset limit reached (${MAX_USER_PRESETS})`
  if (matchesExistingPreset.value) return 'Change colors to save a new preset'
  return 'Save current colors as preset'
})

function sanitizeExportName(name: string): string {
  const cleaned = name
    .trim()
    .replace(/[^\p{L}\p{N}\s_-]+/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
  return cleaned || 'preset'
}

function buildExportFilename(presets: { name: string }[]): string {
  if (presets.length === 1) {
    return `${sanitizeExportName(presets[0]!.name)}.json`
  }
  const first = sanitizeExportName(presets[0]!.name)
  return `${first}-and-${presets.length - 1}-more.json`
}

const presetPageCount = computed(() =>
  Math.max(1, Math.ceil(COLOR_PALETTES.length / PRESET_PAGE_SIZE)),
)

const presetPages = computed(() => {
  const pages: ColorPalette[][] = []
  for (let i = 0; i < COLOR_PALETTES.length; i += PRESET_PAGE_SIZE) {
    pages.push(COLOR_PALETTES.slice(i, i + PRESET_PAGE_SIZE))
  }
  return pages
})

const myPageCount = computed(() =>
  Math.max(1, Math.ceil(presetsStore.userPresets.length / PRESET_PAGE_SIZE)),
)

const myPages = computed(() => {
  const pages: UserColorPreset[][] = []
  const list = presetsStore.userPresets
  for (let i = 0; i < list.length; i += PRESET_PAGE_SIZE) {
    pages.push(list.slice(i, i + PRESET_PAGE_SIZE))
  }
  return pages
})

const showMyArrows = computed(() => presetsStore.userPresets.length >= 4)

function goPresetPage(next: number) {
  const clamped = Math.max(0, Math.min(presetPageCount.value - 1, next))
  if (clamped === presetPage.value || isSliding.value) return
  animateSlide.value = true
  isSliding.value = true
  presetPage.value = clamped
}

function onSlideEnd(event: TransitionEvent) {
  if (event.propertyName !== 'transform') return
  isSliding.value = false
}

function jumpToPresetPage(page: number) {
  animateSlide.value = false
  isSliding.value = false
  presetPage.value = page
}

function goMyPage(next: number) {
  const clamped = Math.max(0, Math.min(myPageCount.value - 1, next))
  if (clamped === myPage.value || mySliding.value) return
  myAnimate.value = true
  mySliding.value = true
  myPage.value = clamped
}

function onMySlideEnd(event: TransitionEvent) {
  if (event.propertyName !== 'transform') return
  mySliding.value = false
}

/** Touch/pen swipe for carousel pages (mobile/tablet friendly) */
function createCarouselSwipe(opts: {
  goNext: () => void
  goPrev: () => void
  isBusy: () => boolean
}) {
  const SWIPE_THRESHOLD_PX = 42
  const AXIS_LOCK_PX = 8

  let tracking = false
  let startX = 0
  let startY = 0
  let axis: 'h' | 'v' | null = null
  let didSwipe = false

  function onPointerDown(e: PointerEvent) {
    if (opts.isBusy()) return
    // Mouse still uses arrows; swipe is for touch/pen
    if (e.pointerType === 'mouse') return
    tracking = true
    axis = null
    didSwipe = false
    startX = e.clientX
    startY = e.clientY
  }

  function onPointerMove(e: PointerEvent) {
    if (!tracking) return
    const dx = e.clientX - startX
    const dy = e.clientY - startY
    if (!axis) {
      if (Math.abs(dx) < AXIS_LOCK_PX && Math.abs(dy) < AXIS_LOCK_PX) return
      axis = Math.abs(dx) >= Math.abs(dy) ? 'h' : 'v'
    }
  }

  function finish(e: PointerEvent) {
    if (!tracking) return
    tracking = false
    const dx = e.clientX - startX
    if (axis === 'h' && Math.abs(dx) >= SWIPE_THRESHOLD_PX) {
      didSwipe = true
      if (dx < 0) opts.goNext()
      else opts.goPrev()
    }
    axis = null
  }

  function onPointerUp(e: PointerEvent) {
    finish(e)
  }

  function onPointerCancel(e: PointerEvent) {
    finish(e)
  }

  function onClickCapture(e: MouseEvent) {
    if (!didSwipe) return
    e.preventDefault()
    e.stopPropagation()
    didSwipe = false
  }

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onClickCapture }
}

const builtinSwipe = createCarouselSwipe({
  goNext: () => goPresetPage(presetPage.value + 1),
  goPrev: () => goPresetPage(presetPage.value - 1),
  isBusy: () => isSliding.value || presetPageCount.value <= 1,
})

const mySwipe = createCarouselSwipe({
  goNext: () => goMyPage(myPage.value + 1),
  goPrev: () => goMyPage(myPage.value - 1),
  isBusy: () => mySliding.value || myPageCount.value <= 1,
})

function clampMyPage() {
  const max = myPageCount.value - 1
  if (myPage.value > max) {
    myAnimate.value = false
    mySliding.value = false
    myPage.value = Math.max(0, max)
  }
}

watch(
  () => themeStore.currentTheme,
  (theme) => {
    if (theme === 'custom') {
      const activeIndex = COLOR_PALETTES.findIndex(p => isBuiltinActive(p))
      if (activeIndex >= 0) {
        jumpToPresetPage(Math.floor(activeIndex / PRESET_PAGE_SIZE))
      }
      const userIndex = presetsStore.userPresets.findIndex(p => isUserActive(p))
      if (userIndex >= 0) {
        myAnimate.value = false
        mySliding.value = false
        myPage.value = Math.floor(userIndex / PRESET_PAGE_SIZE)
      }
    }
  },
  { immediate: true },
)

watch(() => presetsStore.userPresets.length, () => {
  if (!showMyArrows.value) {
    myAnimate.value = false
    mySliding.value = false
    myPage.value = 0
    return
  }
  clampMyPage()
})

watch(matchesExistingPreset, (matches) => {
  if (matches && saveOpen.value) saveOpen.value = false
})

function isBuiltinActive(palette: ColorPalette): boolean {
  return themeStore.currentTheme === 'custom' && isPaletteActive(palette, themeStore.customColors)
}

function isUserActive(preset: UserColorPreset): boolean {
  return themeStore.currentTheme === 'custom' && presetsStore.isActive(preset, themeStore.customColors)
}

function onCustomColorChange(key: keyof ThemeColors, event: Event) {
  const value = (event.target as HTMLInputElement).value
  themeStore.setCustomColor(key, value)
}

function showToast(message: string) {
  toastMessage.value = message
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
    toastTimer = null
  }, 2400)
}

onUnmounted(() => {
  if (toastTimer) clearTimeout(toastTimer)
})

function openSaveForm() {
  if (!canSavePreset.value || editId.value) return
  saveError.value = ''
  saveName.value = `My preset ${presetsStore.userPresets.length + 1}`
  saveOpen.value = true
  nextTick(() => {
    saveInputRef.value?.focus()
    saveInputRef.value?.select()
  })
}

function confirmSave() {
  if (!canSavePreset.value) {
    saveOpen.value = false
    return
  }
  const result = presetsStore.saveFromColors(saveName.value, themeStore.customColors)
  if (!result.ok) {
    if (result.reason === 'limit') {
      saveOpen.value = false
      showToast(`Preset limit reached (${MAX_USER_PRESETS})`)
      return
    }
    saveError.value = result.reason === 'duplicate'
      ? 'Change colors to save a new preset.'
      : 'Enter a name.'
    return
  }
  saveOpen.value = false
  saveError.value = ''
  const atLimit = presetsStore.userPresets.length >= MAX_USER_PRESETS
  showToast(atLimit ? `Preset saved · Limit reached (${MAX_USER_PRESETS})` : 'Preset saved')
  nextTick(() => {
    const idx = presetsStore.userPresets.findIndex(p => p.id === result.preset.id)
    if (idx >= 0) {
      myAnimate.value = true
      myPage.value = Math.floor(idx / PRESET_PAGE_SIZE)
    }
  })
}

function startEdit(preset: UserColorPreset) {
  saveOpen.value = false
  saveError.value = ''
  editError.value = ''

  if (editId.value === preset.id) {
    nextTick(() => {
      editInputRef.value?.focus()
      editInputRef.value?.select()
    })
    return
  }

  if (!editId.value) {
    editRestoreColors = { ...themeStore.customColors }
  }

  editId.value = preset.id
  editName.value = preset.name
  themeStore.applyCustomColors(preset.colors)
  nextTick(() => {
    editInputRef.value?.focus()
    editInputRef.value?.select()
  })
}

function cancelEdit() {
  if (editRestoreColors) {
    themeStore.applyCustomColors(editRestoreColors)
  }
  editId.value = null
  editName.value = ''
  editError.value = ''
  editRestoreColors = null
}

function confirmEdit() {
  if (!editId.value) return
  const result = presetsStore.updatePreset(
    editId.value,
    editName.value,
    themeStore.customColors,
  )
  if (!result.ok) {
    editError.value = result.reason === 'duplicate'
      ? 'These colors match another preset.'
      : result.reason === 'empty'
        ? 'Enter a name.'
        : 'Preset not found.'
    return
  }
  editId.value = null
  editName.value = ''
  editError.value = ''
  editRestoreColors = null
  showToast('Preset updated')
}

function askDeletePreset(preset: UserColorPreset) {
  pendingDelete.value = preset
}

function cancelDeletePreset() {
  pendingDelete.value = null
}

function confirmDeletePreset() {
  const preset = pendingDelete.value
  pendingDelete.value = null
  if (!preset) return
  deleteUserPreset(preset.id)
  showToast('Preset deleted')
}

function deleteUserPreset(id: string) {
  if (editId.value === id) {
    editId.value = null
    editName.value = ''
    editError.value = ''
    editRestoreColors = null
  }
  presetsStore.deletePreset(id)
  clampMyPage()
}

function exportPresets() {
  if (!presetsStore.hasUserPresets) return
  const payload = presetsStore.exportPayload()
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = buildExportFilename(payload.presets)
  a.click()
  URL.revokeObjectURL(url)
  showToast(payload.presets.length === 1 ? 'Preset exported' : `Exported ${payload.presets.length} presets`)
}

async function onImportFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  try {
    const text = await file.text()
    const parsed = JSON.parse(text) as unknown
    const result = presetsStore.importPayload(parsed)
    if (result.ok) {
      if (result.skipped > 0) {
        const atLimit = presetsStore.userPresets.length >= MAX_USER_PRESETS
        showToast(
          atLimit
            ? `Imported ${result.added} · Limit reached (${MAX_USER_PRESETS})`
            : `Imported ${result.added} · ${result.skipped} already saved`,
        )
      }
      else {
        showToast(result.added === 1 ? 'Preset imported' : `Imported ${result.added} presets`)
      }
      clampMyPage()
    }
    else {
      showToast(result.reason)
    }
  }
  catch {
    showToast('Couldn’t read that file')
  }
}
</script>

<style scoped>
.preset-viewport {
  touch-action: pan-y;
  cursor: grab;
  -webkit-user-select: none;
  user-select: none;
}

.preset-track {
  width: 100%;
  will-change: transform;
}

.preset-track--animate {
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.preset-page {
  flex: 0 0 100%;
  width: 100%;
  min-width: 100%;
}

.preset-slot {
  flex: 0 0 calc((100% - 1rem) / 3);
  max-width: calc((100% - 1rem) / 3);
}

.preset-sw {
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 2px;
  border-radius: 8px;
  font-family: inherit;
  outline: none;
  width: 100%;
}

.preset-sw:focus-visible .preset-sw-pill {
  box-shadow: 0 0 0 2px var(--color-primary);
}

.preset-sw-pill {
  border: 1px solid rgba(var(--color-muted-rgb), 0.25);
  transition: box-shadow 0.18s ease, border-color 0.18s ease;
}

.preset-sw-pill[data-sel='true'] {
  border-color: transparent;
  box-shadow: 0 0 0 2px var(--color-primary);
}

.preset-sw-pill[data-edit='true'] {
  box-shadow: 0 0 0 2px var(--color-secondary);
}

.preset-mini-btn {
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 8px;
  line-height: 1.2;
}

.preset-mini-btn--ghost {
  background: transparent;
  color: var(--color-muted);
}

.preset-mini-btn--ghost:hover {
  color: var(--color-text);
}

.preset-mini-btn--primary {
  background: var(--color-primary);
  color: var(--color-bg);
}

.preset-io-btn {
  border: 1px solid rgba(var(--color-muted-rgb), 0.35);
  background: transparent;
  color: var(--color-secondary);
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;
  padding: 5px 10px;
  border-radius: 8px;
  cursor: pointer;
  line-height: 1.2;
}

.preset-io-btn:hover:not(:disabled) {
  color: var(--color-text);
  border-color: rgba(var(--color-muted-rgb), 0.55);
}

.preset-io-btn:disabled {
  opacity: 0.35;
  cursor: default;
}

.preset-toast-enter-active,
.preset-toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.preset-toast-enter-from,
.preset-toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px);
}
</style>
