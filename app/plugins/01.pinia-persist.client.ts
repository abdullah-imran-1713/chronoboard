import { watch } from 'vue'
import type { Pinia } from 'pinia'

export default defineNuxtPlugin(({ $pinia }) => {
  const pinia = $pinia as Pinia

  const PERSIST_STORES = ['settings', 'theme', 'widgets', 'customization', 'layout']

  pinia.use(({ store }) => {
    const storeId = store.$id

    if (!PERSIST_STORES.includes(storeId)) return

    const storageKey = `chronoboard_${storeId}`

    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        store.$patch(parsed)
      }
      catch (e) {
        console.warn(`Failed to restore store "${storeId}" from localStorage`, e)
        localStorage.removeItem(storageKey)
      }
    }

    watch(
      () => store.$state,
      (state) => {
        localStorage.setItem(storageKey, JSON.stringify(state))
      },
      { deep: true },
    )
  })
})
