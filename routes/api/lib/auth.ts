import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { createHash, randomBytes } from 'crypto'
import type { H3Event } from 'h3'
import { getCookie, setCookie, deleteCookie, createError } from 'nitro/h3'
import { eq } from 'drizzle-orm'
import { db } from './db'
import { users } from './schema'
import { getJwtSecret as resolveJwtSecret, getAdminEmails } from './env'

const COOKIE_NAME = 'session'
const JWT_EXPIRY = '7d'

function getJwtSecret() {
  const secret = resolveJwtSecret()
  if (!secret) throw new Error('JWT_SECRET is not set')
  return new TextEncoder().encode(secret)
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export async function createSessionToken(userId: string, email: string) {
  return new SignJWT({ sub: userId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(getJwtSecret())
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, getJwtSecret())
  const userId = payload.sub
  if (!userId || typeof userId !== 'string') return null
  return { userId, email: payload.email as string }
}

export function setSessionCookie(event: H3Event, token: string) {
  setCookie(event, COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export function clearSessionCookie(event: H3Event) {
  deleteCookie(event, COOKIE_NAME, { path: '/' })
}

export async function getSessionUser(event: H3Event) {
  const token = getCookie(event, COOKIE_NAME)
  if (!token) return null
  const session = await verifySessionToken(token)
  if (!session) return null

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1)

  return user ?? null
}

export function isAdminUser(user: { email: string; role?: string | null }) {
  if (user.role === 'admin') return true
  return getAdminEmails().includes(user.email.toLowerCase())
}

export async function requireAdmin(event: H3Event) {
  const user = await requireAuth(event)
  if (!isAdminUser(user)) {
    throw createError({ statusCode: 403, message: 'Admin access required' })
  }
  return user
}

export async function requireAuth(event: H3Event) {
  const user = event.context.user ?? (await getSessionUser(event))
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
  return user
}

export function createResetToken() {
  const token = randomBytes(32).toString('hex')
  const hash = createHash('sha256').update(token).digest('hex')
  return { token, hash }
}

export function hashResetToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}
