import type { OpenWeatherResponse, WeatherData } from '../../types/weather'
import { useGeolocation } from './useGeolocation'

export function useWeather() {
  const { requestUserLocation } = useGeolocation()
  const weather = ref<WeatherData | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  async function fetchWeather(lat: number, lon: number) {
    loading.value = true
    error.value = null

    try {
      const data = await $fetch<OpenWeatherResponse>('/api/weather', {
        params: { lat, lon },
      })

      weather.value = {
        temp: Math.round(data.main.temp),
        description: data.weather[0]?.description ?? '',
        icon: data.weather[0]?.icon ?? '01d',
        city: data.name,
        humidity: data.main.humidity,
        feelsLike: Math.round(data.main.feels_like),
      }
    }
    catch (e: unknown) {
      const fetchError = e as { data?: { message?: string }, message?: string }
      error.value = fetchError.data?.message ?? (e instanceof Error ? e.message : 'Failed to fetch weather')
      weather.value = null
    }
    finally {
      loading.value = false
    }
  }

  async function init() {
    if (!import.meta.client) return

    loading.value = true
    error.value = null

    const location = await requestUserLocation()
    if (!location.ok) {
      error.value = 'Location needed for weather'
      weather.value = null
      loading.value = false
      return
    }

    await fetchWeather(location.lat, location.lon)
  }

  return {
    weather,
    loading,
    error,
    init,
    fetchWeather,
  }
}
