import { defineHandler } from 'nitro'
import { readBody, createError } from 'nitro/h3'
import { requireAuth } from '../lib/auth'
import { upsertUserProfile } from '../lib/profile'
import { updateProfileSchema } from '../lib/profile-validation'
import { handleDbError } from '../lib/errors'

export default defineHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)
  const parsed = updateProfileSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      message: parsed.error.issues[0]?.message ?? 'Invalid profile data',
    })
  }

  try {
    const profile = await upsertUserProfile(user.id, parsed.data)
    return { profile }
  } catch (error) {
    handleDbError(error)
  }
})
