import { useState } from 'react'
import { Info } from 'lucide-react'
import { ExerciseGuideSheet } from '@/components/ExerciseGuideSheet'

export function ExerciseGuideButton({ exerciseName }: { exerciseName: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
        aria-label={`View guide for ${exerciseName}`}
      >
        <Info className="h-4 w-4" />
      </button>
      <ExerciseGuideSheet open={open} onOpenChange={setOpen} exerciseName={exerciseName} />
    </>
  )
}
