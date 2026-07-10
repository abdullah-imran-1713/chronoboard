export type ThemeName = 'light' | 'dark' | 'amoled' | 'gradient' | 'custom'

export interface ThemeColors {
  primary: string
  secondary: string
  bg: string
  surface: string
  text: string
  muted: string
}

export interface ThemeConfig {
  name: ThemeName
  colors: ThemeColors
  gradient?: {
    from: string
    to: string
    direction: string
  }
}
