import { defineHandler } from 'nitro'
import { createError } from 'nitro/h3'
import { requireAuth } from '../lib/auth'
import { getWorkoutById, calculateVolume } from '../lib/workouts'

export default defineHandler(async (event) => {
  const user = await requireAuth(event)
  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, message: 'Missing workout id' })

  const workout = await getWorkoutById(id, user.id)
  if (!workout) throw createError({ statusCode: 404, message: 'Workout not found' })

  const totalVolume = calculateVolume(workout.exercises)
  return { workout, totalVolume }
})
