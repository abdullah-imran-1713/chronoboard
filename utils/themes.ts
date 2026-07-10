import type { ThemeConfig, ThemeName } from '../types/theme'

export const THEME_PRESETS: Record<ThemeName, ThemeConfig> = {
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
  amoled: {
    name: 'amoled',
    colors: {
      primary: '#00ffff',
      secondary: '#80deea',
      bg: '#000000',
      surface: '#050505',
      text: '#e0ffff',
      muted: '#006064',
    },
  },
  gradient: {
    name: 'gradient',
    colors: {
      primary: '#ffffff',
      secondary: '#cccccc',
      bg: '#0f0c29',
      surface: '#1a1744',
      text: '#ffffff',
      muted: '#7777aa',
    },
    gradient: {
      from: '#0f0c29',
      to: '#302b63',
      direction: '135deg',
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
