/** null = never asked; enabled = show Faith features; hidden = hide them */
export type IslamicFeaturesPreference = null | 'enabled' | 'hidden'

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
  /** Widget board positions as % of canvas (top-left). */
  widgetPositions: Record<string, WidgetBoardPosition>
  /** User-dragged widgets keep their place during auto-pack */
  widgetMoved: Record<string, boolean>
  /** Bump clears broken auto layouts */
  widgetLayoutRev: number
}

/** Percentage of canvas width/height for the widget’s top-left corner */
export interface WidgetBoardPosition {
  x: number
  y: number
}

/** Snap grid size in pixels while arranging widgets */
export const WIDGET_BOARD_GRID_PX = 24

/** Preferred max card width */
export const WIDGET_BOARD_CARD_WIDTH_PX = 280

/** Minimum card width when packing more columns */
export const WIDGET_BOARD_CARD_MIN_WIDTH_PX = 200

/** Max columns in the default auto-pack */
export const WIDGET_BOARD_MAX_COLS = 4

