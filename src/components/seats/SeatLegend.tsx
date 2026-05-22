import { cn } from '@/lib/utils'

type LegendItem = {
  color: string
  label: string
}

const items: LegendItem[] = [
  { color: 'bg-emerald-100 border-emerald-400', label: 'Available' },
  { color: 'bg-blue-100 border-blue-500', label: 'Selected' },
  { color: 'bg-red-100 border-red-400', label: 'Occupied' },
  { color: 'bg-amber-100 border-amber-400', label: 'Your seat' },
]

export function SeatLegend() {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {items.map(({ color, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className={cn('w-4 h-4 rounded border-2', color)} />
          <span className="text-xs text-gray-500">{label}</span>
        </div>
      ))}
    </div>
  )
}
