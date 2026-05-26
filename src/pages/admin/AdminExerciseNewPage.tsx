import { api } from '@/lib/api'
import { CatalogExerciseForm } from '@/components/CatalogExerciseForm'

export function AdminExerciseNewPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">New exercise</h1>
      <CatalogExerciseForm onSubmit={(body) => api.admin.catalog.create(body).then(() => undefined)} />
    </div>
  )
}
