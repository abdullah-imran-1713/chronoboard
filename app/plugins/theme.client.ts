import { loadGoogleFontForFamily } from '../../utils/fonts'

export default defineNuxtPlugin(() => {
  const themeStore = useThemeStore()
  themeStore.migrateLegacyTheme()
  themeStore.syncSystemListener()
  themeStore.applyTheme()

  const customization = useCustomizationStore()
  loadGoogleFontForFamily(customization.fontFamily)
  customization.applyToCSS()
})
