<template>
  <div class="space-y-3">
    <h3 class="text-sm font-bold font-ui uppercase tracking-wider" :style="{ color: 'var(--color-muted)' }">
      Theme
    </h3>

    <div class="grid grid-cols-3 gap-2">
      <button
        v-for="theme in themes"
        :key="theme.name"
        class="p-3 rounded-lg text-xs font-ui text-center border-2 transition-all"
        :style="{
          backgroundColor: theme.preview,
          color: theme.textColor,
          borderColor: themeStore.currentTheme === theme.name ? 'var(--color-primary)' : 'transparent',
        }"
        @click="themeStore.setTheme(theme.name)"
      >
        {{ theme.label }}
      </button>
    </div>

    <div class="space-y-2 pt-3 border-t" :style="{ borderColor: 'var(--color-muted)' }">
      <h4 class="text-xs font-bold font-ui uppercase tracking-wider" :style="{ color: 'var(--color-muted)' }">
        Color Palettes
      </h4>

      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="palette in COLOR_PALETTES"
          :key="palette.id"
          type="button"
          class="flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all"
          :style="{
            backgroundColor: palette.colors.surface,
            borderColor: isActivePalette(palette) ? palette.colors.primary : 'transparent',
          }"
          :title="palette.name"
          @click="themeStore.applyPalette(palette)"
        >
          <div class="flex items-center gap-0.5">
            <span
              v-for="(color, index) in paletteSwatches(palette)"
              :key="index"
              class="w-3 h-3 rounded-full border"
              :style="{
                backgroundColor: color,
                borderColor: 'rgba(255,255,255,0.15)',
              }"
            />
          </div>
          <span
            class="text-[10px] font-ui leading-tight text-center line-clamp-2"
            :style="{ color: palette.colors.primary }"
          >
            {{ palette.name }}
          </span>
        </button>
      </div>
    </div>

    <div
      v-if="themeStore.currentTheme === 'custom'"
      class="space-y-3 pt-3 border-t"
      :style="{ borderColor: 'var(--color-muted)' }"
    >
      <p class="text-xs font-ui" :style="{ color: 'var(--color-muted)' }">
        Customize colors
      </p>

      <div
        v-for="field in customColorFields"
        :key="field.key"
        class="space-y-1"
      >
        <label class="text-sm font-ui" :style="{ color: 'var(--color-text)' }">
          {{ field.label }}
        </label>
        <input
          type="color"
          :value="themeStore.customColors[field.key]"
          class="w-full h-8 rounded cursor-pointer"
          @input="onCustomColorChange(field.key, $event)"
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ThemeColors, ThemeName } from '../../../types/theme'
import { COLOR_PALETTES, isPaletteActive, type ColorPalette } from '../../../utils/palettes'

const themeStore = useThemeStore()

const themes: { name: ThemeName, label: string, preview: string, textColor: string }[] = [
  { name: 'dark', label: 'Dark', preview: '#0a0a0a', textColor: '#ffffff' },
  { name: 'light', label: 'Light', preview: '#f5f5f5', textColor: '#1a1a1a' },
  { name: 'amoled', label: 'AMOLED', preview: '#000000', textColor: '#00ffff' },
  { name: 'gradient', label: 'Gradient', preview: '#302b63', textColor: '#ffffff' },
  { name: 'custom', label: 'Custom', preview: '#1a1a2e', textColor: '#ffffff' },
]

const customColorFields: { key: keyof ThemeColors, label: string }[] = [
  { key: 'bg', label: 'Background' },
  { key: 'primary', label: 'Primary Text (Clock)' },
  { key: 'secondary', label: 'Secondary Text (Date)' },
  { key: 'muted', label: 'Muted Text (Hijri)' },
  { key: 'surface', label: 'Surface (Panel)' },
]

function paletteSwatches(palette: ColorPalette): string[] {
  const { bg, surface, primary, secondary, muted } = palette.colors
  return [bg, surface, primary, secondary, muted]
}

function isActivePalette(palette: ColorPalette): boolean {
  return themeStore.currentTheme === 'custom' && isPaletteActive(palette, themeStore.customColors)
}

function onCustomColorChange(key: keyof ThemeColors, event: Event) {
  const value = (event.target as HTMLInputElement).value
  themeStore.setCustomColor(key, value)
}
</script>
