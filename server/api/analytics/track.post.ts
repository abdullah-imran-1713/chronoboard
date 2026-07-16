export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig(event)

  // Optional: forward to Plausible/Umami using config.analyticsSecret
  if (config.analyticsSecret) {
    // await $fetch('https://your-analytics-service/api/event', { ... })
  }

  if (import.meta.dev) {
    console.log('Analytics event:', body)
  }

  return { ok: true }
})
