import { defineHandler } from 'nitro'
import { createError } from 'nitro/h3'
import { requireAuth } from '../lib/auth'
import { listWorkouts } from '../lib/workouts'

export default defineHandler(async (event) => {
  const user = await requireAuth(event)
  const workouts = await listWorkouts(user.id)
  return { workouts }
})
