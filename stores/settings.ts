import { defineStore } from 'pinia'
import type { ClockSettings } from '../types/clock'
import type { DateFormat, HijriLocale } from '../types/date'
import type { IslamicFeaturesPreference } from '../types/settings'
import type { PrayerAsrSchool } from '../types/prayer'
import type { FocusSessionPreset } from '../types/focus'
import {
  MAX_FOCUS_SESSIONS,
  MAX_BREAK_MINUTES,
  MAX_FOCUS_MINUTES,
  MIN_BREAK_MINUTES,
  MIN_FOCUS_MINUTES,
} from '../types/focus'

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(n)))
}

function newSessionId(): string {
  return `focus_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}

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
  /** Show Sunrise & Sunset rows in the Prayer Times widget */
  showPrayerSunriseSunset: boolean
  /** Focus timer: session length in minutes */
  focusMinutes: number
  /** Focus timer: break length in minutes */
  focusBreakMinutes: number
  /** Focus timer: include a break after focus */
  focusBreakEnabled: boolean
  /** Focus timer: what the user is working on */
  focusTaskLabel: string
  /** Saved focus setups for one-tap reuse */
  focusSessions: FocusSessionPreset[]
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
    showPrayerSunriseSunset: true,
    focusMinutes: 25,
    focusBreakMinutes: 5,
    focusBreakEnabled: false,
    focusTaskLabel: '',
    focusSessions: [],
  }),

  getters: {
    islamicFeaturesEnabled: (state): boolean => state.islamicFeaturesPreference === 'enabled',
    islamicFeaturesHidden: (state): boolean => state.islamicFeaturesPreference === 'hidden',
    canSaveFocusSession: (state): boolean => state.focusSessions.length < MAX_FOCUS_SESSIONS,
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

    setShowPrayerSunriseSunset(show: boolean) {
      this.showPrayerSunriseSunset = show
    },

    setFocusMinutes(minutes: number) {
      this.focusMinutes = clamp(minutes, MIN_FOCUS_MINUTES, MAX_FOCUS_MINUTES)
    },

    setFocusBreakMinutes(minutes: number) {
      this.focusBreakMinutes = clamp(minutes, MIN_BREAK_MINUTES, MAX_BREAK_MINUTES)
    },

    setFocusBreakEnabled(enabled: boolean) {
      this.focusBreakEnabled = enabled
    },

    setFocusTaskLabel(label: string) {
      this.focusTaskLabel = label.slice(0, 48)
    },

    applyFocusSession(session: FocusSessionPreset) {
      this.focusTaskLabel = session.title.slice(0, 48)
      this.focusMinutes = clamp(session.focusMinutes, MIN_FOCUS_MINUTES, MAX_FOCUS_MINUTES)
      this.focusBreakEnabled = session.breakEnabled
      this.focusBreakMinutes = clamp(session.breakMinutes, MIN_BREAK_MINUTES, MAX_BREAK_MINUTES)
    },

    saveFocusSessionFromCurrent():
      | { ok: true, session: FocusSessionPreset, updated: boolean }
      | { ok: false, reason: 'limit' | 'title' } {
      const title = this.focusTaskLabel.trim()
      if (!title) return { ok: false, reason: 'title' }

      const key = title.toLowerCase()
      const existing = this.focusSessions.find(s => s.title.trim().toLowerCase() === key)

      if (existing) {
        existing.title = title
        existing.focusMinutes = this.focusMinutes
        existing.breakEnabled = this.focusBreakEnabled
        existing.breakMinutes = this.focusBreakMinutes
        return { ok: true, session: existing, updated: true }
      }

      if (this.focusSessions.length >= MAX_FOCUS_SESSIONS) return { ok: false, reason: 'limit' }

      const session: FocusSessionPreset = {
        id: newSessionId(),
        title,
        focusMinutes: this.focusMinutes,
        breakEnabled: this.focusBreakEnabled,
        breakMinutes: this.focusBreakMinutes,
      }
      this.focusSessions.push(session)
      return { ok: true, session, updated: false }
    },

    removeFocusSession(id: string) {
      this.focusSessions = this.focusSessions.filter(s => s.id !== id)
    },
  },
})
