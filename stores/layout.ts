import { defineStore } from 'pinia'
import type { LayoutSettings } from '../types/settings'

export const useLayoutStore = defineStore('layout', {
  state: (): LayoutSettings => ({
    alignment: 'center',
    widgetColumns: 2,
    widgetGap: '1rem',
    showSettingsButton: true,
  }),
})
