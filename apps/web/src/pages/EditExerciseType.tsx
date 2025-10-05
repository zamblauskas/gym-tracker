import { useState, FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ExerciseType } from '../types/exerciseType'

interface EditExerciseTypeProps {
  exerciseType: ExerciseType
  onSave: (id: string, name: string) => void
  onCancel: () => void
}

export default function EditExerciseType({ exerciseType, onSave, onCancel }: EditExerciseTypeProps) {
  const [name, setName] = useState(exerciseType.name)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onSave(exerciseType.id, name.trim())
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Edit Exercise Type</h1>
        <p className="text-[hsl(var(--color-muted-foreground))] mt-2">Update the exercise type name</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Exercise Type Name</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Incline chest"
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
