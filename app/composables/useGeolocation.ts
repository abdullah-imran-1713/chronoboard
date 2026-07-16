export type GeolocationCoords = { lat: number, lon: number }

export type GeolocationResult =
  | { ok: true, lat: number, lon: number }
  | { ok: false, reason: 'unsupported' | 'denied' | 'unavailable' }

export type LocationPurpose = 'weather' | 'prayer'

export type LocationAccessOutcome =
  | { kind: 'granted', lat: number, lon: number }
  | { kind: 'denied', reason: 'denied' | 'unavailable' | 'unsupported' | 'blocked' }

/** Shared across weather + prayer so one grant serves both widgets */
const cachedCoords = ref<GeolocationCoords | null>(null)

async function queryPermissionState(): Promise<PermissionState | 'unknown'> {
  if (!import.meta.client || !navigator.permissions?.query) return 'unknown'
  try {
    const status = await navigator.permissions.query({ name: 'geolocation' })
    return status.state
  }
  catch {
    return 'unknown'
  }
}

function readPosition(options?: PositionOptions): Promise<GeolocationResult> {
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
      options ?? { enableHighAccuracy: false, timeout: 20000, maximumAge: 300_000 },
    )
  })
}

export function useGeolocation() {
  const coords = computed(() => cachedCoords.value)

  /** Silent / cached read for widget mount after access was already granted */
  async function requestUserLocation(): Promise<GeolocationResult> {
    if (cachedCoords.value) {
      return { ok: true, ...cachedCoords.value }
    }

    const result = await readPosition()
    if (result.ok) {
      cachedCoords.value = { lat: result.lat, lon: result.lon }
    }
    return result
  }

  /**
   * Call from a user click when enabling weather / prayer.
   * Triggers the browser native location prompt when permission is undecided.
   * No custom soft-ask — one Allow only.
   */
  async function ensureLocationAccess(_purpose: LocationPurpose): Promise<LocationAccessOutcome> {
    if (!import.meta.client) {
      return { kind: 'denied', reason: 'unsupported' }
    }

    if (cachedCoords.value) {
      return { kind: 'granted', ...cachedCoords.value }
    }

    const permission = await queryPermissionState()
    if (permission === 'denied') {
      return { kind: 'denied', reason: 'blocked' }
    }

    const result = await readPosition({
      enableHighAccuracy: false,
      timeout: 20000,
      maximumAge: 0,
    })

    if (result.ok) {
      cachedCoords.value = { lat: result.lat, lon: result.lon }
      return { kind: 'granted', lat: result.lat, lon: result.lon }
    }

    return {
      kind: 'denied',
      reason: result.reason === 'denied' ? 'denied' : result.reason,
    }
  }

  return {
    coords,
    requestUserLocation,
    ensureLocationAccess,
  }
}
