import type { WeatherApiResponse, WeatherData } from '../../types/weather'
import { resolveWeatherVisual } from '../../utils/weatherVisual'
import { useGeolocation } from './useGeolocation'

const AUTO_REFRESH_MS = 12 * 60 * 1000
const STALE_ON_VISIBLE_MS = 8 * 60 * 1000

export function useWeather() {
  const { requestUserLocation, refreshUserLocation } = useGeolocation()
  const weather = ref<WeatherData | null>(null)
  const loading = ref(true)
  const refreshing = ref(false)
  const error = ref<string | null>(null)
  const lastFetchedAt = ref(0)

  let intervalId: ReturnType<typeof setInterval> | null = null
  let boundaryTimer: ReturnType<typeof setTimeout> | null = null

  function clearSchedulers() {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
    if (boundaryTimer) {
      clearTimeout(boundaryTimer)
      boundaryTimer = null
    }
  }

  /** Next sunrise/sunset so day↔night icon updates without waiting for the periodic tick */
  function scheduleDayNightRefresh(sunrise: number, sunset: number) {
    if (boundaryTimer) {
      clearTimeout(boundaryTimer)
      boundaryTimer = null
    }

    const nowSec = Math.floor(Date.now() / 1000)
    const candidates = [sunrise, sunset]
      .map(t => (t > nowSec ? t : t + 86_400))
      .sort((a, b) => a - b)

    const nextAt = candidates[0]
    if (!nextAt) return

    // Small buffer past the boundary so the API has flipped d/n icons
    const delay = Math.max(5_000, (nextAt - nowSec) * 1000 + 15_000)
    boundaryTimer = setTimeout(() => {
      void loadWeather({ forceLocation: false, soft: true })
    }, delay)
  }

  function startAutoRefresh() {
    clearSchedulers()
    if (!import.meta.client) return

    intervalId = setInterval(() => {
      void loadWeather({ forceLocation: false, soft: true })
    }, AUTO_REFRESH_MS)

    if (weather.value) {
      scheduleDayNightRefresh(weather.value.sunrise, weather.value.sunset)
    }
  }

  async function fetchWeather(lat: number, lon: number) {
    const data = await $fetch<WeatherApiResponse>('/api/weather', {
      params: { lat, lon },
    })

    const visual = resolveWeatherVisual({
      weatherCode: data.weatherCode,
      isDay: data.isDay,
      cloudPercent: data.cloudPercent,
    })

    weather.value = {
      temp: Math.round(data.temp),
      description: visual.label,
      icon: visual.icon,
      iconCode: visual.iconCode,
      city: data.name,
      humidity: data.humidity,
      feelsLike: Math.round(data.feelsLike),
      sunrise: data.sunrise,
      sunset: data.sunset,
      tomorrow: data.tomorrow
        ? {
            tempMax: data.tomorrow.tempMax,
            tempMin: data.tomorrow.tempMin,
            weatherCode: data.tomorrow.weatherCode,
          }
        : null,
    }
    lastFetchedAt.value = Date.now()
    scheduleDayNightRefresh(data.sunrise, data.sunset)
  }

  async function loadWeather(options?: { forceLocation?: boolean, soft?: boolean }) {
    if (!import.meta.client) return

    const soft = options?.soft === true && weather.value !== null
    const forceLocation = options?.forceLocation === true

    if (soft) {
      refreshing.value = true
    }
    else {
      loading.value = true
    }
    error.value = null

    try {
      const location = forceLocation
        ? await refreshUserLocation({ force: true })
        : await requestUserLocation()

      if (!location.ok) {
        error.value = 'Location needed for weather'
        if (!soft) weather.value = null
        return
      }

      await fetchWeather(location.lat, location.lon)
    }
    catch (e: unknown) {
      const fetchError = e as { data?: { message?: string }, message?: string }
      error.value = fetchError.data?.message ?? (e instanceof Error ? e.message : 'Failed to fetch weather')
      if (!soft) weather.value = null
    }
    finally {
      loading.value = false
      refreshing.value = false
    }
  }

  async function init() {
    await loadWeather({ forceLocation: false, soft: false })
    startAutoRefresh()
  }

  /** Manual refresh — re-reads location (new city) + weather */
  async function refresh(): Promise<{ ok: true, city: string } | { ok: false, message: string }> {
    await loadWeather({ forceLocation: true, soft: true })
    if (error.value && !weather.value) {
      return { ok: false, message: error.value }
    }
    if (error.value) {
      return { ok: false, message: error.value }
    }
    if (!weather.value) {
      return { ok: false, message: 'Couldn’t refresh weather' }
    }
    return { ok: true, city: weather.value.city }
  }

  function onVisibility() {
    if (document.visibilityState !== 'visible') return
    if (!lastFetchedAt.value) return
    if (Date.now() - lastFetchedAt.value < STALE_ON_VISIBLE_MS) return
    void loadWeather({ forceLocation: false, soft: true })
  }

  function stop() {
    clearSchedulers()
    if (import.meta.client) {
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }

  if (import.meta.client) {
    document.addEventListener('visibilitychange', onVisibility)
  }

  onUnmounted(stop)

  return {
    weather,
    loading,
    refreshing,
    error,
    lastFetchedAt,
    init,
    refresh,
    fetchWeather,
  }
}
