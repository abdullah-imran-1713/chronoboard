import { loadGoogleFontForFamily } from '../../utils/fonts'

export default defineNuxtPlugin(() => {
  useThemeStore().applyTheme()
  const customization = useCustomizationStore()
  loadGoogleFontForFamily(customization.fontFamily)
  customization.applyToCSS()
})
