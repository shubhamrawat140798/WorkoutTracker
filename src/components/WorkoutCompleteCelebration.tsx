import { useMemo } from 'react'
import { Trophy, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const MESSAGES = [
  'You showed up and put in the work. That’s what champions do.',
  'Another session in the books. Consistency wins.',
  'Strong work today — your future self will thank you.',
  'You didn’t just train your body, you trained your discipline.',
  'Progress isn’t always loud. Today, you made noise.',
  'Every rep counted. Be proud of that.',
  'The iron doesn’t lie — and neither does your effort.',
  'You finished what you started. That’s power.',
  'One more workout closer to who you want to become.',
  'Sore tomorrow, stronger forever.',
  'You earned this rest. Well done.',
  'Discipline beats motivation. You proved it today.',
]

const CONFETTI_COLORS = ['#22c55e', '#3b82f6', '#eab308', '#f97316', '#a855f7', '#ec4899']

type Props = {
  durationMinutes: number
  exerciseCount: number
  onContinue: () => void
}

export function WorkoutCompleteCelebration({ durationMinutes, exerciseCount, onContinue }: Props) {
  const message = useMemo(
    () => MESSAGES[Math.floor(Math.random() * MESSAGES.length)],
    [],
  )

  const confetti = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 0.8}s`,
        duration: `${2.2 + Math.random() * 1.2}s`,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 6 + Math.random() * 6,
      })),
    [],
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4 backdrop-blur-md"
      role="dialog"
      aria-labelledby="workout-complete-title"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {confetti.map((c) => (
          <span
            key={c.id}
            className="celebration-confetti absolute top-0 rounded-sm opacity-90"
            style={{
              left: c.left,
              width: c.size,
              height: c.size * 1.4,
              backgroundColor: c.color,
              animationDelay: c.delay,
              animationDuration: c.duration,
            }}
          />
        ))}
      </div>

      <div className="celebration-card relative w-full max-w-sm rounded-3xl border border-primary/30 bg-card p-8 text-center shadow-2xl shadow-primary/10">
        <div className="celebration-icon mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
          <Trophy className="h-9 w-9 text-primary" />
        </div>

        <div className="celebration-sparkle mb-2 flex items-center justify-center gap-1 text-primary">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Workout complete</span>
          <Sparkles className="h-4 w-4" />
        </div>

        <h2 id="workout-complete-title" className="celebration-title text-2xl font-bold">
          Congratulations!
        </h2>

        <p className="celebration-message mt-3 text-sm leading-relaxed text-muted-foreground">
          {message}
        </p>

        <p className="mt-4 text-sm text-foreground">
          <span className="font-semibold text-primary">{durationMinutes}</span> min ·{' '}
          <span className="font-semibold text-primary">{exerciseCount}</span>{' '}
          {exerciseCount === 1 ? 'exercise' : 'exercises'}
        </p>

        <Button className={cn('celebration-button mt-6 w-full')} size="lg" onClick={onContinue}>
          View workout
        </Button>
      </div>
    </div>
  )
}
