import { existsSync, readFileSync } from 'fs'

const localPath = '.env.local'
const placeholder = /user:password@host/

function checkFile(path) {
  if (!existsSync(path)) return { ok: false, reason: 'missing' }
  const content = readFileSync(path, 'utf-8')
  const db = content.match(/^DATABASE_URL=(.*)$/m)?.[1]?.replace(/^["']|["']$/g, '') ?? ''
  const jwt = content.match(/^JWT_SECRET=(.*)$/m)?.[1]?.replace(/^["']|["']$/g, '') ?? ''
  if (!db || db.length < 20 || placeholder.test(db)) return { ok: false, reason: 'DATABASE_URL' }
  if (!jwt || jwt.length < 8) return { ok: false, reason: 'JWT_SECRET' }
  return { ok: true }
}

const local = checkFile(localPath)
const env = checkFile('.env')

if (local.ok || env.ok) {
  console.log('✓ Local env is configured. Run: npm run dev')
  process.exit(0)
}

console.log(`
Local env is not set up yet.

  npm run dev:vercel     ← easiest (uses Vercel secrets)

  OR copy DATABASE_URL + JWT_SECRET from Vercel dashboard into .env.local
  See .env.local.example
`)

process.exit(1)
