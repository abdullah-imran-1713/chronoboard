import type { ThemeConfig, ColorScheme } from '../types/theme'

export const THEME_PRESETS: Record<ColorScheme | 'custom', ThemeConfig> = {
  dark: {
    name: 'dark',
    colors: {
      primary: '#ffffff',
      secondary: '#a0a0a0',
      bg: '#0a0a0a',
      surface: '#1a1a1a',
      text: '#ffffff',
      muted: '#666666',
    },
  },
  light: {
    name: 'light',
    colors: {
      primary: '#1a1a1a',
      secondary: '#555555',
      bg: '#f5f5f5',
      surface: '#ffffff',
      text: '#1a1a1a',
      muted: '#999999',
    },
  },
  custom: {
    name: 'custom',
    colors: {
      primary: '#ffffff',
      secondary: '#a0a0a0',
      bg: '#0a0a0a',
      surface: '#1a1a1a',
      text: '#ffffff',
      muted: '#666666',
    },
  },
}

export function getSystemColorScheme(): ColorScheme {
  if (!import.meta.client) return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}
