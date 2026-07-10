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

  function update(manager: BatteryManagerLike) {
    level.value = Math.round(manager.level * 100)
    charging.value = manager.charging
  }

  const onLevelChange = () => {
    if (battery) update(battery)
  }

  onMounted(async () => {
    if (!import.meta.client) return

    const nav = navigator as Navigator & {
      getBattery?: () => Promise<BatteryManagerLike>
    }

    if (!nav.getBattery) {
      supported.value = false
      return
    }

    try {
      battery = await nav.getBattery()
      update(battery)
      battery.addEventListener('levelchange', onLevelChange)
      battery.addEventListener('chargingchange', onLevelChange)
    } catch {
      supported.value = false
    }
  })

  onUnmounted(() => {
    if (battery) {
      battery.removeEventListener('levelchange', onLevelChange)
      battery.removeEventListener('chargingchange', onLevelChange)
    }
  })

  return { level, charging, supported }
}
