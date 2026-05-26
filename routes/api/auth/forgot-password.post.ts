import { defineHandler } from 'nitro'
import { readBody } from 'nitro/h3'
import { eq } from 'drizzle-orm'
import { db } from '../lib/db'
import { users } from '../lib/schema'
import { createResetToken } from '../lib/auth'
import { forgotPasswordSchema } from '../lib/validation'
import { getAppUrl, isEmailConfigured, sendPasswordResetEmail } from '../lib/email'

const GENERIC_MESSAGE = 'If that email exists, a reset link has been sent.'

export default defineHandler(async (event) => {
  const body = await readBody(event)
  const parsed = forgotPasswordSchema.safeParse(body)
  if (!parsed.success) {
    return { message: GENERIC_MESSAGE }
  }

  const { email } = parsed.data
  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.email, email.toLowerCase())).limit(1)

  if (!user) {
    return { message: GENERIC_MESSAGE }
  }

  const { token, hash } = createResetToken()
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

  await db
    .update(users)
    .set({ resetTokenHash: hash, resetTokenExpiresAt: expiresAt })
    .where(eq(users.id, user.id))

  const resetLink = `${getAppUrl()}/reset-password?token=${token}`

  const isDev = process.env.NODE_ENV !== 'production'
  const showDevLink = isDev && !isEmailConfigured()

  if (!showDevLink) {
    await sendPasswordResetEmail(email, resetLink)
  }

  return {
    message: GENERIC_MESSAGE,
    ...(showDevLink ? { resetLink } : {}),
  }
})
