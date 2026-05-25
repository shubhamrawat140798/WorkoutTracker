import { readFileSync } from 'fs'
import { config } from 'dotenv'
import { neon } from '@neondatabase/serverless'

config({ path: process.env.ENV_FILE || '.env.production.local' })

const url =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL_UNPOOLED

if (!url) {
  console.error('No DATABASE_URL found. Run: vercel env pull .env.production.local')
  process.exit(1)
}

const sql = neon(url)
const migration = readFileSync(new URL('../drizzle/0000_init.sql', import.meta.url), 'utf-8')

console.log('Running migration against Neon...')

try {
  await sql(migration)
  console.log('Migration complete — tables created.')
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err)
  if (msg.includes('already exists')) {
    console.log('Tables already exist — nothing to do.')
  } else {
    console.error('Migration failed:', msg)
    process.exit(1)
  }
}
