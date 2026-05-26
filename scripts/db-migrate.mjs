import { readFileSync, readdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { neon } from '@neondatabase/serverless'
import { getDatabaseUrl } from './load-env.mjs'

const url = getDatabaseUrl()

if (!url || url.length < 20 || /user:password@host/.test(url)) {
  console.log('Skipping migration — DATABASE_URL not configured')
  process.exit(0)
}

const sql = neon(url)
const drizzleDir = fileURLToPath(new URL('../drizzle', import.meta.url))
const files = readdirSync(drizzleDir)
  .filter((f) => f.endsWith('.sql'))
  .sort()

for (const file of files) {
  const migration = readFileSync(`${drizzleDir}/${file}`, 'utf-8')
  const statements = migration
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--'))

  console.log(`Running ${file} (${statements.length} statements)...`)

  for (const stmt of statements) {
    try {
      await sql.query(stmt)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('already exists') || msg.includes('duplicate')) {
        continue
      }
      console.error(`Migration failed in ${file}:`, msg)
      process.exit(1)
    }
  }
}

console.log('Migrations complete.')
