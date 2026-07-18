import type { WeatherApiResponse } from '../../types/weather'

interface OpenMeteoForecast {
  current: {
    temperature_2m: number
    apparent_temperature: number
    relative_humidity_2m: number
    weather_code: number
    is_day: number
    cloud_cover: number
  }
  daily: {
    weather_code: number[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    sunrise: string[]
    sunset: string[]
  }
}

interface ReverseGeo {
  city?: string
  locality?: string
  principalSubdivision?: string
  countryName?: string
}

function toUnixSeconds(isoLocal: string): number {
  const ms = Date.parse(isoLocal)
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : Math.floor(Date.now() / 1000)
}

async function resolveCityName(lat: number, lon: number): Promise<string> {
  try {
    const geo = await $fetch<ReverseGeo>('https://api.bigdatacloud.net/data/reverse-geocode-client', {
      params: {
        latitude: lat,
        longitude: lon,
        localityLanguage: 'en',
      },
    })
    return geo.city || geo.locality || geo.principalSubdivision || 'Your location'
  }
  catch {
    return 'Your location'
  }
}

export default defineEventHandler(async (event): Promise<WeatherApiResponse> => {
  const query = getQuery(event)
  const { lat, lon } = query

  if (!lat || !lon) {
    throw createError({ statusCode: 400, message: 'lat and lon are required' })
  }

  const latitude = Number(lat)
  const longitude = Number(lon)

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw createError({ statusCode: 400, message: 'lat and lon must be valid numbers' })
  }

  try {
    const [forecast, city] = await Promise.all([
      $fetch<OpenMeteoForecast>('https://api.open-meteo.com/v1/forecast', {
        params: {
          latitude,
          longitude,
          current: 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,is_day,cloud_cover',
          daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset',
          timezone: 'auto',
          forecast_days: 2,
        },
      }),
      resolveCityName(latitude, longitude),
    ])

    const current = forecast.current
    const sunriseIso = forecast.daily.sunrise[0]
    const sunsetIso = forecast.daily.sunset[0]

    const tomorrowCode = forecast.daily.weather_code[1]
    const tomorrowMax = forecast.daily.temperature_2m_max[1]
    const tomorrowMin = forecast.daily.temperature_2m_min[1]
    const tomorrow = (
      typeof tomorrowCode === 'number'
      && typeof tomorrowMax === 'number'
      && typeof tomorrowMin === 'number'
    )
      ? {
          tempMax: Math.round(tomorrowMax),
          tempMin: Math.round(tomorrowMin),
          weatherCode: tomorrowCode,
        }
      : null

    return {
      name: city,
      temp: current.temperature_2m,
      feelsLike: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      weatherCode: current.weather_code,
      isDay: current.is_day === 1,
      cloudPercent: current.cloud_cover,
      sunrise: sunriseIso ? toUnixSeconds(sunriseIso) : Math.floor(Date.now() / 1000),
      sunset: sunsetIso ? toUnixSeconds(sunsetIso) : Math.floor(Date.now() / 1000),
      tomorrow,
    }
  }
  catch (error: unknown) {
    const fetchError = error as { statusCode?: number, data?: { message?: string }, message?: string }
    throw createError({
      statusCode: fetchError.statusCode && fetchError.statusCode < 500 ? fetchError.statusCode : 502,
      message: fetchError.data?.message ?? fetchError.message ?? 'Failed to fetch weather data',
    })
  }
})
