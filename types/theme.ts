export type ThemeName = 'light' | 'dark' | 'system' | 'custom'

/** Resolved visual scheme (System maps to one of these) */
export type ColorScheme = 'light' | 'dark'

export interface ThemeColors {
  primary: string
  secondary: string
  bg: string
  surface: string
  text: string
  muted: string
}

export interface ThemeConfig {
  name: ColorScheme | 'custom'
  colors: ThemeColors
}

/** User-saved custom color combo (device-local) */
export interface UserColorPreset {
  id: string
  name: string
  colors: ThemeColors
  createdAt: number
}

export const MAX_USER_PRESETS = 9

