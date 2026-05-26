import { existsSync } from 'fs'
import { config } from 'dotenv'

if (existsSync('.env.local')) {
  config({ path: '.env.local', override: true })
} else {
  for (const file of ['.env.development.local', '.env']) {
    if (existsSync(file)) config({ path: file, override: true })
  }
}

const url =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  ''
const jwt = process.env.JWT_SECRET || process.env.NITRO_JWT_SECRET || ''
const isPlaceholder = !url || url.length < 20 || /user:password@host/.test(url)
const missingJwt = !jwt || jwt.includes('your-32-char')

if (!isPlaceholder && !missingJwt) {
  console.log('✓ Local env configured (.env.local)')
  process.exit(0)
}

console.error(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Local database not configured (production still works)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create .env.local with secrets from Vercel (one-time setup):
  ───────────────────────────────────────────────────────────
  Your .env has placeholder values. Vercel "Development" env is empty.

  1. Vercel → workout-tracker → Settings → Environment Variables
  2. Reveal DATABASE_URL and JWT_SECRET → copy both
  3. Create file .env.local in this folder:

     DATABASE_URL=<paste>
     JWT_SECRET=<paste>
     APP_URL=http://localhost:3000

  4. npm run dev:vercel
     Open the URL from terminal (e.g. http://localhost:3001)

  Optional: In Vercel, edit env vars → enable "Development" checkbox

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)
process.exit(1)
