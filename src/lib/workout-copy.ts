import type { WorkoutDetail } from '@/lib/api'
import type { DraftWorkout } from '@/lib/api'

type ExerciseEntry = DraftWorkout['exercises'][number] & { id: string }

export function workoutToExerciseEntries(
  workout: WorkoutDetail,
  newId: () => string,
): ExerciseEntry[] {
  return workout.exercises.map((ex, i) => ({
    id: newId(),
    name: ex.name,
    sortOrder: i,
    sets: ex.sets.map((s) => ({
      setNumber: s.setNumber,
      reps: s.reps?.toString() ?? '',
      weight: s.weight?.toString() ?? '',
      rpe: s.rpe?.toString() ?? '',
      notes: s.notes ?? '',
    })),
  }))
}

export function getWorkoutWeightUnit(workout: WorkoutDetail): string | null {
  const unit = workout.exercises[0]?.sets[0]?.weightUnit
  return unit || null
}
