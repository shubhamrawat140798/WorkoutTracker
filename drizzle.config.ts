import { defineConfig } from 'drizzle-kit'
import ws from 'ws'
import { neonConfig } from '@neondatabase/serverless'
import { getDatabaseUrl } from './scripts/load-env.mjs'

// Required for drizzle-kit with Neon serverless driver
neonConfig.webSocketConstructor = ws

const databaseUrl = getDatabaseUrl()

if (!databaseUrl) {
  console.error(
    'Missing DATABASE_URL. Add it to .env.local (copy from Vercel → Settings → Environment Variables).',
  )
  process.exit(1)
}

export default defineConfig({
  schema: './routes/api/lib/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
})
