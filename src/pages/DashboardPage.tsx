import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Dumbbell, ChevronRight } from 'lucide-react'
import { api, type WorkoutSummary } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function DashboardPage() {
  const [workouts, setWorkouts] = useState<WorkoutSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.workouts
      .list()
      .then((r) => setWorkouts(r.workouts.slice(0, 3)))
      .catch(() => setWorkouts([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold">Ready to train?</h1>
        <p className="text-muted-foreground">Log your workout and track your progress</p>
      </section>

      <Link to="/workout/new">
        <Button size="lg" className="w-full gap-2 text-base">
          <Dumbbell className="h-5 w-5" />
          Start Workout
        </Button>
      </Link>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent workouts</h2>
          <Link to="/history" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : workouts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No workouts yet. Start your first session!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {workouts.map((w) => (
              <Link key={w.id} to={`/workout/${w.id}`}>
                <Card className="transition-colors hover:border-primary/50">
                  <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle className="text-base">{w.title}</CardTitle>
                      <CardDescription>{formatDate(w.date)}</CardDescription>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  {w.durationMinutes && (
                    <CardContent className="pt-0 text-sm text-muted-foreground">
                      {w.durationMinutes} min
                    </CardContent>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
