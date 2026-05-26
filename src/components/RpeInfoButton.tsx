import { useState } from 'react'
import { Info } from 'lucide-react'
import { RpeGuideSheet } from '@/components/RpeGuideSheet'

export function RpeInfoButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
        aria-label="RPE scale guide"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      <RpeGuideSheet open={open} onOpenChange={setOpen} />
    </>
  )
}
