import { defineHandler } from 'nitro'
import { eq, desc, and } from 'drizzle-orm'
import { requireAuth } from '../lib/auth'
import { db } from '../lib/db'
import { workouts } from '../lib/schema'
import { getWorkoutById } from '../lib/workouts'

export default defineHandler(async (event) => {
  const user = await requireAuth(event)

  const [latest] = await db
    .select({ id: workouts.id })
    .from(workouts)
    .where(and(eq(workouts.userId, user.id)))
    .orderBy(desc(workouts.completedAt), desc(workouts.createdAt))
    .limit(1)

  if (!latest) return { workout: null }

  const workout = await getWorkoutById(latest.id, user.id)
  return { workout }
})
