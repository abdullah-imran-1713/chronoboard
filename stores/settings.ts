import { defineStore } from 'pinia'
import type { ClockSettings } from '../types/clock'
import type { DateFormat, HijriLocale } from '../types/date'

interface SettingsState {
  clock: ClockSettings
  dateFormat: DateFormat
  dateLocale: string
  hijriLocale: HijriLocale
  showHijriDate: boolean
  showDate: boolean
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    clock: {
      format: '12h',
      showSeconds: true,
      blinkingColon: true,
      showDate: true,
      showHijriDate: true,
    },
    dateFormat: 'full',
    dateLocale: 'en-US',
    hijriLocale: 'en',
    showHijriDate: true,
    showDate: true,
  }),

  actions: {
    toggleFormat() {
      this.clock.format = this.clock.format === '12h' ? '24h' : '12h'
    },

    toggleSeconds() {
      this.clock.showSeconds = !this.clock.showSeconds
    },

    toggleBlinkingColon() {
      this.clock.blinkingColon = !this.clock.blinkingColon
    },

    toggleDate() {
      this.showDate = !this.showDate
    },

    toggleHijriDate() {
      this.showHijriDate = !this.showHijriDate
    },
  },
})
