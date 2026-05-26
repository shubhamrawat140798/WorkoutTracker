import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, X } from 'lucide-react'
import { api, DRAFT_KEY, WEIGHT_UNIT_KEY, type CatalogExercise, type DraftWorkout, type WorkoutDetail } from '@/lib/api'
import { getWorkoutWeightUnit, workoutToExerciseEntries } from '@/lib/workout-copy'
import { todayISO } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExerciseGuideButton } from '@/components/ExerciseGuideButton'
import { ExerciseSearchInput } from '@/components/ExerciseSearchInput'
import { RpeInfoButton } from '@/components/RpeInfoButton'
import { RpeSelect } from '@/components/RpeSelect'
import { CopyWorkoutPicker } from '@/components/CopyWorkoutPicker'

type ExerciseEntry = DraftWorkout['exercises'][number] & { id: string }

function newId() {
  return crypto.randomUUID()
}

function emptySet(n: number) {
  return { setNumber: n, reps: '', weight: '', rpe: '', notes: '' }
}

function emptyExercise(name: string, sortOrder: number): ExerciseEntry {
  return { id: newId(), name, sortOrder, sets: [emptySet(1)] }
}

function normalizeExercises(raw: DraftWorkout['exercises']): ExerciseEntry[] {
  return raw.map((ex, i) => ({
    ...ex,
    id: ex.id ?? newId(),
    sortOrder: i,
  }))
}

function loadDraft(): DraftWorkout | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function WorkoutNewPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('Workout')
  const [notes, setNotes] = useState('')
  const [exercises, setExercises] = useState<ExerciseEntry[]>(() => {
    const draft = loadDraft()
    if (draft?.exercises?.length) return normalizeExercises(draft.exercises)
    return [emptyExercise('Bench Press', 0)]
  })
  const [startedAt] = useState(() => {
    const draft = loadDraft()
    return draft?.startedAt || new Date().toISOString()
  })
  const [weightUnit, setWeightUnit] = useState(() => localStorage.getItem(WEIGHT_UNIT_KEY) || 'kg')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [catalog, setCatalog] = useState<CatalogExercise[]>([])
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [scrollToId, setScrollToId] = useState<string | null>(null)

  useEffect(() => {
    api.catalog
      .list()
      .then(({ exercises }) => setCatalog(exercises))
      .catch(() => setCatalog([]))
      .finally(() => setCatalogLoading(false))
  }, [])

  const saveDraft = useCallback(() => {
    const draft: DraftWorkout = { title, notes, startedAt, exercises }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  }, [title, notes, startedAt, exercises])

  useEffect(() => {
    saveDraft()
  }, [saveDraft])

  useEffect(() => {
    localStorage.setItem(WEIGHT_UNIT_KEY, weightUnit)
  }, [weightUnit])

  useEffect(() => {
    if (!scrollToId) return
    const el = document.getElementById(`exercise-${scrollToId}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setScrollToId(null)
  }, [scrollToId, exercises])

  const addExercise = (name: string) => {
    if (!name.trim()) return
    const entry = emptyExercise(name.trim(), 0)
    setExercises((prev) => [
      entry,
      ...prev.map((e, i) => ({ ...e, sortOrder: i + 1 })),
    ])
    setScrollToId(entry.id)
  }

  const removeExercise = (id: string) => {
    setExercises((prev) =>
      prev.filter((e) => e.id !== id).map((e, i) => ({ ...e, sortOrder: i })),
    )
  }

  const addSet = (exerciseId: string) => {
    setExercises((prev) => {
      const exIndex = prev.findIndex((e) => e.id === exerciseId)
      if (exIndex < 0) return prev
      return prev.map((ex, i) =>
        i === exIndex ? { ...ex, sets: [...ex.sets, emptySet(ex.sets.length + 1)] } : ex,
      )
    })
  }

  const removeSet = (exerciseId: string, setIndex: number) => {
    setExercises((prev) => {
      const exIndex = prev.findIndex((e) => e.id === exerciseId)
      if (exIndex < 0) return prev
      return prev.map((ex, i) =>
        i === exIndex
          ? {
              ...ex,
              sets: ex.sets
                .filter((_, si) => si !== setIndex)
                .map((s, si) => ({ ...s, setNumber: si + 1 })),
            }
          : ex,
      )
    })
  }

  const updateSet = (exerciseId: string, setIndex: number, field: string, value: string) => {
    setExercises((prev) => {
      const exIndex = prev.findIndex((e) => e.id === exerciseId)
      if (exIndex < 0) return prev
      return prev.map((ex, i) =>
        i === exIndex
          ? {
              ...ex,
              sets: ex.sets.map((s, si) => (si === setIndex ? { ...s, [field]: value } : s)),
            }
          : ex,
      )
    })
  }

  const applyCopiedWorkout = (workout: WorkoutDetail) => {
    setTitle(workout.title)
    setExercises(workoutToExerciseEntries(workout, newId))
    const unit = getWorkoutWeightUnit(workout)
    if (unit) setWeightUnit(unit)
    setError('')
  }

  const finishWorkout = async () => {
    setError('')
    const validExercises = exercises.filter((ex) => ex.name.trim() && ex.sets.length > 0)
    if (validExercises.length === 0) {
      setError('Add at least one exercise with sets')
      return
    }

    setSaving(true)
    try {
      const completedAt = new Date().toISOString()
      const durationMinutes = Math.round(
        (new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 60000,
      )

      const payload = {
        title,
        notes: notes || null,
        date: todayISO(),
        durationMinutes: durationMinutes > 0 ? durationMinutes : 1,
        startedAt,
        completedAt,
        exercises: validExercises.map((ex, i) => ({
          name: ex.name,
          sortOrder: i,
          sets: ex.sets.map((s) => ({
            setNumber: s.setNumber,
            reps: s.reps ? parseInt(s.reps, 10) : null,
            weight: s.weight ? parseFloat(s.weight) : null,
            weightUnit: weightUnit as 'kg' | 'lb',
            rpe: s.rpe ? parseInt(s.rpe, 10) : null,
            notes: s.notes || null,
          })),
        })),
      }

      const { workout } = await api.workouts.create(payload)
      localStorage.removeItem(DRAFT_KEY)
      navigate(`/workout/${workout.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save workout')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Active Workout</h1>
        <button
          onClick={() => navigate('/')}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-accent"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex gap-2">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Workout title" />
        <select
          value={weightUnit}
          onChange={(e) => setWeightUnit(e.target.value)}
          className="h-11 rounded-xl border border-border bg-card px-2 text-sm"
        >
          <option value="kg">kg</option>
          <option value="lb">lb</option>
        </select>
      </div>

      <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" />

      <section className="space-y-3 rounded-2xl border border-border bg-card/50 p-4">
        <p className="text-sm font-medium text-muted-foreground">Add exercise</p>
        <CopyWorkoutPicker onCopy={applyCopiedWorkout} onError={setError} />
        <ExerciseSearchInput
          catalog={catalog}
          loading={catalogLoading}
          onAdd={addExercise}
        />
      </section>

      {exercises.map((ex) => (
        <Card key={ex.id} id={`exercise-${ex.id}`} className="scroll-mt-4">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex min-w-0 items-center gap-1">
              <CardTitle className="truncate text-base">{ex.name}</CardTitle>
              <ExerciseGuideButton exerciseName={ex.name} />
            </div>
            <button
              onClick={() => removeExercise(ex.id)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-5 gap-1 text-xs font-medium text-muted-foreground">
              <span>Set</span>
              <span>Reps</span>
              <span>Weight</span>
              <span className="flex items-center justify-center gap-0.5">
                RPE
                <RpeInfoButton />
              </span>
              <span></span>
            </div>
            {ex.sets.map((s, setIndex) => (
              <div key={setIndex} className="grid grid-cols-5 gap-1">
                <span className="flex h-11 items-center text-sm">{s.setNumber}</span>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={s.reps}
                  onChange={(e) => updateSet(ex.id, setIndex, 'reps', e.target.value)}
                  placeholder="0"
                  className="h-11 px-2"
                />
                <Input
                  type="number"
                  inputMode="decimal"
                  value={s.weight}
                  onChange={(e) => updateSet(ex.id, setIndex, 'weight', e.target.value)}
                  placeholder="0"
                  className="h-11 px-2"
                />
                <RpeSelect
                  value={s.rpe}
                  onChange={(v) => updateSet(ex.id, setIndex, 'rpe', v)}
                />
                <button
                  onClick={() => removeSet(ex.id, setIndex)}
                  className="flex h-11 items-center justify-center text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={() => addSet(ex.id)} className="w-full">
              <Plus className="mr-1 h-4 w-4" />
              Add set
            </Button>
          </CardContent>
        </Card>
      ))}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 p-4 backdrop-blur">
        <div className="mx-auto max-w-lg">
          <Button className="w-full" size="lg" onClick={finishWorkout} disabled={saving}>
            {saving ? 'Saving...' : 'Finish Workout'}
          </Button>
        </div>
      </div>
    </div>
  )
}
