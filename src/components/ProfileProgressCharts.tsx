import { useMemo, useState } from 'react'
import type { ProfileSnapshot } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type MetricKey = 'weightKg' | 'heightCm' | 'chest' | 'waist' | 'hips' | 'biceps' | 'thighs' | 'neck'

const METRICS: { key: MetricKey; label: string; unit: string }[] = [
  { key: 'weightKg', label: 'Weight', unit: 'kg' },
  { key: 'heightCm', label: 'Height', unit: 'cm' },
  { key: 'chest', label: 'Chest', unit: 'cm' },
  { key: 'waist', label: 'Waist', unit: 'cm' },
  { key: 'hips', label: 'Hips', unit: 'cm' },
  { key: 'biceps', label: 'Biceps', unit: 'cm' },
  { key: 'thighs', label: 'Thighs', unit: 'cm' },
  { key: 'neck', label: 'Neck', unit: 'cm' },
]

function getMetricValue(snapshot: ProfileSnapshot, key: MetricKey): number | null {
  if (key === 'weightKg') return snapshot.weightKg
  if (key === 'heightCm') return snapshot.heightCm
  return snapshot.measurements[key] ?? null
}

function kgToLb(kg: number) {
  return Math.round(kg * 2.20462 * 10) / 10
}

function buildSeries(snapshots: ProfileSnapshot[], key: MetricKey, weightUnit: string) {
  const points: { date: string; value: number; label: string }[] = []
  for (const s of snapshots) {
    const raw = getMetricValue(s, key)
    if (raw == null) continue
    const value = key === 'weightKg' && weightUnit === 'lb' ? kgToLb(raw) : raw
    const d = new Date(s.recordedAt)
    points.push({
      date: s.recordedAt,
      value,
      label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    })
  }
  return points
}

function ProgressLineChart({
  points,
  unit,
}: {
  points: { label: string; value: number }[]
  unit: string
}) {
  if (points.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No data for this metric yet. Save your profile with a value filled in.
      </p>
    )
  }

  if (points.length === 1) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Latest: {points[0].value} {unit} ({points[0].label}). Save again later to see a progress line.
      </p>
    )
  }

  const values = points.map((p) => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const w = 320
  const h = 140
  const padX = 28
  const padY = 20

  const coords = points.map((p, i) => {
    const x = padX + (i / (points.length - 1)) * (w - padX * 2)
    const y = h - padY - ((p.value - min) / range) * (h - padY * 2)
    return { x, y, ...p }
  })

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ')

  const first = points[0].value
  const last = points[points.length - 1].value
  const delta = Math.round((last - first) * 10) / 10

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>
          {min} – {max} {unit}
        </span>
        <span className={cn(delta > 0 && 'text-amber-600', delta < 0 && 'text-emerald-600')}>
          {delta > 0 ? '+' : ''}
          {delta} {unit} total
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full text-primary" role="img" aria-label="Progress chart">
        <line
          x1={padX}
          y1={h - padY}
          x2={w - padX}
          y2={h - padY}
          stroke="currentColor"
          strokeOpacity={0.15}
          strokeWidth={1}
        />
        <path
          d={linePath}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {coords.map((c, i) => (
          <g key={i}>
            <circle cx={c.x} cy={c.y} r={4} fill="currentColor" />
            <title>
              {c.label}: {c.value} {unit}
            </title>
          </g>
        ))}
      </svg>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{points[0].label}</span>
        <span>{points[points.length - 1].label}</span>
      </div>
    </div>
  )
}

type Props = {
  snapshots: ProfileSnapshot[]
  weightUnit: string
}

export function ProfileProgressCharts({ snapshots, weightUnit }: Props) {
  const availableMetrics = useMemo(() => {
    return METRICS.filter((m) => buildSeries(snapshots, m.key, weightUnit).length > 0)
  }, [snapshots, weightUnit])

  const [active, setActive] = useState<MetricKey>('weightKg')

  const effectiveKey = availableMetrics.some((m) => m.key === active)
    ? active
    : (availableMetrics[0]?.key ?? 'weightKg')

  const metric = METRICS.find((m) => m.key === effectiveKey)!
  const displayUnit =
    effectiveKey === 'weightKg' ? weightUnit : metric.unit

  const points = useMemo(
    () => buildSeries(snapshots, effectiveKey, weightUnit),
    [snapshots, effectiveKey, weightUnit],
  )

  if (snapshots.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progress</CardTitle>
          <p className="text-sm text-muted-foreground">
            Save your profile to start tracking changes over time.
          </p>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Progress</CardTitle>
        <p className="text-sm text-muted-foreground">
          Based on each time you save your profile ({snapshots.length} entries)
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {availableMetrics.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {availableMetrics.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setActive(m.key)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  effectiveKey === m.key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80',
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        ) : null}
        <ProgressLineChart
          points={points.map((p) => ({ label: p.label, value: p.value }))}
          unit={displayUnit}
        />
      </CardContent>
    </Card>
  )
}
