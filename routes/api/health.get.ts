import { defineHandler } from 'nitro'
import { sql } from 'drizzle-orm'
import { getDatabaseUrl, getJwtSecret } from './lib/env'
import { getDb } from './lib/db'

export default defineHandler(async () => {
  const hasDbUrl = Boolean(getDatabaseUrl())
  const hasJwt = Boolean(getJwtSecret())

  if (!hasDbUrl) {
    return {
      ok: false,
      database: 'error',
      message:
        'DATABASE_URL missing. Add .env.local (copy from Vercel dashboard) or enable Development on Vercel env vars.',
      env: { hasDbUrl, hasJwt },
    }
  }

  try {
    const db = getDb()
    await db.execute(sql`SELECT 1`)
    return { ok: true, database: 'connected', env: { hasDbUrl, hasJwt } }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Database unavailable'
    return { ok: false, database: 'error', message, env: { hasDbUrl, hasJwt } }
  }
})
