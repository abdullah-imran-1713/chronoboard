import type { ThemeColors } from '../types/theme'

export interface ColorPalette {
  id: string
  name: string
  colors: Pick<ThemeColors, 'bg' | 'surface' | 'primary' | 'secondary' | 'muted'>
}

export const COLOR_PALETTES: ColorPalette[] = [
  { id: 'midnight-blue', name: 'Midnight Blue', colors: { bg: '#0d1b2a', surface: '#1a2d42', primary: '#e0fbfc', secondary: '#90e0ef', muted: '#4a8fa8' } },
  { id: 'forest-dark', name: 'Forest Dark', colors: { bg: '#0a1f0a', surface: '#122912', primary: '#a8d5a2', secondary: '#6db56d', muted: '#3d7a3d' } },
  { id: 'sunset-glow', name: 'Sunset Glow', colors: { bg: '#1a0a00', surface: '#2d1500', primary: '#ff6b35', secondary: '#ffb347', muted: '#cc4400' } },
  { id: 'rose-gold', name: 'Rose Gold', colors: { bg: '#1a0508', surface: '#2d0d14', primary: '#f4c2c2', secondary: '#e8a0a0', muted: '#c97070' } },
  { id: 'ocean-deep', name: 'Ocean Deep', colors: { bg: '#0a1628', surface: '#0f2240', primary: '#4fc3f7', secondary: '#81d4fa', muted: '#2980b9' } },
  { id: 'purple-haze', name: 'Purple Haze', colors: { bg: '#1a0a2e', surface: '#2a1245', primary: '#ce93d8', secondary: '#ba68c8', muted: '#7b1fa2' } },
  { id: 'emerald-city', name: 'Emerald City', colors: { bg: '#001a12', surface: '#002a1e', primary: '#00e5a0', secondary: '#00bfa5', muted: '#007a5e' } },
  { id: 'golden-hour', name: 'Golden Hour', colors: { bg: '#1a1200', surface: '#2d2000', primary: '#ffd700', secondary: '#ffb300', muted: '#a07800' } },
  { id: 'arctic-ice', name: 'Arctic Ice', colors: { bg: '#0a1520', surface: '#0f2030', primary: '#b3e5fc', secondary: '#81d4fa', muted: '#4fc3f7' } },
  { id: 'cherry-blossom', name: 'Cherry Blossom', colors: { bg: '#1a0510', surface: '#2d0a1c', primary: '#ffb7c5', secondary: '#ff8fab', muted: '#cc3366' } },
  { id: 'neon-city', name: 'Neon City', colors: { bg: '#050510', surface: '#0a0a1a', primary: '#00ff88', secondary: '#00cc6a', muted: '#008844' } },
  { id: 'copper-rust', name: 'Copper Rust', colors: { bg: '#1a0800', surface: '#2d1200', primary: '#cd7f32', secondary: '#a0522d', muted: '#6b3a1f' } },
  { id: 'lavender-dream', name: 'Lavender Dream', colors: { bg: '#100a1a', surface: '#1c1228', primary: '#d8b4fe', secondary: '#c084fc', muted: '#9333ea' } },
  { id: 'mint-fresh', name: 'Mint Fresh', colors: { bg: '#061a10', surface: '#0a2818', primary: '#6ee7b7', secondary: '#34d399', muted: '#059669' } },
  { id: 'volcanic', name: 'Volcanic', colors: { bg: '#1a0500', surface: '#2d0800', primary: '#ff4500', secondary: '#ff6a00', muted: '#cc3700' } },
]

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
