import { defineStore } from 'pinia'
import type { ClockSettings } from '../types/clock'
import type { DateFormat, HijriLocale } from '../types/date'
import type { IslamicFeaturesPreference } from '../types/settings'
import type { PrayerAsrSchool } from '../types/prayer'

interface SettingsState {
  clock: ClockSettings
  dateFormat: DateFormat
  dateLocale: string
  hijriLocale: HijriLocale
  showHijriDate: boolean
  showDate: boolean
  islamicFeaturesPreference: IslamicFeaturesPreference
  /** Asr calculation: Shafi (standard) or Hanafi */
  prayerAsrSchool: PrayerAsrSchool
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    clock: {
      format: '12h',
      showSeconds: true,
      blinkingColon: true,
      showDate: true,
      showHijriDate: false,
    },
    dateFormat: 'full',
    dateLocale: 'en-US',
    hijriLocale: 'en',
    showHijriDate: false,
    showDate: true,
    islamicFeaturesPreference: null,
    prayerAsrSchool: 'shafi',
  }),

  getters: {
    islamicFeaturesEnabled: (state): boolean => state.islamicFeaturesPreference === 'enabled',
    islamicFeaturesHidden: (state): boolean => state.islamicFeaturesPreference === 'hidden',
  },

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

    setIslamicFeaturesPreference(value: IslamicFeaturesPreference) {
      this.islamicFeaturesPreference = value
    },

    setPrayerAsrSchool(school: PrayerAsrSchool) {
      this.prayerAsrSchool = school
    },
  },
})
