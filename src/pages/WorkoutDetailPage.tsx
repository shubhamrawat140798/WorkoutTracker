import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock } from 'lucide-react'
import { api, type WorkoutDetail } from '@/lib/api'
import { formatDate, formatVolume } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DeleteWorkoutButton } from '@/components/DeleteWorkoutButton'
import { ExerciseGuideButton } from '@/components/ExerciseGuideButton'

export function WorkoutDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [workout, setWorkout] = useState<WorkoutDetail | null>(null)
  const [totalVolume, setTotalVolume] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    api.workouts
      .get(id)
      .then((r) => {
        setWorkout(r.workout)
        setTotalVolume(r.totalVolume)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!workout) {
    return <p className="text-center text-muted-foreground">Workout not found</p>
  }

  const unit = workout.exercises[0]?.sets[0]?.weightUnit || 'kg'

  return (
    <div className="space-y-4">
      <Link to="/history" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <div>
        <h1 className="text-2xl font-bold">{workout.title}</h1>
        <p className="text-muted-foreground">{formatDate(workout.date)}</p>
        <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
          {workout.durationMinutes && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {workout.durationMinutes} min
            </span>
          )}
          <span>Volume: {formatVolume(totalVolume, unit)}</span>
        </div>
        {workout.notes && <p className="mt-2 text-sm">{workout.notes}</p>}
      </div>

      {workout.exercises.map((ex) => {
        const exVolume = ex.sets.reduce((sum, s) => sum + (s.reps && s.weight ? s.reps * s.weight : 0), 0)
        return (
          <Card key={ex.id ?? ex.name}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-1">
                <CardTitle className="text-base">{ex.name}</CardTitle>
                <ExerciseGuideButton exerciseName={ex.name} />
              </div>
              <p className="text-xs text-muted-foreground">{formatVolume(exVolume, unit)} total</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2 text-xs font-medium text-muted-foreground">
                <span>Set</span>
                <span>Reps</span>
                <span>Weight</span>
                <span>RPE</span>
              </div>
              {ex.sets.map((s) => (
                <div key={s.setNumber} className="grid grid-cols-4 gap-2 border-t border-border py-2 text-sm">
                  <span>{s.setNumber}</span>
                  <span>{s.reps ?? '—'}</span>
                  <span>{s.weight != null ? `${s.weight} ${s.weightUnit}` : '—'}</span>
                  <span>{s.rpe ?? '—'}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )
      })}

      <DeleteWorkoutButton
        workoutId={workout.id}
        workoutTitle={workout.title}
        variant="full"
        onDeleted={() => navigate('/history', { replace: true })}
      />
    </div>
  )
}
