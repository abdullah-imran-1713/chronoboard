export default defineEventHandler(() => {
  const config = useRuntimeConfig()

  return {
    visitors: 0,
    pageviews: 0,
    message: config.analyticsSecret
      ? 'Analytics secret configured — connect Plausible/Umami API here.'
      : 'Set NUXT_ANALYTICS_SECRET and connect your analytics service to see data here.',
  }
})
