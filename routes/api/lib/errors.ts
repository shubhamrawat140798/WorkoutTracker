import { createError } from 'nitro/h3'

export function handleDbError(error: unknown): never {
  const message = error instanceof Error ? error.message : String(error)
  const cause = error instanceof Error && 'cause' in error ? String((error as { cause?: unknown }).cause) : ''

  if (
    message.includes('DATABASE_URL is not set') ||
    message.includes('placeholder')
  ) {
    throw createError({
      statusCode: 503,
      message:
        'Database not configured. Put DATABASE_URL in .env.local (not .env). Restart the dev server after saving.',
    })
  }

  if (
    message.includes('fetch failed') ||
    message.includes('connecting to database') ||
    message.includes('ENOTFOUND') ||
    cause.includes('fetch failed')
  ) {
    throw createError({
      statusCode: 503,
      message:
        'Cannot connect to database. Check DATABASE_URL in .env is a valid Neon connection string.',
    })
  }

  if (message.includes('relation') && message.includes('does not exist')) {
    throw createError({
      statusCode: 503,
      message: 'Database tables missing. Run: npm run db:push',
    })
  }

  console.error('[db error]', error)
  throw createError({ statusCode: 500, message: 'A server error occurred. Please try again.' })
}
