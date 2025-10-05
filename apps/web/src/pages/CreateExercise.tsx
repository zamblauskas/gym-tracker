import { useState, FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CreateExerciseInput } from '../types/exercise'

interface CreateExerciseProps {
  exerciseTypeId: string
  onSave: (input: CreateExerciseInput) => void
  onCancel: () => void
}

export default function CreateExercise({ exerciseTypeId, onSave, onCancel }: CreateExerciseProps) {
  const [name, setName] = useState('')
  const [machineBrand, setMachineBrand] = useState('')
  const [targetRepRange, setTargetRepRange] = useState('')
  const [targetRepsInReserve, setTargetRepsInReserve] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (name.trim() && targetRepRange.trim()) {
      const input: CreateExerciseInput = {
        name: name.trim(),
        machineBrand: machineBrand.trim() || undefined,
        targetRepRange: targetRepRange.trim(),
        targetRepsInReserve: targetRepsInReserve ? parseInt(targetRepsInReserve) : undefined,
        exerciseTypeId,
      }
      onSave(input)
      setName('')
      setMachineBrand('')
      setTargetRepRange('')
      setTargetRepsInReserve('')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Create Exercise</h1>
        <p className="text-[hsl(var(--color-muted-foreground))] mt-2">Add a new exercise with target parameters</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Exercise Name</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Incline Chest Press Machine"
            required
            autoFocus
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="machineBrand">Machine Brand (Optional)</Label>
          <Input
            id="machineBrand"
            type="text"
            value={machineBrand}
            onChange={(e) => setMachineBrand(e.target.value)}
            placeholder="e.g., Insosportus"
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetRepRange">Target Rep Range</Label>
          <Input
            id="targetRepRange"
            type="text"
            value={targetRepRange}
            onChange={(e) => setTargetRepRange(e.target.value)}
            placeholder="e.g., 8-12"
            required
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetRepsInReserve">Target Reps in Reserve (RIR) - Optional</Label>
          <Input
            id="targetRepsInReserve"
            type="number"
            min="0"
            max="10"
            value={targetRepsInReserve}
            onChange={(e) => setTargetRepsInReserve(e.target.value)}
            placeholder="e.g., 2"
            className="h-12"
          />
          <p className="text-xs text-[hsl(var(--color-muted-foreground))]">
            How many reps you should keep in reserve (0-10)
          </p>
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
