import { existsSync } from 'fs'
import { config } from 'dotenv'

const PLACEHOLDER = /user:password@host/

let loaded = false

/** Load local env — .env.local wins; never let placeholder .env override it. */
export function loadServerEnv() {
  if (loaded) return
  loaded = true

  if (existsSync('.env.local')) {
    config({ path: '.env.local', override: true })
    return
  }

  for (const file of ['.env.development.local', '.env']) {
    if (existsSync(file)) {
      config({ path: file, override: true })
    }
  }
}

export function getDatabaseUrl(): string {
  loadServerEnv()
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING ||
    ''

  if (!url || PLACEHOLDER.test(url)) return ''
  return url
}

export function getJwtSecret(): string {
  loadServerEnv()
  const secret = process.env.JWT_SECRET || process.env.NITRO_JWT_SECRET || ''
  if (!secret || secret === 'JWT_SECRET' || secret.includes('your-32-char')) return ''
  return secret
}
