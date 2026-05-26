import { existsSync } from 'fs'
import { config } from 'dotenv'

/** Load .env.local when present (same as the API server). */
export function loadEnv() {
  const envFile = process.env.ENV_FILE
  if (envFile) {
    config({ path: envFile, override: true })
    return
  }
  if (existsSync('.env.local')) {
    config({ path: '.env.local', override: true })
    return
  }
  for (const file of ['.env.development.local', '.env']) {
    if (existsSync(file)) config({ path: file, override: true })
  }
}

export function getDatabaseUrl() {
  loadEnv()
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING ||
    ''
  if (!url || url.length < 20 || /user:password@host/.test(url)) return ''
  return url
}
