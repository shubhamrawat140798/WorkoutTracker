import { defineHandler } from 'nitro'
import { requireAuth } from '../lib/auth'
import { getUserProfile } from '../lib/profile'

export default defineHandler(async (event) => {
  const user = await requireAuth(event)
  const profile = await getUserProfile(user.id)
  return { profile }
})
