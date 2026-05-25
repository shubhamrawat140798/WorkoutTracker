import { defineHandler } from 'nitro'
import { readBody, createError } from 'nitro/h3'
import { eq, and, gt } from 'drizzle-orm'
import { db } from '../lib/db'
import { users } from '../lib/schema'
import { hashPassword, hashResetToken } from '../lib/auth'
import { resetPasswordSchema } from '../lib/validation'

export default defineHandler(async (event) => {
  const body = await readBody(event)
  const parsed = resetPasswordSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Invalid input' })
  }

  const { token, password } = parsed.data
  const tokenHash = hashResetToken(token)

  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(
      and(
        eq(users.resetTokenHash, tokenHash),
        gt(users.resetTokenExpiresAt, new Date()),
      ),
    )
    .limit(1)

  if (!user) {
    throw createError({ statusCode: 400, message: 'Invalid or expired reset token' })
  }

  const passwordHash = await hashPassword(password)
  await db
    .update(users)
    .set({
      passwordHash,
      resetTokenHash: null,
      resetTokenExpiresAt: null,
    })
    .where(eq(users.id, user.id))

  return { message: 'Password updated successfully' }
})
