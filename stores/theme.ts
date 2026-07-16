import { defineStore } from 'pinia'
import { THEME_PRESETS, getSystemColorScheme } from '../utils/themes'
import { paletteToThemeColors, type ColorPalette } from '../utils/palettes'
import type { ThemeName, ThemeColors, ColorScheme } from '../types/theme'

const LEGACY_THEMES = new Set(['amoled', 'gradient'])

interface ThemeState {
  currentTheme: ThemeName
  customColors: ThemeColors
}

let mediaQuery: MediaQueryList | null = null
let mediaHandler: (() => void) | null = null

export const useThemeStore = defineStore('theme', {
  state: (): ThemeState => ({
    currentTheme: 'dark',
    customColors: { ...THEME_PRESETS.dark.colors },
  }),

  getters: {
    /** Effective light/dark scheme after resolving System */
    resolvedScheme(state): ColorScheme {
      if (state.currentTheme === 'light' || state.currentTheme === 'dark') {
        return state.currentTheme
      }
      if (state.currentTheme === 'system') {
        return getSystemColorScheme()
      }
      // custom: infer from background luminance-ish via bg token (dark-ish default)
      const bg = state.customColors.bg.toLowerCase()
      if (bg === '#ffffff' || bg === '#f5f5f5' || bg === '#fff') return 'light'
      return 'dark'
    },

    activeColors(state): ThemeColors {
      if (state.currentTheme === 'custom') {
        return state.customColors
      }
      if (state.currentTheme === 'system') {
        return THEME_PRESETS[getSystemColorScheme()].colors
      }
      return THEME_PRESETS[state.currentTheme].colors
    },

    /** Quick sun/moon on main UI — only for forced Dark/Light */
    showAppearanceToggle(state): boolean {
      return state.currentTheme === 'dark' || state.currentTheme === 'light'
    },
  },

  actions: {
    migrateLegacyTheme() {
      const raw = this.currentTheme as string
      if (LEGACY_THEMES.has(raw)) {
        this.currentTheme = 'dark'
      }
    },

    setTheme(theme: ThemeName) {
      this.currentTheme = theme
      this.syncSystemListener()
      this.applyTheme()
    },

    toggleAppearance() {
      if (this.currentTheme === 'dark') {
        this.setTheme('light')
      }
      else if (this.currentTheme === 'light') {
        this.setTheme('dark')
      }
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
      this.syncSystemListener()
      this.applyTheme()
    },

    applyCustomColors(colors: ThemeColors) {
      this.customColors = { ...colors }
      this.currentTheme = 'custom'
      this.syncSystemListener()
      this.applyTheme()
    },

    syncSystemListener() {
      if (!import.meta.client) return

      if (mediaQuery && mediaHandler) {
        mediaQuery.removeEventListener('change', mediaHandler)
        mediaQuery = null
        mediaHandler = null
      }

      if (this.currentTheme !== 'system') return

      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaHandler = () => {
        if (this.currentTheme === 'system') {
          this.applyTheme()
        }
      }
      mediaQuery.addEventListener('change', mediaHandler)
    },

    applyTheme() {
      if (!import.meta.client) return
      this.migrateLegacyTheme()

      const root = document.documentElement
      const colors = this.activeColors

      root.style.setProperty('--color-primary', colors.primary)
      root.style.setProperty('--color-secondary', colors.secondary)
      root.style.setProperty('--color-bg', colors.bg)
      root.style.setProperty('--color-surface', colors.surface)
      root.style.setProperty('--color-text', colors.text)
      root.style.setProperty('--color-muted', colors.muted)

      root.dataset.theme = this.currentTheme
      root.dataset.scheme = this.resolvedScheme
    },
  },
})
