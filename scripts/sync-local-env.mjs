import { existsSync, writeFileSync, readFileSync } from 'fs'
import { execSync } from 'child_process'

const target = '.env.local'

console.log('Pulling env names from Vercel (secrets may be empty in the file)...\n')

try {
  execSync(`vercel env pull ${target} --environment=preview --yes`, {
    stdio: 'inherit',
  })
} catch {
  console.error('\nRun: vercel link   (if not linked yet)\n')
  process.exit(1)
}

let content = existsSync(target) ? readFileSync(target, 'utf-8') : ''
const hasDb = /DATABASE_URL=(?!""\s*$)(?!$).{20,}/m.test(content)
const hasJwt = /JWT_SECRET=(?!""\s*$)(?!$).{8,}/m.test(content)

if (hasDb && hasJwt) {
  console.log(`\n✓ ${target} has DATABASE_URL and JWT_SECRET. Run: npm run dev`)
  process.exit(0)
}

const template = `# Local development — paste values from Vercel dashboard
# https://vercel.com → workout-tracker → Settings → Environment Variables
# Click DATABASE_URL and JWT_SECRET → reveal → copy

DATABASE_URL=
JWT_SECRET=
APP_URL=http://localhost:3000
`

if (!existsSync(target) || !content.trim()) {
  writeFileSync(target, template)
}

console.log(`
Vercel does not include secret values in pulled files (security).

Open Vercel → workout-tracker → Settings → Environment Variables:
  • DATABASE_URL  → copy into ${target}
  • JWT_SECRET    → copy into ${target}

Then run:
  npm run dev
`)
