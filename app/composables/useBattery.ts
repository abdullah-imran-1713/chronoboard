interface BatteryManagerLike {
  level: number
  charging: boolean
  addEventListener: (type: string, listener: () => void) => void
  removeEventListener: (type: string, listener: () => void) => void
}

export function useBattery() {
  const level = ref<number | null>(null)
  const charging = ref(false)
  const supported = ref(true)
  let battery: BatteryManagerLike | null = null
  let pollTimer: ReturnType<typeof setInterval> | null = null

  function update(manager: BatteryManagerLike) {
    level.value = Math.round(manager.level * 100)
    charging.value = Boolean(manager.charging)
  }

  const syncFromBattery = () => {
    if (battery) update(battery)
  }

  onMounted(async () => {
    if (!import.meta.client) return

    const nav = navigator as Navigator & {
      getBattery?: () => Promise<BatteryManagerLike>
    }

    if (typeof nav.getBattery !== 'function') {
      supported.value = false
      return
    }

    try {
      battery = await nav.getBattery()
      update(battery)
      battery.addEventListener('levelchange', syncFromBattery)
      battery.addEventListener('chargingchange', syncFromBattery)
      // Some Android / WebView tablets miss chargingchange — poll as backup
      pollTimer = setInterval(syncFromBattery, 8_000)
    }
    catch {
      supported.value = false
    }
  })

  onUnmounted(() => {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
    if (battery) {
      battery.removeEventListener('levelchange', syncFromBattery)
      battery.removeEventListener('chargingchange', syncFromBattery)
    }
  })

  return { level, charging, supported }
}

/** Stable MDI names — prefer bundled icons so tablets don’t miss the charging glyph */
export function batteryIconName(level: number | null, charging: boolean): string {
  const pct = Math.max(0, Math.min(100, level ?? 0))

  if (charging) {
    if (pct >= 95) return 'mdi:battery-charging-100'
    if (pct >= 85) return 'mdi:battery-charging-90'
    if (pct >= 75) return 'mdi:battery-charging-80'
    if (pct >= 65) return 'mdi:battery-charging-70'
    if (pct >= 55) return 'mdi:battery-charging-60'
    if (pct >= 45) return 'mdi:battery-charging-50'
    if (pct >= 35) return 'mdi:battery-charging-40'
    if (pct >= 25) return 'mdi:battery-charging-30'
    if (pct >= 15) return 'mdi:battery-charging-20'
    return 'mdi:battery-charging-10'
  }

  if (pct >= 95) return 'mdi:battery'
  if (pct >= 85) return 'mdi:battery-90'
  if (pct >= 75) return 'mdi:battery-80'
  if (pct >= 65) return 'mdi:battery-70'
  if (pct >= 55) return 'mdi:battery-60'
  if (pct >= 45) return 'mdi:battery-50'
  if (pct >= 35) return 'mdi:battery-40'
  if (pct >= 25) return 'mdi:battery-30'
  if (pct >= 15) return 'mdi:battery-20'
  if (pct >= 5) return 'mdi:battery-10'
  return 'mdi:battery-outline'
}
