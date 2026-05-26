import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api, type CatalogExercise } from '@/lib/api'
import { CatalogExerciseForm } from '@/components/CatalogExerciseForm'

export function AdminExerciseEditPage() {
  const { id } = useParams<{ id: string }>()
  const [exercise, setExercise] = useState<CatalogExercise | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    api.admin.catalog
      .get(id)
      .then(({ exercise: ex }) => setExercise(ex))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!exercise) return <p className="text-muted-foreground">Exercise not found</p>

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Edit exercise</h1>
      <CatalogExerciseForm
        initial={exercise}
        onSubmit={(body) => api.admin.catalog.update(exercise.id, body).then(() => undefined)}
      />
    </div>
  )
}
