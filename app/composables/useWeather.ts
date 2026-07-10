import { DEFAULT_WEATHER_LOCATION, type OpenWeatherResponse, type WeatherData } from '../../types/weather'

export function useWeather() {
  const weather = ref<WeatherData | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)
  const usingFallback = ref(false)

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
    } catch (e: unknown) {
      const fetchError = e as { data?: { message?: string }, message?: string }
      error.value = fetchError.data?.message ?? (e instanceof Error ? e.message : 'Failed to fetch weather')
      weather.value = null
    } finally {
      loading.value = false
    }
  }

  function getUserLocation(): Promise<{ lat: number, lon: number }> {
    return new Promise((resolve, reject) => {
      if (!import.meta.client || !navigator.geolocation) {
        reject(new Error('Geolocation not supported'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        err => reject(err),
      )
    })
  }

  async function init() {
    if (!import.meta.client) return

    loading.value = true
    error.value = null
    usingFallback.value = false

    try {
      const { lat, lon } = await getUserLocation()
      await fetchWeather(lat, lon)
    } catch {
      usingFallback.value = true
      await fetchWeather(DEFAULT_WEATHER_LOCATION.lat, DEFAULT_WEATHER_LOCATION.lon)
    }
  }

  return {
    weather,
    loading,
    error,
    usingFallback,
    init,
    fetchWeather,
  }
}
