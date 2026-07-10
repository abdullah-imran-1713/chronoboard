import type { OpenWeatherResponse } from '../../types/weather'

export default defineEventHandler(async (event): Promise<OpenWeatherResponse> => {
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

  const apiKey = useRuntimeConfig(event).weatherApiKey
  if (!apiKey) {
    throw createError({ statusCode: 500, message: 'Weather API key not configured' })
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`

  try {
    return await $fetch<OpenWeatherResponse>(url)
  } catch (error: unknown) {
    const fetchError = error as { statusCode?: number, data?: { message?: string } }
    const statusCode = fetchError.statusCode ?? 502
    const message = fetchError.data?.message ?? 'Failed to fetch weather data'

    throw createError({
      statusCode: statusCode === 401 ? 502 : statusCode,
      message: statusCode === 401 ? 'Weather service authentication failed' : message,
    })
  }
})
