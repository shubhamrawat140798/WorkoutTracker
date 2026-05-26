import { useEffect, useState } from 'react'
import { api, ApiError, type CatalogExercise } from '@/lib/api'
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

function GuideImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) return null
  return (
    <img
      src={src}
      alt={alt}
      className="w-full rounded-xl border border-border object-cover"
      onError={() => setFailed(true)}
    />
  )
}

export function ExerciseGuideSheet({
  open,
  onOpenChange,
  exerciseName,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  exerciseName: string
}) {
  const [exercise, setExercise] = useState<CatalogExercise | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || !exerciseName.trim()) return
    setLoading(true)
    setError('')
    setExercise(null)

    const slug = exerciseName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    api.catalog
      .get(slug)
      .then(({ exercise: ex }) => setExercise(ex))
      .catch((e) => {
        if (e instanceof ApiError && e.status === 404) {
          setError('No guide available for this exercise yet.')
        } else {
          setError(e instanceof Error ? e.message : 'Could not load guide')
        }
      })
      .finally(() => setLoading(false))
  }, [open, exerciseName])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{exercise?.name ?? exerciseName}</DialogTitle>
          {exercise && (
            <p className="mt-1 text-sm text-muted-foreground">
              {[exercise.primaryMuscle, exercise.equipment, exercise.level].filter(Boolean).join(' · ')}
            </p>
          )}
        </DialogHeader>
        <DialogBody className="space-y-4">
          {loading && (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}
          {!loading && error && <p className="text-sm text-muted-foreground">{error}</p>}
          {!loading && exercise && (
            <>
              {exercise.heroImageUrl && (
                <GuideImage src={exercise.heroImageUrl} alt={`${exercise.name} demonstration`} />
              )}
              {exercise.instructions.length > 0 && (
                <section>
                  <h3 className="mb-2 text-sm font-semibold">How to perform</h3>
                  <ol className="list-decimal space-y-2 pl-5 text-sm">
                    {exercise.instructions.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </section>
              )}
              {exercise.stepImageUrls.length > 0 && (
                <div className="grid gap-2">
                  {exercise.stepImageUrls.map((url, i) => (
                    <GuideImage key={i} src={url} alt={`Step ${i + 1}`} />
                  ))}
                </div>
              )}
              {exercise.tips.length > 0 && (
                <section>
                  <h3 className="mb-2 text-sm font-semibold">Tips</h3>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {exercise.tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
