export type ClockFormat = '12h' | '24h'

export interface ClockSettings {
  format: ClockFormat
  showSeconds: boolean
  blinkingColon: boolean
  showDate: boolean
  showHijriDate: boolean
}
