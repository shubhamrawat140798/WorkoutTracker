import { useEffect, useState } from 'react'
import {
  api,
  WEIGHT_UNIT_KEY,
  type BodyMeasurements,
  type ProfileSnapshot,
  type UserProfile,
} from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProfileProgressCharts } from '@/components/ProfileProgressCharts'

const GENDERS = [
  { value: '', label: 'Select gender' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const

const MEASUREMENT_FIELDS: { key: keyof BodyMeasurements; label: string }[] = [
  { key: 'chest', label: 'Chest' },
  { key: 'waist', label: 'Waist' },
  { key: 'hips', label: 'Hips' },
  { key: 'biceps', label: 'Biceps' },
  { key: 'thighs', label: 'Thighs' },
  { key: 'neck', label: 'Neck' },
]

function parseNum(value: string) {
  if (!value.trim()) return null
  const n = parseFloat(value)
  return Number.isFinite(n) ? n : null
}

function kgToDisplay(kg: number | null, unit: string) {
  if (kg == null) return ''
  return unit === 'lb' ? String(Math.round(kg * 2.20462 * 10) / 10) : String(kg)
}

function displayToKg(value: string, unit: string) {
  const n = parseNum(value)
  if (n == null) return null
  return unit === 'lb' ? Math.round((n / 2.20462) * 10) / 10 : n
}

export function ProfilePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [weightUnit] = useState(() => localStorage.getItem(WEIGHT_UNIT_KEY) || 'kg')

  const [gender, setGender] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [bodyWeight, setBodyWeight] = useState('')
  const [measurements, setMeasurements] = useState<Record<string, string>>({})
  const [snapshots, setSnapshots] = useState<ProfileSnapshot[]>([])

  const loadForm = (profile: UserProfile) => {
    setGender(profile.gender ?? '')
    setHeightCm(profile.heightCm != null ? String(profile.heightCm) : '')
    setBodyWeight(kgToDisplay(profile.weightKg, weightUnit))
    const m: Record<string, string> = {}
    for (const { key } of MEASUREMENT_FIELDS) {
      const v = profile.measurements[key]
      m[key] = v != null ? String(v) : ''
    }
    setMeasurements(m)
  }

  const loadHistory = () =>
    api.profile
      .history()
      .then(({ snapshots: list }) => setSnapshots(list))
      .catch(() => setSnapshots([]))

  useEffect(() => {
    setLoading(true)
    setError('')
    api.profile
      .get()
      .then(({ profile }) => loadForm(profile))
      .catch(() => setError('Could not load profile'))
      .finally(() => setLoading(false))
    loadHistory()
  }, [weightUnit])

  const updateMeasurement = (key: keyof BodyMeasurements, value: string) => {
    setMeasurements((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaved(false)
    setSaving(true)

    const measurementsPayload: BodyMeasurements = {}
    for (const { key } of MEASUREMENT_FIELDS) {
      measurementsPayload[key] = parseNum(measurements[key] ?? '')
    }

    try {
      const { profile } = await api.profile.update({
        gender: gender || null,
        heightCm: parseNum(heightCm),
        weightKg: displayToKg(bodyWeight, weightUnit),
        measurements: measurementsPayload,
      })
      loadForm(profile)
      await loadHistory()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground">
          {user?.name} · {user?.email}
        </p>
      </div>

      <ProfileProgressCharts snapshots={snapshots} weightUnit={weightUnit} />

      <form onSubmit={handleSave} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">About you</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm"
              >
                {GENDERS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                inputMode="decimal"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="e.g. 175"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Body weight ({weightUnit})</Label>
              <Input
                id="weight"
                type="number"
                inputMode="decimal"
                value={bodyWeight}
                onChange={(e) => setBodyWeight(e.target.value)}
                placeholder={weightUnit === 'lb' ? 'e.g. 180' : 'e.g. 75'}
              />
              <p className="text-xs text-muted-foreground">
                Uses your workout unit preference ({weightUnit}). Change it when logging a workout.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Body measurements</CardTitle>
            <p className="text-sm text-muted-foreground">All values in centimeters (cm)</p>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {MEASUREMENT_FIELDS.map(({ key, label }) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={`m-${key}`}>{label}</Label>
                <Input
                  id={`m-${key}`}
                  type="number"
                  inputMode="decimal"
                  value={measurements[key] ?? ''}
                  onChange={(e) => updateMeasurement(key, e.target.value)}
                  placeholder="cm"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {saved && <p className="text-sm text-primary">Profile saved.</p>}

        <Button type="submit" className="w-full" size="lg" disabled={saving}>
          {saving ? 'Saving…' : 'Save profile'}
        </Button>
      </form>
    </div>
  )
}
