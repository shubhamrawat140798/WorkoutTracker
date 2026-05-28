import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Pencil } from 'lucide-react'
import { api, ApiError, type WorkoutDetail } from '@/lib/api'
import { cn, formatDate, formatTime, formatVolume } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DeleteWorkoutButton } from '@/components/DeleteWorkoutButton'
import { ExerciseGuideButton } from '@/components/ExerciseGuideButton'
import { RpeInfoButton } from '@/components/RpeInfoButton'
import { getRpeGuideForValue } from '@/lib/rpe'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { RpeSelect } from '@/components/RpeSelect'

function calculateTotalVolume(exercises: { sets: { reps: number | null; weight: number | null }[] }[]) {
  let total = 0
  for (const ex of exercises) {
    for (const s of ex.sets) {
      if (s.reps && s.weight) total += s.reps * s.weight
    }
  }
  return total
}

function isoToTimeValue(iso: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

function combineDateAndTime(date: string, time: string) {
  if (!date || !time) return null
  const d = new Date(`${date}T${time}`)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

export function WorkoutDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [workout, setWorkout] = useState<WorkoutDetail | null>(null)
  const [totalVolume, setTotalVolume] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState('')
  const [logEditOpen, setLogEditOpen] = useState(false)
  const [logSaving, setLogSaving] = useState(false)
  const [logError, setLogError] = useState('')
  const [formTitle, setFormTitle] = useState('')
  const [formDate, setFormDate] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [formStartTime, setFormStartTime] = useState('')
  const [formEndTime, setFormEndTime] = useState('')
  const [logExercises, setLogExercises] = useState<
    {
      name: string
      sortOrder: number
      sets: { setNumber: number; reps: string; weight: string; weightUnit: 'kg' | 'lb'; rpe: string }[]
    }[]
  >([])

  useEffect(() => {
    if (!id) return
    setLoadError('')
    api.workouts
      .get(id)
      .then((r) => {
        setWorkout(r.workout)
        setTotalVolume(r.totalVolume)
      })
      .catch((e) => {
        setWorkout(null)
        setTotalVolume(0)
        setLoadError(e instanceof ApiError ? e.message : 'Could not load workout')
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
    return (
      <div className="space-y-3">
        <Link
          to="/history"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <p className="text-center text-muted-foreground">{loadError || 'Workout not found'}</p>
      </div>
    )
  }

  const unit = workout.exercises[0]?.sets[0]?.weightUnit || 'kg'

  const computedDuration = (() => {
    if (!formDate || !formStartTime || !formEndTime) return null
    const startIso = combineDateAndTime(formDate, formStartTime)
    const endIso = combineDateAndTime(formDate, formEndTime)
    if (!startIso || !endIso) return null
    const start = new Date(startIso).getTime()
    const end = new Date(endIso).getTime()
    if (Number.isNaN(start) || Number.isNaN(end) || end < start) return null
    return Math.round((end - start) / 60000)
  })()

  const openEdit = () => {
    setEditError('')
    setFormTitle(workout.title)
    setFormDate(workout.date)
    setFormNotes(workout.notes ?? '')
    setFormStartTime(isoToTimeValue(workout.startedAt))
    setFormEndTime(isoToTimeValue(workout.completedAt))
    setEditOpen(true)
  }

  const openLogEdit = () => {
    setLogError('')
    setLogExercises(
      workout.exercises.map((ex, idx) => ({
        name: ex.name,
        sortOrder: typeof ex.sortOrder === 'number' ? ex.sortOrder : idx,
        sets: ex.sets.map((s) => ({
          setNumber: s.setNumber,
          reps: s.reps != null ? String(s.reps) : '',
          weight: s.weight != null ? String(s.weight) : '',
          weightUnit: (s.weightUnit as 'kg' | 'lb') || 'kg',
          rpe: s.rpe != null ? String(s.rpe) : '',
        })),
      })),
    )
    setLogEditOpen(true)
  }

  const saveLogEdit = async () => {
    if (!id) return
    setLogSaving(true)
    setLogError('')
    try {
      const payloadExercises = logExercises.map((ex) => ({
        name: ex.name,
        sortOrder: ex.sortOrder,
        sets: ex.sets.map((s) => ({
          setNumber: s.setNumber,
          reps: s.reps.trim() ? Number.parseInt(s.reps, 10) : null,
          weight: s.weight.trim() ? Number.parseFloat(s.weight) : null,
          weightUnit: s.weightUnit,
          rpe: s.rpe.trim() ? Number.parseInt(s.rpe, 10) : null,
          notes: null,
        })),
      }))

      const res = await api.workouts.update(id, { exercises: payloadExercises })
      setWorkout(res.workout)
      setTotalVolume(calculateTotalVolume(res.workout.exercises))
      setLogEditOpen(false)
    } catch (e) {
      setLogError(e instanceof ApiError ? e.message : 'Could not update workout log')
    } finally {
      setLogSaving(false)
    }
  }

  const saveEdit = async () => {
    if (!id) return
    setSaving(true)
    setEditError('')
    try {
      const startedAt = formStartTime ? combineDateAndTime(formDate, formStartTime) : null
      const completedAt = formEndTime ? combineDateAndTime(formDate, formEndTime) : null
      const res = await api.workouts.update(id, {
        title: formTitle.trim() || 'Workout',
        date: formDate,
        notes: formNotes.trim() ? formNotes.trim() : null,
        startedAt,
        completedAt,
      })
      setWorkout(res.workout)
      setEditOpen(false)
    } catch (e) {
      setEditError(e instanceof ApiError ? e.message : 'Could not update workout')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <Link to="/history" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-bold">{workout.title}</h1>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2" onClick={openLogEdit}>
              <Pencil className="h-4 w-4" />
              Edit log
            </Button>
            <Button variant="outline" className="gap-2" onClick={openEdit}>
              <Pencil className="h-4 w-4" />
              Edit workout
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground">{formatDate(workout.date)}</p>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {workout.durationMinutes != null && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {workout.durationMinutes} min
            </span>
          )}
          {workout.startedAt && workout.completedAt && (
            <span>
              {formatTime(workout.startedAt)} – {formatTime(workout.completedAt)}
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
                <span className="flex items-center gap-0.5">
                  RPE
                  <RpeInfoButton />
                </span>
              </div>
              {ex.sets.map((s) => {
                const rpeGuide = s.rpe != null ? getRpeGuideForValue(s.rpe) : undefined
                return (
                  <div key={s.setNumber} className="grid grid-cols-4 gap-2 border-t border-border py-2 text-sm">
                    <span>{s.setNumber}</span>
                    <span>{s.reps ?? '—'}</span>
                    <span>{s.weight != null ? `${s.weight} ${s.weightUnit}` : '—'}</span>
                    <span>
                      {s.rpe != null ? (
                        <>
                          {s.rpe}
                          {rpeGuide && (
                            <span className="block text-xs text-muted-foreground">{rpeGuide.intensity}</span>
                          )}
                        </>
                      ) : (
                        '—'
                      )}
                    </span>
                  </div>
                )
              })}
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

      <Dialog open={logEditOpen} onOpenChange={setLogEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit workout log</DialogTitle>
            <p className="mt-2 text-sm text-muted-foreground">Edit reps, weight, weight unit, and RPE for each set.</p>
          </DialogHeader>
          <DialogBody className="space-y-4">
            {logExercises.map((ex, exIdx) => (
              <div key={`${ex.name}-${exIdx}`} className="rounded-2xl border border-border p-3">
                <p className="mb-2 text-sm font-medium">{ex.name}</p>
                <div className="grid grid-cols-5 gap-2 text-xs font-medium text-muted-foreground">
                  <span>Set</span>
                  <span>Reps</span>
                  <span>Weight</span>
                  <span>Unit</span>
                  <span className="flex items-center gap-0.5">
                    RPE
                    <RpeInfoButton />
                  </span>
                </div>
                {ex.sets.map((s, setIdx) => (
                  <div key={s.setNumber} className="grid grid-cols-5 gap-2 border-t border-border py-2">
                    <span className="flex h-11 items-center text-sm">{s.setNumber}</span>
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={s.reps}
                      onChange={(e) =>
                        setLogExercises((prev) => {
                          const next = [...prev]
                          const exNext = { ...next[exIdx] }
                          const setsNext = [...exNext.sets]
                          setsNext[setIdx] = { ...setsNext[setIdx], reps: e.target.value }
                          exNext.sets = setsNext
                          next[exIdx] = exNext
                          return next
                        })
                      }
                      className="h-11 px-2"
                    />
                    <Input
                      type="number"
                      inputMode="decimal"
                      value={s.weight}
                      onChange={(e) =>
                        setLogExercises((prev) => {
                          const next = [...prev]
                          const exNext = { ...next[exIdx] }
                          const setsNext = [...exNext.sets]
                          setsNext[setIdx] = { ...setsNext[setIdx], weight: e.target.value }
                          exNext.sets = setsNext
                          next[exIdx] = exNext
                          return next
                        })
                      }
                      className="h-11 px-2"
                    />
                    <select
                      value={s.weightUnit}
                      onChange={(e) =>
                        setLogExercises((prev) => {
                          const next = [...prev]
                          const exNext = { ...next[exIdx] }
                          const setsNext = [...exNext.sets]
                          setsNext[setIdx] = { ...setsNext[setIdx], weightUnit: e.target.value as 'kg' | 'lb' }
                          exNext.sets = setsNext
                          next[exIdx] = exNext
                          return next
                        })
                      }
                      className="h-11 w-full rounded-xl border border-border bg-card px-2 text-sm"
                      aria-label="Weight unit"
                    >
                      <option value="kg">kg</option>
                      <option value="lb">lb</option>
                    </select>
                    <RpeSelect
                      value={s.rpe}
                      onChange={(v) =>
                        setLogExercises((prev) => {
                          const next = [...prev]
                          const exNext = { ...next[exIdx] }
                          const setsNext = [...exNext.sets]
                          setsNext[setIdx] = { ...setsNext[setIdx], rpe: v }
                          exNext.sets = setsNext
                          next[exIdx] = exNext
                          return next
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            ))}

            {logError && <p className="text-sm text-destructive">{logError}</p>}

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setLogEditOpen(false)} disabled={logSaving}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={saveLogEdit} disabled={logSaving}>
                {logSaving ? 'Saving…' : 'Save log'}
              </Button>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit workout</DialogTitle>
            <p className="mt-2 text-sm text-muted-foreground">Update the title, date, notes, and start/end time.</p>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workout-title">Title</Label>
              <Input id="workout-title" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workout-date">Date</Label>
              <Input id="workout-date" type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="workout-start">Start time</Label>
                <Input
                  id="workout-start"
                  type="time"
                  value={formStartTime}
                  onChange={(e) => setFormStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workout-end">End time</Label>
                <Input
                  id="workout-end"
                  type="time"
                  value={formEndTime}
                  onChange={(e) => setFormEndTime(e.target.value)}
                />
              </div>
            </div>

            <p className={cn('text-xs text-muted-foreground', computedDuration == null && 'opacity-60')}>
              Duration: {computedDuration == null ? '—' : `${computedDuration} min`}
            </p>

            <div className="space-y-2">
              <Label htmlFor="workout-notes">Notes</Label>
              <Input
                id="workout-notes"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Notes (optional)"
              />
            </div>

            {editError && <p className="text-sm text-destructive">{editError}</p>}

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setEditOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={saveEdit} disabled={saving || !formDate.trim()}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  )
}
