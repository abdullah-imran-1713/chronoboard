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
  /** Soft “Buy me a coffee” line under board content */
  showSupportOnBoard: boolean
  /** Last board canvas height used for position % — must persist or refresh drifts widgets */
  boardHeightPx: number
  /** Widget board positions as % of canvas (top-left). */
  widgetPositions: Record<string, WidgetBoardPosition>
  /** User-dragged widgets keep their place during auto-pack */
  widgetMoved: Record<string, boolean>
  /** Per-widget visual scale (1 = default). Legacy S/M/L strings migrated on load. */
  widgetSizes: Record<string, number>
  /** Bump clears broken auto layouts */
  widgetLayoutRev: number
}

/** Percentage of canvas width/height for the widget’s top-left corner */
export interface WidgetBoardPosition {
  x: number
  y: number
}

/** Compact / default / large quick presets */
export type WidgetSizePreset = 'S' | 'M' | 'L'

export const WIDGET_SIZE_SCALE: Record<WidgetSizePreset, number> = {
  S: 0.85,
  M: 1,
  L: 1.15,
}

export const WIDGET_SIZE_PRESETS: WidgetSizePreset[] = ['S', 'M', 'L']

/** Fine slider bounds (same idea as clock rem slider) */
export const WIDGET_SIZE_MIN = 0.75
export const WIDGET_SIZE_MAX = 1.25
export const WIDGET_SIZE_STEP = 0.05

export function clampWidgetScale(value: number): number {
  const stepped = Math.round(value / WIDGET_SIZE_STEP) * WIDGET_SIZE_STEP
  return Math.min(WIDGET_SIZE_MAX, Math.max(WIDGET_SIZE_MIN, Number(stepped.toFixed(2))))
}

/** Map legacy preset letters or any number → clamped scale */
export function normalizeWidgetScale(raw: unknown): number {
  if (raw === 'S' || raw === 'M' || raw === 'L') return WIDGET_SIZE_SCALE[raw]
  if (typeof raw === 'number' && Number.isFinite(raw)) return clampWidgetScale(raw)
  return 1
}

/** Exact preset match only (no “nearest” while sliding) */
export function matchingWidgetSizePreset(scale: number): WidgetSizePreset | null {
  const value = clampWidgetScale(scale)
  for (const preset of WIDGET_SIZE_PRESETS) {
    if (Math.abs(WIDGET_SIZE_SCALE[preset] - value) < 0.001) return preset
  }
  return null
}

/** Snap grid size in pixels while arranging widgets */
export const WIDGET_BOARD_GRID_PX = 24

/** Clock font size slider bounds (rem) */
export const CLOCK_FONT_SIZE_MIN_REM = 2
export const CLOCK_FONT_SIZE_MAX_REM = 11.5

/** Preferred max card width */
export const WIDGET_BOARD_CARD_WIDTH_PX = 280

/** Minimum card width when packing more columns */
export const WIDGET_BOARD_CARD_MIN_WIDTH_PX = 200

/** Max columns in the default auto-pack */
export const WIDGET_BOARD_MAX_COLS = 4

/** Board support footer (Buy me a coffee) geometry */
export const SUPPORT_FOOTER_HEIGHT_PX = 28
export const SUPPORT_FOOTER_GAP_PX = 14
export const SUPPORT_FOOTER_END_PAD_PX = 8
/** Distance from viewport bottom to the footer’s bottom edge when no widgets push it down */
export const SUPPORT_FOOTER_VIEWPORT_INSET_PX = 36
/** FAB clearance when support footer is hidden */
export const BOARD_FAB_CLEARANCE_PX = 120

