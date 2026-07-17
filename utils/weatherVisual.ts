/** Map WMO weather codes (Open-Meteo) + cloud cover to Google-style labels/icons. */

export type WeatherVisual = {
  label: string
  icon: string
  iconCode: string
}

function fromClouds(day: boolean, clouds: number): WeatherVisual | null {
  if (clouds <= 15) {
    return {
      label: day ? 'Clear' : 'Clear night',
      icon: day ? 'mdi:weather-sunny' : 'mdi:weather-night',
      iconCode: day ? '01d' : '01n',
    }
  }
  if (clouds <= 40) {
    return {
      label: day ? 'Mostly sunny' : 'Mostly clear',
      icon: day ? 'mdi:weather-partly-cloudy' : 'mdi:weather-night-partly-cloudy',
      iconCode: day ? '02d' : '02n',
    }
  }
  if (clouds <= 70) {
    return {
      label: 'Partly cloudy',
      icon: day ? 'mdi:weather-partly-cloudy' : 'mdi:weather-night-partly-cloudy',
      iconCode: day ? '03d' : '03n',
    }
  }
  if (clouds <= 85) {
    return {
      label: 'Mostly cloudy',
      icon: day ? 'mdi:weather-partly-cloudy' : 'mdi:weather-cloudy',
      iconCode: day ? '04d' : '04n',
    }
  }
  return {
    label: 'Cloudy',
    icon: 'mdi:weather-cloudy',
    iconCode: day ? '04d' : '04n',
  }
}

export function resolveWeatherVisual(input: {
  weatherCode: number
  isDay: boolean
  cloudPercent?: number
}): WeatherVisual {
  const day = input.isDay
  const code = input.weatherCode
  const clouds = input.cloudPercent

  // Clear / cloudy family — prefer measured cloud cover when available
  if ((code === 0 || code === 1 || code === 2 || code === 3) && typeof clouds === 'number') {
    const fromCover = fromClouds(day, clouds)
    if (fromCover) return fromCover
  }

  if (code === 0) {
    return {
      label: day ? 'Clear' : 'Clear night',
      icon: day ? 'mdi:weather-sunny' : 'mdi:weather-night',
      iconCode: day ? '01d' : '01n',
    }
  }
  if (code === 1) {
    return {
      label: day ? 'Mostly sunny' : 'Mostly clear',
      icon: day ? 'mdi:weather-partly-cloudy' : 'mdi:weather-night-partly-cloudy',
      iconCode: day ? '02d' : '02n',
    }
  }
  if (code === 2) {
    return {
      label: 'Partly cloudy',
      icon: day ? 'mdi:weather-partly-cloudy' : 'mdi:weather-night-partly-cloudy',
      iconCode: day ? '03d' : '03n',
    }
  }
  if (code === 3) {
    return {
      label: 'Cloudy',
      icon: 'mdi:weather-cloudy',
      iconCode: day ? '04d' : '04n',
    }
  }
  if (code === 45 || code === 48) {
    return { label: 'Fog', icon: 'mdi:weather-fog', iconCode: day ? '50d' : '50n' }
  }
  if (code >= 51 && code <= 57) {
    return { label: 'Drizzle', icon: 'mdi:weather-rainy', iconCode: day ? '09d' : '09n' }
  }
  if (code >= 61 && code <= 67) {
    return { label: 'Rain', icon: 'mdi:weather-rainy', iconCode: day ? '10d' : '10n' }
  }
  if (code >= 71 && code <= 77) {
    return { label: 'Snow', icon: 'mdi:weather-snowy', iconCode: day ? '13d' : '13n' }
  }
  if (code >= 80 && code <= 82) {
    return { label: 'Showers', icon: 'mdi:weather-pouring', iconCode: day ? '09d' : '09n' }
  }
  if (code >= 85 && code <= 86) {
    return { label: 'Snow showers', icon: 'mdi:weather-snowy-heavy', iconCode: day ? '13d' : '13n' }
  }
  if (code >= 95 && code <= 99) {
    return { label: 'Thunderstorm', icon: 'mdi:weather-lightning-rainy', iconCode: day ? '11d' : '11n' }
  }

  return {
    label: 'Weather',
    icon: day ? 'mdi:weather-partly-cloudy' : 'mdi:weather-cloudy',
    iconCode: day ? '03d' : '03n',
  }
}
