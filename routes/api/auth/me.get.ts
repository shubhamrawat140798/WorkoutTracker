import { defineHandler } from 'nitro'
import { createError } from 'nitro/h3'
import { getSessionUser } from '../lib/auth'

export default defineHandler(async (event) => {
  const user = await getSessionUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }
  return { user }
})
