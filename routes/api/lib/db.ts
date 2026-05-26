import { neon } from '@neondatabase/serverless'
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http'
import * as schema from './schema'
import { getDatabaseUrl } from './env'

let _db: NeonHttpDatabase<typeof schema> | null = null

export function getDb() {
  if (!_db) {
    const url = getDatabaseUrl()
    if (!url) {
      throw new Error(
        'DATABASE_URL is not set. Create .env.local with DATABASE_URL from Vercel (see README), or enable Development env on Vercel variables.',
      )
    }
    const sql = neon(url)
    _db = drizzle(sql, { schema })
  }
  return _db
}

export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_target, prop) {
    const instance = getDb()
    const value = instance[prop as keyof typeof instance]
    return typeof value === 'function' ? value.bind(instance) : value
  },
})
