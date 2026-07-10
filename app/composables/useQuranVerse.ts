import { getDateKey } from '../../utils/quotes'

export interface QuranVerse {
  arabic: string
  translation: string
  surah: string
  ayah: number
}

interface AlQuranEdition {
  text: string
  edition?: { identifier: string }
  surah: {
    englishName: string
    number: number
  }
  numberInSurah: number
}

interface AlQuranRandomResponse {
  data: AlQuranEdition[]
}

export function useQuranVerse() {
  const verse = ref<QuranVerse | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  function getVerseNumberForToday(): number {
    const dateKey = getDateKey()
    const [y, m, d] = dateKey.split('-').map(Number)
    const seed = (y ?? 0) * 10000 + (m ?? 0) * 100 + (d ?? 0)
    return (seed % 6236) + 1
  }

  async function fetchVerse() {
    if (!import.meta.client) return

    loading.value = true
    error.value = null

    try {
      const ayahNumber = getVerseNumberForToday()
      const url = `https://api.alquran.cloud/v1/ayah/${ayahNumber}/editions/quran-uthmani,en.asad`
      const response = await $fetch<AlQuranRandomResponse>(url)
      const editions = response.data

      const arabicEdition = editions.find(e => e.edition?.identifier === 'quran-uthmani') ?? editions[0]
      const englishEdition = editions.find(e => e.edition?.identifier === 'en.asad') ?? editions[1]

      verse.value = {
        arabic: arabicEdition?.text ?? '',
        translation: englishEdition?.text ?? '',
        surah: arabicEdition?.surah.englishName ?? 'Quran',
        ayah: arabicEdition?.numberInSurah ?? ayahNumber,
      }
    } catch {
      error.value = 'Failed to load verse'
      verse.value = null
    } finally {
      loading.value = false
    }
  }

  onMounted(fetchVerse)

  return { verse, loading, error, refresh: fetchVerse }
}
