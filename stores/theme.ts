import { defineStore } from 'pinia'
import { THEME_PRESETS } from '../utils/themes'
import { paletteToThemeColors, type ColorPalette } from '../utils/palettes'
import type { ThemeName, ThemeColors } from '../types/theme'

interface ThemeState {
  currentTheme: ThemeName
  customColors: ThemeColors
  gradientFrom: string
  gradientTo: string
  gradientDirection: string
}

export const useThemeStore = defineStore('theme', {
  state: (): ThemeState => ({
    currentTheme: 'dark',
    customColors: { ...THEME_PRESETS.dark.colors },
    gradientFrom: '#0f0c29',
    gradientTo: '#302b63',
    gradientDirection: '135deg',
  }),

  getters: {
    activeColors(state): ThemeColors {
      if (state.currentTheme === 'custom') {
        return state.customColors
      }
      return THEME_PRESETS[state.currentTheme].colors
    },

    backgroundStyle(state): string {
      if (state.currentTheme === 'gradient') {
        return `linear-gradient(${state.gradientDirection}, ${state.gradientFrom}, ${state.gradientTo})`
      }
      return ''
    },
  },

  actions: {
    setTheme(theme: ThemeName) {
      this.currentTheme = theme
      this.applyTheme()
    },

    setCustomColor(key: keyof ThemeColors, value: string) {
      this.customColors[key] = value
      if (this.currentTheme === 'custom') {
        this.applyTheme()
      }
    },

    applyPalette(palette: ColorPalette) {
      this.customColors = paletteToThemeColors(palette)
      this.currentTheme = 'custom'
      this.applyTheme()
    },

    applyTheme() {
      if (!import.meta.client) return
      const root = document.documentElement
      const colors = this.activeColors

      root.style.setProperty('--color-primary', colors.primary)
      root.style.setProperty('--color-secondary', colors.secondary)
      root.style.setProperty('--color-bg', colors.bg)
      root.style.setProperty('--color-surface', colors.surface)
      root.style.setProperty('--color-text', colors.text)
      root.style.setProperty('--color-muted', colors.muted)
    },
  },
})
