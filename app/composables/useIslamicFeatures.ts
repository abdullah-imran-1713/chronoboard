export type IslamicIntent =
  | { kind: 'hijri' }
  | { kind: 'widget', id: string }
  | { kind: 'reenable' }

const RELIGIOUS_WIDGET_IDS = ['prayer-times', 'quran-verse'] as const

const modalOpen = ref(false)
const pendingIntent = ref<IslamicIntent | null>(null)

export function useIslamicFeatures() {
  const settings = useSettingsStore()
  const widgetStore = useWidgetStore()

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

  function onReligiousWidgetToggle(id: string, enabled: boolean) {
    migrateIfNeeded()

    if (!enabled) {
      widgetStore.setWidgetEnabled(id, false)
      return
    }

    if (settings.islamicFeaturesPreference === 'enabled') {
      widgetStore.setWidgetEnabled(id, true)
      return
    }

    requestEnable({ kind: 'widget', id })
  }

  function accept() {
    const intent = pendingIntent.value
    settings.setIslamicFeaturesPreference('enabled')
    if (intent) {
      applyIntent(intent)
    }
    pendingIntent.value = null
    modalOpen.value = false
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
