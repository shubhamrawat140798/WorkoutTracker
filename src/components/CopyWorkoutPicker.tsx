import { useEffect, useState } from 'react'
import { Copy, ChevronRight, Clock } from 'lucide-react'
import { api, type WorkoutDetail, type WorkoutSummary } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

type Props = {
  onCopy: (workout: WorkoutDetail) => void
  onError?: (message: string) => void
}

export function CopyWorkoutPicker({ onCopy, onError }: Props) {
  const [open, setOpen] = useState(false)
  const [workouts, setWorkouts] = useState<WorkoutSummary[]>([])
  const [loadingList, setLoadingList] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setLoadingList(true)
    api.workouts
      .list()
      .then(({ workouts: list }) => setWorkouts(list))
      .catch(() => {
        setWorkouts([])
        onError?.('Could not load workout history')
      })
      .finally(() => setLoadingList(false))
  }, [open, onError])

  const selectWorkout = async (id: string) => {
    setLoadingId(id)
    try {
      const { workout } = await api.workouts.get(id)
      onCopy(workout)
      setOpen(false)
    } catch {
      onError?.('Could not load workout')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-1">
        <Copy className="h-4 w-4" />
        Copy from workout
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copy from workout</DialogTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose a past workout to copy exercises and sets into this session.
            </p>
          </DialogHeader>
          <DialogBody className="space-y-2 p-0">
            {loadingList ? (
              <div className="flex justify-center py-10">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : workouts.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                No workouts yet. Finish a workout first.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {workouts.map((w) => (
                  <li key={w.id}>
                    <button
                      type="button"
                      disabled={loadingId !== null}
                      onClick={() => selectWorkout(w.id)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-accent disabled:opacity-50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{w.title}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(w.date)}</p>
                        {w.durationMinutes != null && (
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {w.durationMinutes} min
                          </p>
                        )}
                      </div>
                      {loadingId === w.id ? (
                        <div className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      ) : (
                        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  )
}
