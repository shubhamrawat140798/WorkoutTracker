import { defineHandler } from 'nitro'
import { createError } from 'nitro/h3'
import { requireAuth } from '../lib/auth'
import { deleteWorkout } from '../lib/workouts'
import { handleDbError } from '../lib/errors'

export default defineHandler(async (event) => {
  const user = await requireAuth(event)
  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, message: 'Missing workout id' })

  try {
    const deleted = await deleteWorkout(id, user.id)
    if (!deleted) {
      throw createError({ statusCode: 404, message: 'Workout not found' })
    }
    return { success: true }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    handleDbError(error)
  }
})
