import { useState, FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface CreateExerciseTypeProps {
  onSave: (name: string) => void
  onCancel: () => void
}

export default function CreateExerciseType({ onSave, onCancel }: CreateExerciseTypeProps) {
  const [name, setName] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onSave(name.trim())
      setName('')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Create Exercise Type</h1>
        <p className="text-[hsl(var(--color-muted-foreground))] mt-2">Add a new exercise type to your workout library</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
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
