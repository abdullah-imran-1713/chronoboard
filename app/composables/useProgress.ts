import type { Ref } from 'vue'

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value))
}

export function useProgress(now: Ref<Date>) {
  const dayProgress = computed(() => {
    const d = now.value
    const totalMinutes = d.getHours() * 60 + d.getMinutes()
    return clampPercent(Math.round((totalMinutes / 1440) * 100))
  })

  const weekProgress = computed(() => {
    const d = now.value
    const dayOfWeek = (d.getDay() + 6) % 7
    const totalMinutes = dayOfWeek * 1440 + d.getHours() * 60 + d.getMinutes()
    return clampPercent(Math.round((totalMinutes / (7 * 1440)) * 100))
  })

  const monthProgress = computed(() => {
    const d = now.value
    const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
    const currentDay = d.getDate() - 1 + (d.getHours() * 60 + d.getMinutes()) / 1440
    return clampPercent(Math.round((currentDay / daysInMonth) * 100))
  })

  const yearProgress = computed(() => {
    const d = now.value
    const startOfYear = new Date(d.getFullYear(), 0, 1).getTime()
    const endOfYear = new Date(d.getFullYear() + 1, 0, 1).getTime()
    return clampPercent(Math.round(((d.getTime() - startOfYear) / (endOfYear - startOfYear)) * 100))
  })

  return {
    dayProgress,
    weekProgress,
    monthProgress,
    yearProgress,
  }
}
