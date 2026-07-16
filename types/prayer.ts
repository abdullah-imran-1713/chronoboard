export type PrayerAsrSchool = 'shafi' | 'hanafi'

export interface PrayerTimes {
  Fajr: string
  Sunrise: string
  Dhuhr: string
  Asr: string
  Maghrib: string
  Isha: string
}

export type PrayerName = keyof PrayerTimes

export const PRAYER_DISPLAY_ORDER: PrayerName[] = [
  'Fajr',
  'Sunrise',
  'Dhuhr',
  'Asr',
  'Maghrib',
  'Isha',
]

export const NEXT_PRAYER_ORDER = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const

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
