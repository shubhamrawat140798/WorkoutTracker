import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { api, type CatalogExercise } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function AdminExercisesPage() {
  const [exercises, setExercises] = useState<CatalogExercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    api.admin.catalog
      .list()
      .then(({ exercises: list }) => setExercises(list))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const remove = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" from the catalog?`)) return
    try {
      await api.admin.catalog.delete(id)
      setExercises((prev) => prev.filter((e) => e.id !== id))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Exercise catalog</h1>
          <p className="text-sm text-muted-foreground">Manage guides shown during workouts</p>
        </div>
        <Button asChild>
          <Link to="/admin/exercises/new">
            <Plus className="h-4 w-4" />
            Add
          </Link>
        </Button>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {!loading &&
        exercises.map((ex) => (
          <Card key={ex.id}>
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-base">{ex.name}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  /{ex.slug}
                  {!ex.published && ' · draft'}
                </p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" asChild>
                  <Link to={`/admin/exercises/${ex.id}/edit`} aria-label={`Edit ${ex.name}`}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(ex.id, ex.name)}
                  aria-label={`Delete ${ex.name}`}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {[ex.primaryMuscle, ex.equipment].filter(Boolean).join(' · ') || 'No metadata'}
            </CardContent>
          </Card>
        ))}
    </div>
  )
}
