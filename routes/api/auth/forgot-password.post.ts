import { defineHandler } from 'nitro'
import { readBody } from 'nitro/h3'
import { eq } from 'drizzle-orm'
import { db } from '../lib/db'
import { users } from '../lib/schema'
import { createResetToken } from '../lib/auth'
import { forgotPasswordSchema } from '../lib/validation'

export default defineHandler(async (event) => {
  const body = await readBody(event)
  const parsed = forgotPasswordSchema.safeParse(body)
  if (!parsed.success) {
    return { message: 'If that email exists, a reset link has been sent.' }
  }

  const { email } = parsed.data
  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.email, email.toLowerCase())).limit(1)

  if (!user) {
    return { message: 'If that email exists, a reset link has been sent.' }
  }

  const { token, hash } = createResetToken()
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

  await db
    .update(users)
    .set({ resetTokenHash: hash, resetTokenExpiresAt: expiresAt })
    .where(eq(users.id, user.id))

  const appUrl = process.env.APP_URL || 'http://localhost:5173'
  const resetLink = `${appUrl}/reset-password?token=${token}`

  const isDev = process.env.NODE_ENV !== 'production'
  return {
    message: 'If that email exists, a reset link has been sent.',
    ...(isDev ? { resetLink } : {}),
  }
})
