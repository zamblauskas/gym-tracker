import { useState, FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CreateProgramInput } from '../types/program'
import { Routine } from '../types/routine'
import RoutineSelector from '../components/RoutineSelector'

interface CreateProgramProps {
  routines: Routine[]
  onSave: (input: CreateProgramInput) => void
  onCancel: () => void
}

export default function CreateProgram({ routines, onSave, onCancel }: CreateProgramProps) {
  const [name, setName] = useState('')
  const [selectedRoutineIds, setSelectedRoutineIds] = useState<string[]>([])

  const handleToggleRoutine = (id: string) => {
    setSelectedRoutineIds(prev =>
      prev.includes(id)
        ? prev.filter(routineId => routineId !== id)
        : [...prev, id]
    )
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (name.trim() && selectedRoutineIds.length > 0) {
      const input: CreateProgramInput = {
        name: name.trim(),
        routineIds: selectedRoutineIds,
      }
      onSave(input)
      setName('')
      setSelectedRoutineIds([])
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Create Program</h1>
        <p className="text-[hsl(var(--color-muted-foreground))] mt-2">Add a new workout program</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Program Name</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., My Current Workout"
            required
            autoFocus
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label>Routines</Label>
          <p className="text-sm text-[hsl(var(--color-muted-foreground))] mb-3">
            Select routines to include in this program ({selectedRoutineIds.length} selected)
          </p>
          <div className="max-h-[400px] overflow-y-auto pr-2">
            <RoutineSelector
              routines={routines}
              selectedIds={selectedRoutineIds}
              onToggle={handleToggleRoutine}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            className="flex-1 h-12"
            size="lg"
            disabled={selectedRoutineIds.length === 0}
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
