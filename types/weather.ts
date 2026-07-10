export interface WeatherData {
  temp: number
  description: string
  icon: string
  city: string
  humidity: number
  feelsLike: number
}

export interface OpenWeatherResponse {
  name: string
  main: {
    temp: number
    feels_like: number
    humidity: number
  }
  weather: Array<{
    description: string
    icon: string
  }>
}

export const DEFAULT_WEATHER_LOCATION = {
  lat: 31.5204,
  lon: 74.3587,
  label: 'Lahore',
} as const
