import { defineHandler } from 'nitro'
import { readBody, createError } from 'nitro/h3'
import { eq } from 'drizzle-orm'
import { db } from '../lib/db'
import { users } from '../lib/schema'
import { verifyPassword, createSessionToken, setSessionCookie } from '../lib/auth'
import { loginSchema } from '../lib/validation'
import { handleDbError } from '../lib/errors'

export default defineHandler(async (event) => {
  const body = await readBody(event)
  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Invalid email or password' })
  }

  const { email, password } = parsed.data

  try {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        passwordHash: users.passwordHash,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1)

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw createError({ statusCode: 401, message: 'Invalid email or password' })
    }

    const token = await createSessionToken(user.id, user.email)
    setSessionCookie(event, token)

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    handleDbError(error)
  }
})
