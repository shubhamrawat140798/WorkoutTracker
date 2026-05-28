import { eq, desc, and } from 'drizzle-orm'
import { db } from './db'
import { workouts, exercises, sets } from './schema'
import type { createWorkoutSchema } from './validation'
import type { z } from 'zod'

type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>

export async function createWorkoutWithExercises(userId: string, input: CreateWorkoutInput) {
  const [workout] = await db
    .insert(workouts)
    .values({
      userId,
      date: input.date,
      title: input.title,
      notes: input.notes ?? null,
      durationMinutes: input.durationMinutes ?? null,
      startedAt: input.startedAt ? new Date(input.startedAt) : null,
      completedAt: input.completedAt ? new Date(input.completedAt) : new Date(),
    })
    .returning()

  for (const ex of input.exercises) {
    const [exercise] = await db
      .insert(exercises)
      .values({
        workoutId: workout.id,
        name: ex.name,
        sortOrder: ex.sortOrder,
      })
      .returning()

    for (const s of ex.sets) {
      await db.insert(sets).values({
        exerciseId: exercise.id,
        setNumber: s.setNumber,
        reps: s.reps ?? null,
        weight: s.weight != null ? String(s.weight) : null,
        weightUnit: s.weightUnit,
        rpe: s.rpe ?? null,
        notes: s.notes ?? null,
      })
    }
  }

  return getWorkoutById(workout.id, userId)
}

export async function getWorkoutById(workoutId: string, userId: string) {
  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .limit(1)

  if (!workout) return null

  const workoutExercises = await db
    .select()
    .from(exercises)
    .where(eq(exercises.workoutId, workoutId))
    .orderBy(exercises.sortOrder)

  const result = []
  for (const ex of workoutExercises) {
    const exerciseSets = await db
      .select()
      .from(sets)
      .where(eq(sets.exerciseId, ex.id))
      .orderBy(sets.setNumber)

    result.push({
      ...ex,
      sets: exerciseSets.map((s) => ({
        ...s,
        weight: s.weight ? parseFloat(s.weight) : null,
      })),
    })
  }

  return { ...workout, exercises: result }
}

export async function listWorkouts(userId: string, limit = 50) {
  const rows = await db
    .select({
      id: workouts.id,
      date: workouts.date,
      title: workouts.title,
      notes: workouts.notes,
      durationMinutes: workouts.durationMinutes,
      completedAt: workouts.completedAt,
      createdAt: workouts.createdAt,
    })
    .from(workouts)
    .where(eq(workouts.userId, userId))
    .orderBy(desc(workouts.date), desc(workouts.createdAt))
    .limit(limit)

  return rows
}

export async function deleteWorkout(workoutId: string, userId: string) {
  const deleted = await db
    .delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .returning({ id: workouts.id })

  return deleted.length > 0
}

export async function updateWorkoutMeta(
  workoutId: string,
  userId: string,
  input: {
    title?: string
    notes?: string | null
    date?: string
    durationMinutes?: number | null
    startedAt?: string | null
    completedAt?: string | null
  },
) {
  const [existing] = await db
    .select({
      id: workouts.id,
      date: workouts.date,
      title: workouts.title,
      notes: workouts.notes,
      durationMinutes: workouts.durationMinutes,
      startedAt: workouts.startedAt,
      completedAt: workouts.completedAt,
    })
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .limit(1)

  if (!existing) return null

  const nextStartedAt =
    input.startedAt === undefined ? existing.startedAt : input.startedAt ? new Date(input.startedAt) : null
  const nextCompletedAt =
    input.completedAt === undefined ? existing.completedAt : input.completedAt ? new Date(input.completedAt) : null

  let nextDurationMinutes: number | null =
    input.durationMinutes === undefined ? existing.durationMinutes : input.durationMinutes ?? null

  if (input.durationMinutes === undefined && nextStartedAt && nextCompletedAt) {
    const diffMs = nextCompletedAt.getTime() - nextStartedAt.getTime()
    if (!Number.isNaN(diffMs)) {
      nextDurationMinutes = Math.max(0, Math.round(diffMs / 60000))
    }
  }

  const [updated] = await db
    .update(workouts)
    .set({
      title: input.title ?? existing.title,
      notes: input.notes === undefined ? existing.notes : input.notes ?? null,
      date: input.date ?? existing.date,
      durationMinutes: nextDurationMinutes,
      startedAt: nextStartedAt,
      completedAt: nextCompletedAt,
    })
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .returning({ id: workouts.id })

  if (!updated) return null
  return getWorkoutById(workoutId, userId)
}

export async function replaceWorkoutExercises(
  workoutId: string,
  userId: string,
  input: {
    exercises: {
      name: string
      sortOrder: number
      sets: {
        setNumber: number
        reps?: number | null
        weight?: number | null
        weightUnit: 'kg' | 'lb'
        rpe?: number | null
        notes?: string | null
      }[]
    }[]
  },
) {
  const [existing] = await db
    .select({ id: workouts.id })
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .limit(1)

  if (!existing) return null

  // Replace exercises/sets as a single operation (sets cascade on delete).
  await db.delete(exercises).where(eq(exercises.workoutId, workoutId))

  for (const ex of input.exercises) {
    const [exercise] = await db
      .insert(exercises)
      .values({
        workoutId,
        name: ex.name,
        sortOrder: ex.sortOrder,
      })
      .returning()

    for (const s of ex.sets) {
      await db.insert(sets).values({
        exerciseId: exercise.id,
        setNumber: s.setNumber,
        reps: s.reps ?? null,
        weight: s.weight != null ? String(s.weight) : null,
        weightUnit: s.weightUnit,
        rpe: s.rpe ?? null,
        notes: s.notes ?? null,
      })
    }
  }

  return getWorkoutById(workoutId, userId)
}

export function calculateVolume(exercises: { sets: { reps: number | null; weight: number | null }[] }[]) {
  let total = 0
  for (const ex of exercises) {
    for (const s of ex.sets) {
      if (s.reps && s.weight) {
        total += s.reps * s.weight
      }
    }
  }
  return total
}
