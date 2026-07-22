export type PrayerAsrSchool = 'shafi' | 'hanafi'

export interface PrayerTimes {
  Fajr: string
  Sunrise: string
  Dhuhr: string
  Asr: string
  Sunset: string
  Maghrib: string
  Isha: string
}

export type PrayerName = keyof PrayerTimes

/** Full list including solar markers (Sunrise / Sunset) */
export const PRAYER_DISPLAY_ORDER: PrayerName[] = [
  'Fajr',
  'Sunrise',
  'Dhuhr',
  'Asr',
  'Sunset',
  'Maghrib',
  'Isha',
]

export const SOLAR_TIME_NAMES: ReadonlySet<PrayerName> = new Set(['Sunrise', 'Sunset'])

/** Includes Sunrise so Fajr window counts down until sunrise, not Dhuhr */
export const NEXT_PRAYER_ORDER = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const

export type NextPrayerName = typeof NEXT_PRAYER_ORDER[number]

export interface NextPrayer {
  name: NextPrayerName
  time: string
  countdown: string
}

export interface AladhanTimingsResponse {
  data: {
    timings: Record<string, string>
  }
}
