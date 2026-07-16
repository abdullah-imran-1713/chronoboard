import { useGeolocation } from './useGeolocation'

export type IslamicIntent =
  | { kind: 'hijri' }
  | { kind: 'widget', id: string }
  | { kind: 'reenable' }

const RELIGIOUS_WIDGET_IDS = ['prayer-times', 'quran-verse'] as const
const PRAYER_TIMES_WIDGET_ID = 'prayer-times'

export type ReligiousWidgetToggleResult = 'ok' | 'location_denied' | 'pending'

const modalOpen = ref(false)
const pendingIntent = ref<IslamicIntent | null>(null)

export function useIslamicFeatures() {
  const settings = useSettingsStore()
  const widgetStore = useWidgetStore()
  const { requestUserLocation } = useGeolocation()

  const preference = computed(() => settings.islamicFeaturesPreference)
  const isEnabled = computed(() => settings.islamicFeaturesPreference === 'enabled')
  const isHidden = computed(() => settings.islamicFeaturesPreference === 'hidden')
  const open = computed(() => modalOpen.value)

  function migrateIfNeeded() {
    if (settings.islamicFeaturesPreference !== null) return

    const hasReligiousWidget = RELIGIOUS_WIDGET_IDS.some(id => widgetStore.isEnabled(id))
    if (settings.showHijriDate || hasReligiousWidget) {
      settings.setIslamicFeaturesPreference('enabled')
    }
  }

  function applyIntent(intent: IslamicIntent) {
    if (intent.kind === 'hijri' || intent.kind === 'reenable') {
      settings.showHijriDate = true
    }
    if (intent.kind === 'widget') {
      widgetStore.setWidgetEnabled(intent.id, true)
    }
  }

  function disableReligiousContent() {
    settings.showHijriDate = false
    for (const id of RELIGIOUS_WIDGET_IDS) {
      widgetStore.setWidgetEnabled(id, false)
    }
  }

  function requestEnable(intent: IslamicIntent) {
    migrateIfNeeded()

    const pref = settings.islamicFeaturesPreference

    if (pref === 'enabled') {
      applyIntent(intent)
      return
    }

    pendingIntent.value = intent
    modalOpen.value = true
  }

  function onHijriToggle(enabled: boolean) {
    migrateIfNeeded()

    if (!enabled) {
      settings.showHijriDate = false
      return
    }

    if (settings.islamicFeaturesPreference === 'enabled') {
      settings.showHijriDate = true
      return
    }

    requestEnable({ kind: 'hijri' })
  }

  async function tryEnablePrayerTimesWidget(): Promise<boolean> {
    const location = await requestUserLocation()
    if (!location.ok) return false
    widgetStore.setWidgetEnabled(PRAYER_TIMES_WIDGET_ID, true)
    return true
  }

  async function onReligiousWidgetToggle(id: string, enabled: boolean): Promise<ReligiousWidgetToggleResult> {
    migrateIfNeeded()

    if (!enabled) {
      widgetStore.setWidgetEnabled(id, false)
      return 'ok'
    }

    if (id === PRAYER_TIMES_WIDGET_ID) {
      if (settings.islamicFeaturesPreference === 'enabled') {
        const granted = await tryEnablePrayerTimesWidget()
        return granted ? 'ok' : 'location_denied'
      }

      requestEnable({ kind: 'widget', id })
      return 'pending'
    }

    if (settings.islamicFeaturesPreference === 'enabled') {
      widgetStore.setWidgetEnabled(id, true)
      return 'ok'
    }

    requestEnable({ kind: 'widget', id })
    return 'pending'
  }

  async function accept(): Promise<ReligiousWidgetToggleResult> {
    const intent = pendingIntent.value
    settings.setIslamicFeaturesPreference('enabled')

    let result: ReligiousWidgetToggleResult = 'ok'
    if (intent) {
      if (intent.kind === 'widget' && intent.id === PRAYER_TIMES_WIDGET_ID) {
        const granted = await tryEnablePrayerTimesWidget()
        result = granted ? 'ok' : 'location_denied'
      }
      else {
        applyIntent(intent)
      }
    }

    pendingIntent.value = null
    modalOpen.value = false
    return result
  }

  function decline() {
    settings.setIslamicFeaturesPreference('hidden')
    disableReligiousContent()
    pendingIntent.value = null
    modalOpen.value = false
  }

  function dismiss() {
    // Closing without choosing keeps preference unset and does not enable features
    pendingIntent.value = null
    modalOpen.value = false
  }

  function requestReenable() {
    requestEnable({ kind: 'reenable' })
  }

  return {
    open,
    preference,
    isEnabled,
    isHidden,
    religiousWidgetIds: RELIGIOUS_WIDGET_IDS,
    migrateIfNeeded,
    onHijriToggle,
    onReligiousWidgetToggle,
    requestReenable,
    accept,
    decline,
    dismiss,
  }
}
