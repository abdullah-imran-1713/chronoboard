export default defineNuxtPlugin(() => {
  const router = useRouter()

  function track(event: string, data?: Record<string, unknown>) {
    $fetch('/api/analytics/track', {
      method: 'POST',
      body: {
        event,
        url: window.location.pathname,
        timestamp: new Date().toISOString(),
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        ...data,
      },
    }).catch(() => {})
  }

  track('pageview')

  router.afterEach((to) => {
    track('pageview', { url: to.path })
  })
})
