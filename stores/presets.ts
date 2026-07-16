import { defineStore } from 'pinia'
import type { ThemeColors, UserColorPreset } from '../types/theme'
import { MAX_USER_PRESETS } from '../types/theme'

const EXPORT_VERSION = 1

export function colorsMatch(a: ThemeColors, b: ThemeColors): boolean {
  return (
    a.bg === b.bg
    && a.surface === b.surface
    && a.primary === b.primary
    && a.secondary === b.secondary
    && a.muted === b.muted
    && a.text === b.text
  )
}

export const usePresetsStore = defineStore('presets', {
  state: () => ({
    userPresets: [] as UserColorPreset[],
  }),

  getters: {
    canSaveMore(state): boolean {
      return state.userPresets.length < MAX_USER_PRESETS
    },

    remainingSlots(state): number {
      return Math.max(0, MAX_USER_PRESETS - state.userPresets.length)
    },

    hasUserPresets(state): boolean {
      return state.userPresets.length > 0
    },
  },

  actions: {
    hasDuplicateColors(colors: ThemeColors): boolean {
      return this.userPresets.some(p => colorsMatch(p.colors, colors))
    },

    saveFromColors(name: string, colors: ThemeColors): { ok: true, preset: UserColorPreset } | { ok: false, reason: 'limit' | 'empty' | 'duplicate' } {
      const trimmed = name.trim()
      if (!trimmed) return { ok: false, reason: 'empty' }
      if (this.userPresets.length >= MAX_USER_PRESETS) return { ok: false, reason: 'limit' }
      if (this.hasDuplicateColors(colors)) return { ok: false, reason: 'duplicate' }

      const preset: UserColorPreset = {
        id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: trimmed.slice(0, 24),
        colors: { ...colors },
        createdAt: Date.now(),
      }
      this.userPresets.push(preset)
      return { ok: true, preset }
    },

    updatePreset(
      id: string,
      name: string,
      colors: ThemeColors,
    ): { ok: true } | { ok: false, reason: 'empty' | 'duplicate' | 'missing' } {
      const trimmed = name.trim().slice(0, 24)
      if (!trimmed) return { ok: false, reason: 'empty' }
      const preset = this.userPresets.find(p => p.id === id)
      if (!preset) return { ok: false, reason: 'missing' }
      const duplicate = this.userPresets.some(
        p => p.id !== id && colorsMatch(p.colors, colors),
      )
      if (duplicate) return { ok: false, reason: 'duplicate' }

      preset.name = trimmed
      preset.colors = { ...colors }
      return { ok: true }
    },

    deletePreset(id: string) {
      this.userPresets = this.userPresets.filter(p => p.id !== id)
    },

    isActive(preset: UserColorPreset, current: ThemeColors): boolean {
      return colorsMatch(preset.colors, current)
    },

    exportPayload() {
      return {
        version: EXPORT_VERSION,
        exportedAt: new Date().toISOString(),
        presets: this.userPresets.map(p => ({
          name: p.name,
          colors: { ...p.colors },
        })),
      }
    },

    importPayload(raw: unknown): { ok: true, added: number, skipped: number } | { ok: false, reason: string } {
      if (!raw || typeof raw !== 'object') return { ok: false, reason: 'Couldn’t import that file' }
      const data = raw as { presets?: unknown }
      if (!Array.isArray(data.presets)) return { ok: false, reason: 'No presets found in that file' }

      let added = 0
      let skipped = 0
      let hitLimit = false

      for (const item of data.presets) {
        if (this.userPresets.length >= MAX_USER_PRESETS) {
          hitLimit = true
          skipped++
          continue
        }
        if (!item || typeof item !== 'object') {
          skipped++
          continue
        }
        const entry = item as { name?: unknown, colors?: Partial<ThemeColors> }
        const colors = entry.colors
        if (!colors) {
          skipped++
          continue
        }
        const required: (keyof ThemeColors)[] = ['bg', 'surface', 'primary', 'secondary', 'text', 'muted']
        if (!required.every(k => typeof colors[k] === 'string')) {
          skipped++
          continue
        }

        const nextColors: ThemeColors = {
          bg: colors.bg!,
          surface: colors.surface!,
          primary: colors.primary!,
          secondary: colors.secondary!,
          text: colors.text!,
          muted: colors.muted!,
        }

        if (this.hasDuplicateColors(nextColors)) {
          skipped++
          continue
        }

        const name = typeof entry.name === 'string' && entry.name.trim()
          ? entry.name.trim().slice(0, 24)
          : `Imported ${this.userPresets.length + 1}`

        this.userPresets.push({
          id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name,
          colors: nextColors,
          createdAt: Date.now(),
        })
        added++
      }

      if (added === 0) {
        if (hitLimit) {
          return { ok: false, reason: `Preset limit reached (${MAX_USER_PRESETS})` }
        }
        return {
          ok: false,
          reason: skipped > 0 ? 'No new presets to import' : 'Couldn’t import that file',
        }
      }
      return { ok: true, added, skipped }
    },
  },
})
