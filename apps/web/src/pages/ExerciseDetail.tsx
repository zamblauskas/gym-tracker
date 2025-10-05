import { useState, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, Trash2 } from 'lucide-react'
import { Exercise } from '../types/exercise'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

interface ExerciseDetailProps {
  exercise: Exercise
  onUpdate: (exercise: Exercise) => void
  onDelete: (exerciseId: string) => void
  onBack: () => void
}

export default function ExerciseDetail({ exercise, onUpdate, onDelete, onBack }: ExerciseDetailProps) {
  const [name, setName] = useState(exercise.name)
  const [machineBrand, setMachineBrand] = useState(exercise.machineBrand || '')
  const [targetRepRange, setTargetRepRange] = useState(exercise.targetRepRange)
  const [targetRepsInReserve, setTargetRepsInReserve] = useState(exercise.targetRepsInReserve?.toString() || '')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (name.trim() && targetRepRange.trim()) {
      const updatedExercise: Exercise = {
        ...exercise,
        name: name.trim(),
        machineBrand: machineBrand.trim() || undefined,
        targetRepRange: targetRepRange.trim(),
        targetRepsInReserve: targetRepsInReserve ? parseInt(targetRepsInReserve) : undefined,
        updatedAt: new Date(),
      }
      onUpdate(updatedExercise)
      onBack()
    }
  }

  const handleConfirmDelete = () => {
    onDelete(exercise.id)
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <button
          onClick={onBack}
          className="flex items-center text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-foreground))] transition-colors mb-4"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back
        </button>

        <h1 className="text-2xl font-bold">Edit Exercise</h1>
        <p className="text-[hsl(var(--color-muted-foreground))] text-sm mt-1">
          Update exercise details
        </p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
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
          <Button
            type="submit"
            className="flex-1 h-12"
            size="lg"
          >
            Save
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1 h-12"
            size="lg"
          >
            Cancel
          </Button>
        </div>
      </motion.form>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-8 pt-8 border-t border-[hsl(var(--color-border))]"
      >
        <Button
          onClick={() => setDeleteConfirmOpen(true)}
          variant="outline"
          size="lg"
          className="w-full h-12 border-[hsl(var(--color-destructive))] text-[hsl(var(--color-destructive))] hover:bg-[hsl(var(--color-destructive))] hover:text-[hsl(var(--color-destructive-foreground))]"
        >
          <Trash2 className="mr-2 h-5 w-5" />
          Delete Exercise
        </Button>
      </motion.div>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={`Delete ${exercise.name}?`}
        description="This action cannot be undone. This will permanently delete this exercise."
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => {}}
        variant="destructive"
      />
    </div>
  )
}
