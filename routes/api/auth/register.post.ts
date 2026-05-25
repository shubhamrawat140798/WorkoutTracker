import { defineHandler } from 'nitro'
import { readBody, createError } from 'nitro/h3'
import { eq } from 'drizzle-orm'
import { db } from '../lib/db'
import { users } from '../lib/schema'
import { hashPassword, createSessionToken, setSessionCookie } from '../lib/auth'
import { registerSchema } from '../lib/validation'
import { handleDbError } from '../lib/errors'

export default defineHandler(async (event) => {
  const body = await readBody(event)
  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: parsed.error.issues[0]?.message ?? 'Invalid input' })
  }

  const { email, name, password } = parsed.data

  try {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1)
    if (existing) {
      throw createError({ statusCode: 409, message: 'Email already registered' })
    }

    const passwordHash = await hashPassword(password)
    const [user] = await db
      .insert(users)
      .values({ email: email.toLowerCase(), name, passwordHash })
      .returning({ id: users.id, email: users.email, name: users.name, createdAt: users.createdAt })

    const token = await createSessionToken(user.id, user.email)
    setSessionCookie(event, token)

    return { user }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    handleDbError(error)
  }
})
