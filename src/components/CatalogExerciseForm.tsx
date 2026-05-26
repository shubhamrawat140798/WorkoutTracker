import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { CatalogExercise, CatalogExerciseInput } from '@/lib/api'
import { slugify } from '@/lib/slug'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function linesToArray(text: string) {
  return text
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
}

function arrayToLines(arr: string[]) {
  return arr.join('\n')
}

type Props = {
  initial?: CatalogExercise
  onSubmit: (body: CatalogExerciseInput) => Promise<void>
}

export function CatalogExerciseForm({ initial, onSubmit }: Props) {
  const navigate = useNavigate()
  const [name, setName] = useState(initial?.name ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [primaryMuscle, setPrimaryMuscle] = useState(initial?.primaryMuscle ?? '')
  const [equipment, setEquipment] = useState(initial?.equipment ?? '')
  const [level, setLevel] = useState(initial?.level ?? '')
  const [instructions, setInstructions] = useState(arrayToLines(initial?.instructions ?? []))
  const [tips, setTips] = useState(arrayToLines(initial?.tips ?? []))
  const [heroImageUrl, setHeroImageUrl] = useState(initial?.heroImageUrl ?? '')
  const [stepImageUrls, setStepImageUrls] = useState(arrayToLines(initial?.stepImageUrls ?? []))
  const [published, setPublished] = useState(initial?.published ?? true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await onSubmit({
        name: name.trim(),
        slug: slug.trim() || slugify(name),
        primaryMuscle: primaryMuscle.trim() || null,
        equipment: equipment.trim() || null,
        level: level.trim() || null,
        instructions: linesToArray(instructions),
        tips: linesToArray(tips),
        heroImageUrl: heroImageUrl.trim(),
        stepImageUrls: linesToArray(stepImageUrls),
        published,
      })
      navigate('/admin/exercises')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug (optional)</Label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder={name ? slugify(name) : 'bench-press'}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="muscle">Primary muscle</Label>
          <Input id="muscle" value={primaryMuscle} onChange={(e) => setPrimaryMuscle(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="equipment">Equipment</Label>
          <Input id="equipment" value={equipment} onChange={(e) => setEquipment(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="level">Level</Label>
          <Input id="level" value={level} onChange={(e) => setLevel(e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="instructions">Instructions (one per line)</Label>
        <textarea
          id="instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={5}
          className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tips">Tips (one per line)</Label>
        <textarea
          id="tips"
          value={tips}
          onChange={(e) => setTips(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="hero">Hero image URL (HTTPS)</Label>
        <Input
          id="hero"
          type="url"
          value={heroImageUrl}
          onChange={(e) => setHeroImageUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="steps">Step image URLs (one per line, HTTPS)</Label>
        <textarea
          id="steps"
          value={stepImageUrls}
          onChange={(e) => setStepImageUrls(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm"
          placeholder="https://..."
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
        Published (visible to all users)
      </label>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save exercise'}
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate('/admin/exercises')}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
