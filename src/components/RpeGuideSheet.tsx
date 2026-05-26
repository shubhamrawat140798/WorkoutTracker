import { RPE_GUIDE_ROWS } from '@/lib/rpe'
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export function RpeGuideSheet({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>RPE scale</DialogTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Rate of Perceived Exertion — strength &amp; lifting context
          </p>
        </DialogHeader>
        <DialogBody className="space-y-3 p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="px-4 py-2 font-medium">RPE</th>
                  <th className="px-4 py-2 font-medium">Intensity</th>
                  <th className="px-4 py-2 font-medium">What it feels like</th>
                </tr>
              </thead>
              <tbody>
                {RPE_GUIDE_ROWS.map((row) => (
                  <tr key={row.level} className="border-b border-border/60 align-top">
                    <td className="whitespace-nowrap px-4 py-3 font-semibold">{row.level}</td>
                    <td className="whitespace-nowrap px-4 py-3">{row.intensity}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
