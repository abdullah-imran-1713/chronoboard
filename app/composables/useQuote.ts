import { getDateKey, getQuoteIndexForDate, QUOTES, type Quote } from '../../utils/quotes'

const CACHE_PREFIX = 'chronoboard_quote_'

export function useQuote() {
  const quote = ref<Quote | null>(null)
  const loading = ref(true)

  function loadQuote() {
    if (!import.meta.client) return

    loading.value = true
    const dateKey = getDateKey()
    const cacheKey = `${CACHE_PREFIX}${dateKey}`

    try {
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        quote.value = JSON.parse(cached) as Quote
        loading.value = false
        return
      }
    } catch {
      // ignore corrupt cache
    }

    const index = getQuoteIndexForDate()
    const selected = QUOTES[index]!
    quote.value = selected
    localStorage.setItem(cacheKey, JSON.stringify(selected))
    loading.value = false
  }

  onMounted(loadQuote)

  return { quote, loading }
}
