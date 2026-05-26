import { getRpeOptionLabel, RPE_SELECT_VALUES } from '@/lib/rpe'

const selectClass =
  'h-11 w-full min-w-0 rounded-xl border border-border bg-card px-1 text-sm text-foreground'

type Props = {
  value: string
  onChange: (value: string) => void
}

export function RpeSelect({ value, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={selectClass}
      aria-label="RPE"
    >
      <option value="">—</option>
      {RPE_SELECT_VALUES.map((n) => (
        <option key={n} value={String(n)} title={getRpeOptionLabel(n)}>
          {n}
        </option>
      ))}
    </select>
  )
}
