import { Routine } from '../types/routine'
import { Card } from '@/components/ui/card'
import { Check } from 'lucide-react'

interface RoutineSelectorProps {
  routines: Routine[]
  selectedIds: string[]
  onToggle: (id: string) => void
}

export default function RoutineSelector({ routines, selectedIds, onToggle }: RoutineSelectorProps) {
  if (routines.length === 0) {
    return (
      <p className="text-[hsl(var(--color-muted-foreground))] text-center py-8">
        No routines available. Create some routines first.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {routines.map((routine) => {
        const isSelected = selectedIds.includes(routine.id)

        return (
          <button
            key={routine.id}
            type="button"
            onClick={() => onToggle(routine.id)}
            className="w-full text-left"
          >
            <Card
              className={`p-4 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[hsl(var(--color-primary))] bg-opacity-10 border-[hsl(var(--color-primary))] shadow-md'
                  : 'hover:shadow-md hover:bg-[hsl(var(--color-accent))]'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  {routine.name}
                </h3>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-[hsl(var(--color-primary))] flex items-center justify-center">
                    <Check className="h-4 w-4 text-[hsl(var(--color-primary-foreground))]" />
                  </div>
                )}
              </div>
            </Card>
          </button>
        )
      })}
    </div>
  )
}
