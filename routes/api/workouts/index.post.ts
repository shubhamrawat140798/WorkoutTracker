import { defineHandler } from 'nitro'
import { readBody, createError } from 'nitro/h3'
import { requireAuth } from '../lib/auth'
import { createWorkoutSchema } from '../lib/validation'
import { createWorkoutWithExercises } from '../lib/workouts'

export default defineHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)
  const parsed = createWorkoutSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      message: parsed.error.issues[0]?.message ?? 'Invalid workout data',
    })
  }

  const workout = await createWorkoutWithExercises(user.id, parsed.data)
  return { workout }
})
