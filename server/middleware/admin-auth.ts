export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  if (!url.pathname.startsWith('/api/admin')) return
  if (url.pathname === '/api/admin/login') return

  const authHeader = getHeader(event, 'authorization')
  const adminPassword = useRuntimeConfig(event).adminPassword

  if (!adminPassword || authHeader !== `Bearer ${adminPassword}`) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
})
