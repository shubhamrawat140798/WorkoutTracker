import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'
import ws from 'ws'
import { neonConfig } from '@neondatabase/serverless'

config({ path: process.env.ENV_FILE || '.env' })

// Required for drizzle-kit with Neon serverless driver
neonConfig.webSocketConstructor = ws

// Prefer non-pooling URL for migrations (Neon/Vercel often provide POSTGRES_URL_NON_POOLING)
const databaseUrl =
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL

if (!databaseUrl) {
  console.error(
    'Missing DATABASE_URL. Run: vercel link && vercel env pull .env.production.local',
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
