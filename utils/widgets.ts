export interface AmbientSound {
  id: string
  label: string
  icon: string
  file: string
}

export const AMBIENT_SOUNDS: AmbientSound[] = [
  { id: 'rain', label: 'Rain', icon: 'mdi:weather-rainy', file: '/sounds/rain.mp3' },
  { id: 'cafe', label: 'Cafe', icon: 'mdi:coffee', file: '/sounds/cafe.mp3' },
  { id: 'fireplace', label: 'Fireplace', icon: 'mdi:fireplace', file: '/sounds/fireplace.mp3' },
  { id: 'wind', label: 'Wind', icon: 'mdi:weather-windy', file: '/sounds/wind.mp3' },
  { id: 'waves', label: 'Waves', icon: 'mdi:waves', file: '/sounds/waves.mp3' },
]

export const WORLD_CLOCK_STORAGE_KEY = 'chronoboard_world_clock_zones'

export const DEFAULT_WORLD_CLOCK_ZONES = [
  'Asia/Karachi',
  'UTC',
  'America/New_York',
  'Europe/London',
] as const

export const FALLBACK_TIMEZONES = [
  'UTC',
  'Asia/Karachi',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Europe/London',
  'Europe/Paris',
  'America/New_York',
  'America/Los_Angeles',
  'Australia/Sydney',
  'Pacific/Auckland',
]
