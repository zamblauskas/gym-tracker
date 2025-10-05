import { ExerciseType } from '../types/exerciseType'
import { Card } from '@/components/ui/card'
import { Check } from 'lucide-react'

interface ExerciseTypeSelectorProps {
  exerciseTypes: ExerciseType[]
  selectedIds: string[]
  onToggle: (id: string) => void
}

export default function ExerciseTypeSelector({ exerciseTypes, selectedIds, onToggle }: ExerciseTypeSelectorProps) {
  if (exerciseTypes.length === 0) {
    return (
      <p className="text-[hsl(var(--color-muted-foreground))] text-center py-8">
        No exercise types available. Create some exercise types first.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {exerciseTypes.map((exerciseType) => {
        const isSelected = selectedIds.includes(exerciseType.id)

        return (
          <button
            key={exerciseType.id}
            type="button"
            onClick={() => onToggle(exerciseType.id)}
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
                  {exerciseType.name}
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
