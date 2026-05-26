# Workout Tracker PWA

A mobile-first Progressive Web App for logging strength workouts and reviewing your training history.

## Features

- Email/password authentication (sign up, login, password reset)
- Log workouts with exercises, sets, reps, weight, and RPE
- Copy your last workout as a template
- Auto-save workout drafts locally
- Review workout history with volume stats
- Installable PWA with offline app shell

## Tech Stack

- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS
- **Backend:** Nitro API routes (Vercel Functions)
- **Database:** Neon Postgres via Vercel Storage marketplace
- **ORM:** Drizzle

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Local development (production already on Vercel)

Production uses env vars from Vercel automatically. **Local `npm run dev` needs the same credentials once.**

**Option A — Vercel CLI (injects production env):**

```bash
vercel link
npm run dev:vercel
```

If you see `yarn: command not found`, pull latest code (project uses npm). Use Option B instead.

**Option B — `.env.local` file:**

1. Vercel → **workout-tracker** → **Settings** → **Environment Variables**
2. Reveal **DATABASE_URL** and **JWT_SECRET** → copy both
3. Create `.env.local` (see `.env.local.example`):

```env
DATABASE_URL=<paste from Vercel>
JWT_SECRET=<paste from Vercel>
APP_URL=http://localhost:3000
```

4. Run:

```bash
npm run dev
```

> `vercel env pull` leaves secrets empty (`""`) for security — you must copy from the dashboard.

### 3. Push database schema (only if using a new database)

```bash
npm run db:push:prod   # production DB (after env pull, if values are present)
# or with .env.local filled in:
npm run db:push
```

### 4. Open the app

- `npm run dev` or `npm run dev:vercel` → [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

1. Push this repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Go to **Storage → Connect Database → Neon**
4. Add environment variables:
   - `JWT_SECRET`
   - `NITRO_JWT_SECRET` (same value as `JWT_SECRET`)
   - `APP_URL` (your production URL)
5. Deploy, then run `npm run db:push` against production `DATABASE_URL`

For local env from Vercel: `vercel env pull`

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | Sign out |
| GET | `/api/auth/me` | Current user |
| POST | `/api/auth/forgot-password` | Request reset link |
| POST | `/api/auth/reset-password` | Set new password |
| GET | `/api/workouts` | List workouts |
| POST | `/api/workouts` | Create workout |
| GET | `/api/workouts/last` | Last workout (for copy) |
| GET | `/api/workouts/:id` | Workout detail |
| DELETE | `/api/workouts/:id` | Delete workout |
