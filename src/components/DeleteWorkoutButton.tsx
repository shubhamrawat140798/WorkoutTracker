import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface DeleteWorkoutButtonProps {
  workoutId: string
  workoutTitle: string
  onDeleted: () => void
  variant?: 'icon' | 'full'
  className?: string
}

export function DeleteWorkoutButton({
  workoutId,
  workoutTitle,
  onDeleted,
  variant = 'icon',
  className,
}: DeleteWorkoutButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const openConfirm = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setConfirmOpen(true)
  }

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await api.workouts.delete(workoutId)
      setConfirmOpen(false)
      onDeleted()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete workout')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      {variant === 'full' ? (
        <Button
          variant="destructive"
          className={cn('w-full gap-2', className)}
          onClick={openConfirm}
          disabled={deleting}
        >
          <Trash2 className="h-4 w-4" />
          Delete workout
        </Button>
      ) : (
        <button
          type="button"
          onClick={openConfirm}
          disabled={deleting}
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50',
            className,
          )}
          aria-label={`Delete ${workoutTitle}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete workout?</DialogTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              &ldquo;{workoutTitle}&rdquo; will be permanently removed. This cannot be undone.
            </p>
          </DialogHeader>
          <DialogBody className="flex gap-2 pt-0">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setConfirmOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1 gap-2"
              onClick={confirmDelete}
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  )
}
