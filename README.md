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

### 2. Set up environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Fill in:

- `DATABASE_URL` — Neon Postgres connection string
- `JWT_SECRET` — random 32+ character secret
- `APP_URL` — `http://localhost:5173` for local dev

### 3. Push database schema

```bash
npm run db:push
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

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
