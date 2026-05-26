import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
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
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const confirmed = window.confirm(
      `Delete "${workoutTitle}"?\n\nThis cannot be undone.`,
    )
    if (!confirmed) return

    setDeleting(true)
    try {
      await api.workouts.delete(workoutId)
      onDeleted()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete workout')
    } finally {
      setDeleting(false)
    }
  }

  if (variant === 'full') {
    return (
      <Button
        variant="destructive"
        className={cn('w-full gap-2', className)}
        onClick={handleDelete}
        disabled={deleting}
      >
        <Trash2 className="h-4 w-4" />
        {deleting ? 'Deleting...' : 'Delete workout'}
      </Button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50',
        className,
      )}
      aria-label={`Delete ${workoutTitle}`}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )
}
