export type GeolocationResult =
  | { ok: true, lat: number, lon: number }
  | { ok: false, reason: 'unsupported' | 'denied' | 'unavailable' }

export function useGeolocation() {
  function requestUserLocation(): Promise<GeolocationResult> {
    return new Promise((resolve) => {
      if (!import.meta.client || !navigator.geolocation) {
        resolve({ ok: false, reason: 'unsupported' })
        return
      }

      navigator.geolocation.getCurrentPosition(
        pos => resolve({
          ok: true,
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        }),
        (err) => {
          if (err.code === err.PERMISSION_DENIED) {
            resolve({ ok: false, reason: 'denied' })
          }
          else {
            resolve({ ok: false, reason: 'unavailable' })
          }
        },
        // Match weather: allow cached position; avoid aggressive fresh-GPS timeouts
        { enableHighAccuracy: false, timeout: 20000, maximumAge: 300_000 },
      )
    })
  }

  return { requestUserLocation }
}
