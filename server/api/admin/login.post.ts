export default defineEventHandler(async (event) => {
  const { password } = await readBody(event)
  const adminPassword = useRuntimeConfig(event).adminPassword

  if (!adminPassword || password !== adminPassword) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  return { ok: true }
})
