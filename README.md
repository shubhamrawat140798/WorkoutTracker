# Workout Tracker PWA

A mobile-first Progressive Web App for logging strength workouts and reviewing your training history.

## Features

- Email/password authentication (sign up, login, password reset)
- Log workouts with exercises, sets, reps, weight, and RPE
- Copy your last workout as a template
- Auto-save workout drafts locally
- Review workout history with volume stats
- Exercise guides (infographic-style instructions) from an admin-managed catalog
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

### 3. Admin access & exercise catalog

After migrations run, promote your account to admin:

```bash
npm run admin:promote -- you@example.com
```

(Or run the same `UPDATE` in the Neon SQL console — not in your terminal shell.)

Or set `ADMIN_EMAILS=you@example.com` in `.env.local` / Vercel before signup (new accounts get `admin` automatically).

Seed default exercises (Bench Press, Squat, etc.):

```bash
npm run db:seed-catalog
```

Open **Settings** (gear icon) in the app header → manage exercises at `/admin/exercises`. Paste **HTTPS** image URLs for hero/step images (no file upload).

### 4. Push database schema (only if using a new database)

```bash
npm run db:migrate     # applies drizzle/*.sql using .env.local
# or sync schema via Drizzle Kit:
npm run db:push
```

### 5. Open the app

- `npm run dev` or `npm run dev:vercel` → [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

1. Push this repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Go to **Storage → Connect Database → Neon**
4. Add environment variables:
   - `JWT_SECRET`
   - `NITRO_JWT_SECRET` (same value as `JWT_SECRET`)
   - `APP_URL` (your production URL, e.g. `https://your-app.vercel.app`)
   - `RESEND_API_KEY` (from [Resend](https://resend.com) — password reset emails)
   - `EMAIL_FROM` (e.g. `Workout Tracker <onboarding@resend.dev>` until your domain is verified)
5. Deploy, then run `npm run db:migrate` against production `DATABASE_URL`

### Password reset email (Resend)

1. Create a free account at [resend.com](https://resend.com) and create an API key.
2. In Vercel **Production** env, set `RESEND_API_KEY` and `EMAIL_FROM`.
3. With Resend’s test sender (`onboarding@resend.dev`), you can only email **your own** verified address.
4. For real users, **verify your domain** in Resend (DNS SPF/DKIM) and set `EMAIL_FROM` to e.g. `Workout Tracker <noreply@yourdomain.com>`.
5. Local dev without Resend still shows the reset link on screen after **Forgot password**.

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
| GET | `/api/catalog` | Published exercise guides |
| GET | `/api/catalog/:slug` | Single exercise guide |
| GET | `/api/admin/catalog` | Admin: list all catalog entries |
| POST | `/api/admin/catalog` | Admin: create catalog entry |
| GET | `/api/admin/catalog/:id` | Admin: get entry |
| PUT | `/api/admin/catalog/:id` | Admin: update entry |
| DELETE | `/api/admin/catalog/:id` | Admin: delete entry |
