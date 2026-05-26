import { readFileSync } from 'fs'
import { config } from 'dotenv'
import { neon } from '@neondatabase/serverless'

const envFile = process.env.ENV_FILE || '.env'
config({ path: envFile })

const url =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL_UNPOOLED

if (!url || url.length < 20 || /user:password@host/.test(url)) {
  console.log('Skipping migration — DATABASE_URL not configured')
  process.exit(0)
}

const sql = neon(url)
const migration = readFileSync(new URL('../drizzle/0000_init.sql', import.meta.url), 'utf-8')

const statements = migration
  .split(';')
  .map((s) => s.trim())
  .filter((s) => s.length > 0 && !s.startsWith('--'))

console.log(`Running ${statements.length} migration statements...`)

try {
  for (const stmt of statements) {
    await sql.query(stmt)
  }
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
