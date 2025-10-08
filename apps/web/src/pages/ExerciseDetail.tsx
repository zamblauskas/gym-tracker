import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Exercise, CreateExerciseInput } from '@/types/exercise'
import { Button } from '@/components/ui/button'
import { ExerciseForm } from '@/components/ExerciseForm'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Breadcrumb, { BreadcrumbItem } from '@/components/Breadcrumb'

interface ExerciseDetailProps {
  exercise: Exercise
  onUpdate: (exercise: Exercise) => void
  onDelete: (exerciseId: string) => void
  breadcrumbs?: BreadcrumbItem[]
}

export default function ExerciseDetail({ exercise, onUpdate, onDelete, breadcrumbs = [] }: ExerciseDetailProps) {
  const navigate = useNavigate()
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const handleSubmit = (input: CreateExerciseInput) => {
    const updatedExercise: Exercise = {
      ...exercise,
      name: input.name,
      machineBrand: input.machineBrand,
      targetRepRange: input.targetRepRange,
      targetRepsInReserve: input.targetRepsInReserve,
      updatedAt: new Date(),
    }
    onUpdate(updatedExercise)
    // Navigate back to exercise type detail page
    navigate(`/exercise-types/${exercise.exerciseTypeId}`)
  }

  const handleConfirmDelete = () => {
    onDelete(exercise.id)
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-8">
      {breadcrumbs.length > 0 && <Breadcrumb items={breadcrumbs} />}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <ExerciseForm
          mode="edit"
          exerciseTypeId={exercise.exerciseTypeId}
          initialValues={exercise}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/exercise-types/${exercise.exerciseTypeId}`)}
        />
      </motion.div>

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
