export interface WeatherDayForecast {
  /** Expected high °C */
  tempMax: number
  /** Expected low °C */
  tempMin: number
  weatherCode: number
}

export interface WeatherData {
  temp: number
  description: string
  /** MDI icon name for UI */
  icon: string
  /** Synthetic day/night code (01d / 01n) for scheduling helpers */
  iconCode: string
  city: string
  humidity: number
  feelsLike: number
  /** Unix seconds (UTC) — used to refresh day/night icon at boundaries */
  sunrise: number
  sunset: number
  /** Next calendar day forecast (Open-Meteo daily) */
  tomorrow: WeatherDayForecast | null
}

/** Normalized payload from our /api/weather route */
export interface WeatherApiResponse {
  name: string
  temp: number
  feelsLike: number
  humidity: number
  weatherCode: number
  isDay: boolean
  cloudPercent: number
  sunrise: number
  sunset: number
  tomorrow: WeatherDayForecast | null
}
