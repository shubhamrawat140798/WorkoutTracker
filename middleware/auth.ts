import { defineMiddleware } from 'nitro'
import { getSessionUser } from '../routes/api/lib/auth'

export default defineMiddleware(async (event) => {
  const url = new URL(event.req.url)
  if (!url.pathname.startsWith('/api/')) return

  const user = await getSessionUser(event)
  if (user) {
    event.context.user = user
  }
})
