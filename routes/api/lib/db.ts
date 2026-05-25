import { neon } from '@neondatabase/serverless'
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http'
import * as schema from './schema'

let _db: NeonHttpDatabase<typeof schema> | null = null

const PLACEHOLDER_PATTERN = /user:password@host/

export function getDb() {
  if (!_db) {
    const url = process.env.DATABASE_URL
    if (!url) {
      throw new Error('DATABASE_URL is not set')
    }
    if (PLACEHOLDER_PATTERN.test(url)) {
      throw new Error(
        'DATABASE_URL is still the example placeholder. Replace it with your Neon connection string in .env',
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
