import { defineStore } from 'pinia'
import { loadGoogleFontForFamily } from '../utils/fonts'
import type { CustomizationSettings } from '../types/settings'

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
      const root = document.documentElement
      root.style.setProperty('--font-clock', this.fontFamily)
      root.style.setProperty('--font-size-clock', this.fontSize)
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
      this.fontSize = size
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
