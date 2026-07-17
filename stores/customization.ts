import { defineStore } from 'pinia'
import { loadGoogleFontForFamily } from '../utils/fonts'
import {
  CLOCK_FONT_SIZE_MAX_REM,
  CLOCK_FONT_SIZE_MIN_REM,
  type CustomizationSettings,
} from '../types/settings'

function clampClockFontSize(size: string): string {
  const value = parseFloat(size)
  if (Number.isNaN(value)) return '6rem'
  const clamped = Math.min(CLOCK_FONT_SIZE_MAX_REM, Math.max(CLOCK_FONT_SIZE_MIN_REM, value))
  return `${clamped}rem`
}

export const useCustomizationStore = defineStore('customization', {
  state: (): CustomizationSettings => ({
    fontFamily: 'system-ui, sans-serif',
    fontSize: '6rem',
    fontWeight: '700',
    letterSpacing: '0.05em',
    glowColor: 'transparent',
    glowIntensity: 0,
    shadowColor: 'transparent',
    shadowIntensity: 0,
  }),

  actions: {
    applyToCSS() {
      if (!import.meta.client) return
      this.fontSize = clampClockFontSize(this.fontSize)
      const root = document.documentElement
      root.style.setProperty('--font-clock', this.fontFamily)
      root.style.setProperty('--font-size-clock-pref', this.fontSize)
      root.style.setProperty('--font-weight-clock', this.fontWeight)
      root.style.setProperty('--letter-spacing-clock', this.letterSpacing)
      root.style.setProperty('--glow-color', this.glowColor)
      root.style.setProperty('--glow-intensity', `${this.glowIntensity}px`)
      root.style.setProperty('--shadow-color', this.shadowColor)
      root.style.setProperty('--shadow-intensity', `${this.shadowIntensity}px`)
    },

    setFont(family: string) {
      this.fontFamily = family
      loadGoogleFontForFamily(family)
      this.applyToCSS()
    },

    setFontSize(size: string) {
      this.fontSize = clampClockFontSize(size)
      this.applyToCSS()
    },

    setFontWeight(weight: string) {
      this.fontWeight = weight
      this.applyToCSS()
    },

    setGlow(color: string, intensity: number) {
      this.glowColor = color
      this.glowIntensity = intensity
      this.applyToCSS()
    },

    setShadow(color: string, intensity: number) {
      this.shadowColor = color
      this.shadowIntensity = intensity
      this.applyToCSS()
    },
  },
})
