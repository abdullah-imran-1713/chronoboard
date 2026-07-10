export interface CustomizationSettings {
  fontFamily: string
  fontSize: string
  fontWeight: string
  letterSpacing: string
  glowColor: string
  glowIntensity: number
  shadowColor: string
  shadowIntensity: number
}

export interface LayoutSettings {
  alignment: 'center' | 'top' | 'bottom'
  widgetColumns: 1 | 2 | 3 | 4
  widgetGap: string
  showSettingsButton: boolean
}
