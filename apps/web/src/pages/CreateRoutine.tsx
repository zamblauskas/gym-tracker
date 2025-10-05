import { useState, FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CreateRoutineInput } from '../types/routine'
import { ExerciseType } from '../types/exerciseType'
import ExerciseTypeSelector from '../components/ExerciseTypeSelector'

interface CreateRoutineProps {
  exerciseTypes: ExerciseType[]
  onSave: (input: CreateRoutineInput) => void
  onCancel: () => void
}

export default function CreateRoutine({ exerciseTypes, onSave, onCancel }: CreateRoutineProps) {
  const [name, setName] = useState('')
  const [selectedExerciseTypeIds, setSelectedExerciseTypeIds] = useState<string[]>([])

  const handleToggleExerciseType = (id: string) => {
    setSelectedExerciseTypeIds(prev =>
      prev.includes(id)
        ? prev.filter(exerciseTypeId => exerciseTypeId !== id)
        : [...prev, id]
    )
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      const input: CreateRoutineInput = {
        name: name.trim(),
        exerciseTypeIds: selectedExerciseTypeIds,
      }
      onSave(input)
      setName('')
      setSelectedExerciseTypeIds([])
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Create Routine</h1>
        <p className="text-[hsl(var(--color-muted-foreground))] mt-2">Add a new workout routine</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Routine Name</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Chest + Triceps"
            required
            autoFocus
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label>Exercise Types</Label>
          <p className="text-sm text-[hsl(var(--color-muted-foreground))] mb-3">
            Select exercise types to include in this routine ({selectedExerciseTypeIds.length} selected)
          </p>
          <div className="max-h-[400px] overflow-y-auto pr-2">
            <ExerciseTypeSelector
              exerciseTypes={exerciseTypes}
              selectedIds={selectedExerciseTypeIds}
              onToggle={handleToggleExerciseType}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            className="flex-1 h-12"
            size="lg"
            disabled={name.trim() == ""}
          >
            Save
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1 h-12" size="lg">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
