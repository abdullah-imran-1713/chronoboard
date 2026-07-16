import type { ThemeColors } from '../types/theme'

export interface ColorPalette {
  id: string
  name: string
  colors: Pick<ThemeColors, 'bg' | 'surface' | 'primary' | 'secondary' | 'muted'>
}

export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: 'midnight',
    name: 'Midnight',
    colors: {
      bg: '#0b1220',
      surface: '#152238',
      primary: '#e8eef7',
      secondary: '#8fa3bf',
      muted: '#4a5d78',
    },
  },
  {
    id: 'slate',
    name: 'Slate',
    colors: {
      bg: '#121417',
      surface: '#1c2026',
      primary: '#e6e8eb',
      secondary: '#9aa3ad',
      muted: '#6b7380',
    },
  },
  {
    id: 'nord',
    name: 'Nord',
    colors: {
      bg: '#2e3440',
      surface: '#3b4252',
      primary: '#eceff4',
      secondary: '#88c0d0',
      muted: '#6b7a8f',
    },
  },
  {
    id: 'sahara',
    name: 'Sahara',
    colors: {
      bg: '#F2E8D9',
      surface: '#e8dcc8',
      primary: '#5C4033',
      secondary: '#C9A87C',
      muted: '#9a7a58',
    },
  },
  {
    id: 'lagoon',
    name: 'Lagoon',
    colors: {
      bg: '#1C2B2B',
      surface: '#263838',
      primary: '#A8D5C2',
      secondary: '#2E7D6E',
      muted: '#1e554c',
    },
  },
  {
    id: 'luxe',
    name: 'Luxe',
    colors: {
      bg: '#0E1628',
      surface: '#1a2438',
      primary: '#FFFAF0',
      secondary: '#C8A84B',
      muted: '#7a6830',
    },
  },
]

export const PRESET_PAGE_SIZE = 3

export function paletteToThemeColors(palette: ColorPalette): ThemeColors {
  return {
    ...palette.colors,
    text: palette.colors.primary,
  }
}

export function isPaletteActive(palette: ColorPalette, current: ThemeColors): boolean {
  return (
    palette.colors.bg === current.bg
    && palette.colors.surface === current.surface
    && palette.colors.primary === current.primary
    && palette.colors.secondary === current.secondary
    && palette.colors.muted === current.muted
  )
}
