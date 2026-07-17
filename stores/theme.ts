import { defineStore } from 'pinia'
import { THEME_PRESETS, getSystemColorScheme } from '../utils/themes'
import { paletteToThemeColors, type ColorPalette } from '../utils/palettes'
import type { ThemeName, ThemeColors, ColorScheme } from '../types/theme'

const LEGACY_THEMES = new Set(['amoled', 'gradient'])

/**
 * Convert a hex color to an "r, g, b" triplet string.
 * Used so we can express translucent tints as rgba(var(--x-rgb), a),
 * which older browsers support (unlike color-mix()).
 */
function hexToRgbTriplet(hex: string): string {
  let value = hex.trim().replace('#', '')
  if (value.length === 3) {
    value = value.split('').map(c => c + c).join('')
  }
  const int = Number.parseInt(value, 16)
  if (value.length !== 6 || Number.isNaN(int)) {
    return '128, 128, 128'
  }
  const r = (int >> 16) & 255
  const g = (int >> 8) & 255
  const b = int & 255
  return `${r}, ${g}, ${b}`
}

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

    /** Quick sun/moon FAB — always available on the board */
    showAppearanceToggle(): boolean {
      return true
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

    /** Flip light ↔ dark (also leaves System / Custom for an explicit scheme). */
    toggleAppearance() {
      const next = this.resolvedScheme === 'dark' ? 'light' : 'dark'
      this.setTheme(next)
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

      // RGB triplets power rgba() tints as a legacy-safe alternative to color-mix()
      root.style.setProperty('--color-primary-rgb', hexToRgbTriplet(colors.primary))
      root.style.setProperty('--color-bg-rgb', hexToRgbTriplet(colors.bg))
      root.style.setProperty('--color-surface-rgb', hexToRgbTriplet(colors.surface))
      root.style.setProperty('--color-muted-rgb', hexToRgbTriplet(colors.muted))

      root.dataset.theme = this.currentTheme
      root.dataset.scheme = this.resolvedScheme
    },
  },
})
