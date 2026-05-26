import { existsSync, readFileSync, writeFileSync } from 'fs'

const envPath = '.env'
const placeholder = /user:password@host/

if (!existsSync(envPath)) {
  console.log(`
Create a .env file for local development:

1. Open Vercel → workout-tracker → Settings → Environment Variables
2. Click DATABASE_URL → reveal → copy the value
   (Or copy from https://console.neon.tech → your project → Connection string)
3. Paste into .env:

DATABASE_URL=<paste here>
JWT_SECRET=<any random 32+ char string>
APP_URL=http://localhost:3000

4. Run: npm run db:push:prod   (uses production DB)
   Or:  npm run db:push        (uses .env DATABASE_URL)

5. Restart: npm run dev
`)
  process.exit(1)
}

const content = readFileSync(envPath, 'utf-8')
if (placeholder.test(content)) {
  console.error(`
Your .env still has the example DATABASE_URL placeholder.

Production works (health: connected) but localhost uses .env — copy the real
Neon connection string from Vercel or Neon console into .env, then:

  npm run db:push
  npm run dev
`)
  process.exit(1)
}

console.log('Local .env looks configured. Run: npm run dev')
