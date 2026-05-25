import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Copy, X } from 'lucide-react'
import { api, DRAFT_KEY, WEIGHT_UNIT_KEY, type DraftWorkout } from '@/lib/api'
import { todayISO } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const QUICK_EXERCISES = ['Bench Press', 'Squat', 'Deadlift', 'Overhead Press', 'Barbell Row', 'Pull-ups']

function emptySet(n: number) {
  return { setNumber: n, reps: '', weight: '', rpe: '', notes: '' }
}

function emptyExercise(name: string, order: number) {
  return { name, sortOrder: order, sets: [emptySet(1)] }
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
  const [exercises, setExercises] = useState(() => {
    const draft = loadDraft()
    if (draft?.exercises?.length) return draft.exercises
    return [emptyExercise('Bench Press', 0)]
  })
  const [startedAt] = useState(() => {
    const draft = loadDraft()
    return draft?.startedAt || new Date().toISOString()
  })
  const [weightUnit, setWeightUnit] = useState(() => localStorage.getItem(WEIGHT_UNIT_KEY) || 'kg')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [customExercise, setCustomExercise] = useState('')

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

  const addExercise = (name: string) => {
    if (!name.trim()) return
    setExercises((prev) => [...prev, emptyExercise(name.trim(), prev.length)])
    setCustomExercise('')
  }

  const removeExercise = (index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index).map((e, i) => ({ ...e, sortOrder: i })))
  }

  const addSet = (exIndex: number) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exIndex
          ? { ...ex, sets: [...ex.sets, emptySet(ex.sets.length + 1)] }
          : ex,
      ),
    )
  }

  const removeSet = (exIndex: number, setIndex: number) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exIndex
          ? {
              ...ex,
              sets: ex.sets
                .filter((_, si) => si !== setIndex)
                .map((s, si) => ({ ...s, setNumber: si + 1 })),
            }
          : ex,
      ),
    )
  }

  const updateSet = (exIndex: number, setIndex: number, field: string, value: string) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exIndex
          ? {
              ...ex,
              sets: ex.sets.map((s, si) => (si === setIndex ? { ...s, [field]: value } : s)),
            }
          : ex,
      ),
    )
  }

  const copyLastWorkout = async () => {
    try {
      const { workout } = await api.workouts.last()
      if (!workout) {
        setError('No previous workout to copy')
        return
      }
      setTitle(workout.title)
      setExercises(
        workout.exercises.map((ex, i) => ({
          name: ex.name,
          sortOrder: i,
          sets: ex.sets.map((s) => ({
            setNumber: s.setNumber,
            reps: s.reps?.toString() ?? '',
            weight: s.weight?.toString() ?? '',
            rpe: s.rpe?.toString() ?? '',
            notes: s.notes ?? '',
          })),
        })),
      )
      setError('')
    } catch {
      setError('Could not load last workout')
    }
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

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={copyLastWorkout} className="gap-1">
          <Copy className="h-4 w-4" />
          Copy last
        </Button>
        {QUICK_EXERCISES.map((name) => (
          <Button key={name} variant="secondary" size="sm" onClick={() => addExercise(name)}>
            + {name}
          </Button>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={customExercise}
          onChange={(e) => setCustomExercise(e.target.value)}
          placeholder="Custom exercise"
          onKeyDown={(e) => e.key === 'Enter' && addExercise(customExercise)}
        />
        <Button onClick={() => addExercise(customExercise)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {exercises.map((ex, exIndex) => (
        <Card key={exIndex}>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">{ex.name}</CardTitle>
            <button
              onClick={() => removeExercise(exIndex)}
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
              <span>RPE</span>
              <span></span>
            </div>
            {ex.sets.map((s, setIndex) => (
              <div key={setIndex} className="grid grid-cols-5 gap-1">
                <span className="flex h-11 items-center text-sm">{s.setNumber}</span>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={s.reps}
                  onChange={(e) => updateSet(exIndex, setIndex, 'reps', e.target.value)}
                  placeholder="0"
                  className="h-11 px-2"
                />
                <Input
                  type="number"
                  inputMode="decimal"
                  value={s.weight}
                  onChange={(e) => updateSet(exIndex, setIndex, 'weight', e.target.value)}
                  placeholder="0"
                  className="h-11 px-2"
                />
                <Input
                  type="number"
                  inputMode="numeric"
                  value={s.rpe}
                  onChange={(e) => updateSet(exIndex, setIndex, 'rpe', e.target.value)}
                  placeholder="—"
                  className="h-11 px-2"
                />
                <button
                  onClick={() => removeSet(exIndex, setIndex)}
                  className="flex h-11 items-center justify-center text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={() => addSet(exIndex)} className="w-full">
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
