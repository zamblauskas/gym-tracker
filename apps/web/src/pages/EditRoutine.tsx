import { useState, FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Routine } from '../types/routine'

interface EditRoutineProps {
  routine: Routine
  onSave: (id: string, name: string) => void
  onCancel: () => void
}

export default function EditRoutine({ routine, onSave, onCancel }: EditRoutineProps) {
  const [name, setName] = useState(routine.name)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onSave(routine.id, name.trim())
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Edit Routine</h1>
        <p className="text-[hsl(var(--color-muted-foreground))] mt-2">Update the routine name</p>
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

        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex-1 h-12" size="lg">
            Save Changes
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1 h-12" size="lg">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
