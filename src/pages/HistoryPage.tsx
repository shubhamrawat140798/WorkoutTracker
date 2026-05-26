import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { api, type WorkoutSummary } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { DeleteWorkoutButton } from '@/components/DeleteWorkoutButton'

export function HistoryPage() {
  const [workouts, setWorkouts] = useState<WorkoutSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.workouts
      .list()
      .then((r) => setWorkouts(r.workouts))
      .catch(() => setWorkouts([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return workouts
    const q = search.toLowerCase()
    return workouts.filter(
      (w) => w.title.toLowerCase().includes(q) || w.date.includes(q),
    )
  }, [workouts, search])

  const grouped = useMemo(() => {
    const groups: Record<string, WorkoutSummary[]> = {}
    for (const w of filtered) {
      const month = w.date.slice(0, 7)
      if (!groups[month]) groups[month] = []
      groups[month].push(w)
    }
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
  }, [filtered])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">History</h1>
      <Input
        placeholder="Search workouts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">No workouts found</p>
      ) : (
        grouped.map(([month, items]) => (
          <section key={month}>
            <h2 className="mb-2 text-sm font-medium text-muted-foreground">
              {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="space-y-2">
              {items.map((w) => (
                <Card key={w.id} className="transition-colors hover:border-primary/50">
                  <CardHeader className="flex-row items-center gap-2 space-y-0 py-3">
                    <Link to={`/workout/${w.id}`} className="flex min-w-0 flex-1 items-center justify-between">
                      <div className="min-w-0">
                        <CardTitle className="text-base">{w.title}</CardTitle>
                        <CardDescription>{formatDate(w.date)}</CardDescription>
                      </div>
                      <ChevronRight className="ml-2 h-5 w-5 shrink-0 text-muted-foreground" />
                    </Link>
                    <DeleteWorkoutButton
                      workoutId={w.id}
                      workoutTitle={w.title}
                      onDeleted={() => setWorkouts((prev) => prev.filter((x) => x.id !== w.id))}
                    />
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  )
}
