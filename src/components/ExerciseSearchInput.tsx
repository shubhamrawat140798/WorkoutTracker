import { useEffect, useMemo, useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import type { CatalogExercise } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Props = {
  catalog: CatalogExercise[]
  loading?: boolean
  onAdd: (name: string) => void
}

export function ExerciseSearchInput({ catalog, loading, onAdd }: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)

  const trimmed = query.trim()

  const suggestions = useMemo(() => {
    if (!trimmed) return []
    const q = trimmed.toLowerCase()
    return catalog
      .filter((ex) => ex.name.toLowerCase().includes(q))
      .sort((a, b) => {
        const aStarts = a.name.toLowerCase().startsWith(q) ? 0 : 1
        const bStarts = b.name.toLowerCase().startsWith(q) ? 0 : 1
        if (aStarts !== bStarts) return aStarts - bStarts
        return a.name.localeCompare(b.name)
      })
      .slice(0, 8)
  }, [catalog, trimmed])

  const exactMatch = useMemo(
    () => catalog.some((ex) => ex.name.toLowerCase() === trimmed.toLowerCase()),
    [catalog, trimmed],
  )

  const hasCustomOption = !exactMatch && trimmed.length > 0
  const optionCount = suggestions.length + (hasCustomOption ? 1 : 0)
  const showList = open && trimmed.length > 0 && optionCount > 0

  useEffect(() => {
    setHighlight(0)
  }, [suggestions.length, trimmed])

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  const submit = (name: string) => {
    const value = name.trim()
    if (!value) return
    onAdd(value)
    setQuery('')
    setOpen(false)
    setHighlight(0)
  }

  const pickSuggestion = (index: number) => {
    const item = suggestions[index]
    if (item) submit(item.name)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!showList) return
      setHighlight((h) => Math.min(h + 1, optionCount - 1))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => Math.max(h - 1, 0))
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      if (showList && highlight < suggestions.length && suggestions[highlight]) {
        pickSuggestion(highlight)
      } else {
        submit(trimmed)
      }
      return
    }
    if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={rootRef} className="relative flex gap-2">
      <div className="relative min-w-0 flex-1">
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={loading ? 'Loading exercises…' : 'Search or type exercise name'}
          disabled={loading}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls="exercise-suggestions"
        />
        {showList && (
          <ul
            id="exercise-suggestions"
            role="listbox"
            className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-border bg-card py-1 shadow-lg"
          >
            {suggestions.map((ex, i) => (
              <li key={ex.id} role="option" aria-selected={i === highlight}>
                <button
                  type="button"
                  className={cn(
                    'flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-accent',
                    i === highlight && 'bg-accent',
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => submit(ex.name)}
                >
                  <span className="font-medium">{ex.name}</span>
                  {(ex.primaryMuscle || ex.equipment) && (
                    <span className="text-xs text-muted-foreground">
                      {[ex.primaryMuscle, ex.equipment].filter(Boolean).join(' · ')}
                    </span>
                  )}
                </button>
              </li>
            ))}
            {hasCustomOption && (
              <li role="option" aria-selected={highlight === suggestions.length}>
                <button
                  type="button"
                  className={cn(
                    'flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent',
                    highlight === suggestions.length && 'bg-accent',
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => submit(trimmed)}
                >
                  <Plus className="h-4 w-4 shrink-0" />
                  Add custom: &ldquo;{trimmed}&rdquo;
                </button>
              </li>
            )}
          </ul>
        )}
      </div>
      <Button onClick={() => submit(trimmed)} disabled={!trimmed || loading} aria-label="Add exercise">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
