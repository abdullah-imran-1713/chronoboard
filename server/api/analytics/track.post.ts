export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // In production, send to your analytics service
  // Options: Plausible, Umami, or custom Supabase table

  console.log('Analytics event:', body)
  return { ok: true }
})
