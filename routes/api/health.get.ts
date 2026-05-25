import { defineHandler } from 'nitro'
import { sql } from 'drizzle-orm'
import { getDb } from './lib/db'

export default defineHandler(async () => {
  try {
    const db = getDb()
    await db.execute(sql`SELECT 1`)
    return { ok: true, database: 'connected' }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Database unavailable'
    return { ok: false, database: 'error', message }
  }
})
