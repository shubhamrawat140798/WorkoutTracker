import { defineHandler } from 'nitro'
import { createError, readBody } from 'nitro/h3'
import { requireAuth } from '../lib/auth'
import { replaceWorkoutExercises, updateWorkoutMeta } from '../lib/workouts'
import { updateWorkoutSchema } from '../lib/validation'
import { handleDbError } from '../lib/errors'

const MAX_EDITED_DURATION_MINUTES = 24 * 60

export default defineHandler(async (event) => {
  const user = await requireAuth(event)
  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, message: 'Missing workout id' })

  const body = await readBody(event)
  const parsed = updateWorkoutSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      message: parsed.error.issues[0]?.message ?? 'Invalid workout data',
    })
  }

  const input = parsed.data

  if (input.startedAt && input.completedAt) {
    const start = new Date(input.startedAt).getTime()
    const end = new Date(input.completedAt).getTime()
    if (Number.isNaN(start) || Number.isNaN(end)) {
      throw createError({ statusCode: 400, message: 'Invalid workout time' })
    }
    if (end < start) {
      throw createError({ statusCode: 400, message: 'End time must be after start time' })
    }
    const mins = Math.round((end - start) / 60000)
    if (mins > MAX_EDITED_DURATION_MINUTES) {
      throw createError({ statusCode: 400, message: 'Workout duration is too long' })
    }
  }

  if (input.durationMinutes != null && input.durationMinutes > MAX_EDITED_DURATION_MINUTES) {
    throw createError({ statusCode: 400, message: 'Workout duration is too long' })
  }

  try {
    let workout = await updateWorkoutMeta(id, user.id, input)
    if (!workout) throw createError({ statusCode: 404, message: 'Workout not found' })

    if (input.exercises) {
      workout = await replaceWorkoutExercises(id, user.id, { exercises: input.exercises })
      if (!workout) throw createError({ statusCode: 404, message: 'Workout not found' })
    }

    return { workout }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    handleDbError(error)
  }
})

