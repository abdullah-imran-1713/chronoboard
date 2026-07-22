export interface FocusSessionPreset {
  id: string
  title: string
  focusMinutes: number
  breakEnabled: boolean
  breakMinutes: number
}

export const MAX_FOCUS_SESSIONS = 8
export const MIN_FOCUS_MINUTES = 1
export const MAX_FOCUS_MINUTES = 180
export const MIN_BREAK_MINUTES = 1
export const MAX_BREAK_MINUTES = 60
