import { neon } from '@neondatabase/serverless'
import { getDatabaseUrl } from './load-env.mjs'

const email = process.argv[2]?.trim().toLowerCase()
if (!email) {
  console.error('Usage: npm run admin:promote -- your@email.com')
  process.exit(1)
}

const url = getDatabaseUrl()
if (!url) {
  console.error('DATABASE_URL required in .env.local')
  process.exit(1)
}

const sql = neon(url)
const rows = await sql`UPDATE users SET role = 'admin' WHERE email = ${email} RETURNING id, email, role`

if (rows.length === 0) {
  console.error(`No user found with email: ${email}`)
  console.error('Sign up in the app first, then run this command again.')
  process.exit(1)
}

console.log(`Promoted to admin: ${rows[0].email}`)
