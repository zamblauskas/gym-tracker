import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Dumbbell, Trash2, Edit, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { ExerciseType } from '../types/exerciseType'
import { Exercise } from '../types/exercise'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Breadcrumb, { BreadcrumbItem } from '@/components/Breadcrumb'

interface ExerciseListProps {
  exerciseType: ExerciseType
  exercises: Exercise[]
  onAdd: () => void
  onSelect: (exercise: Exercise) => void
  onDelete: (exerciseId: string) => void
  onDeleteExerciseType: (exerciseTypeId: string) => void
  onEdit: () => void
  breadcrumbs?: BreadcrumbItem[]
}

export default function ExerciseList({ exerciseType, exercises, onAdd, onSelect, onDeleteExerciseType, onEdit, breadcrumbs = [] }: ExerciseListProps) {
  const [deleteTypeConfirmOpen, setDeleteTypeConfirmOpen] = useState(false)

  const handleConfirmDeleteType = () => {
    onDeleteExerciseType(exerciseType.id)
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        {breadcrumbs.length > 0 && <Breadcrumb items={breadcrumbs} />}

        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{exerciseType.name}</h1>
            <p className="text-[hsl(var(--color-muted-foreground))] text-sm mt-1">
              {exercises.length} {exercises.length === 1 ? 'exercise' : 'exercises'}
            </p>
          </div>
          <Button
            onClick={onEdit}
            variant="ghost"
            size="sm"
            className="h-9 gap-2 text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-foreground))]"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        </div>

        <Button onClick={onAdd} size="lg" className="w-full h-12 gap-2">
          <Plus className="h-5 w-5" />
          Add Exercise
        </Button>
      </motion.div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {exercises.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="p-12">
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-[hsl(var(--color-muted))] flex items-center justify-center mb-4">
                    <Dumbbell className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-[hsl(var(--color-muted-foreground))]">
                    No exercises yet. Click "Add" to create one.
                  </p>
                </div>
              </Card>
            </motion.div>
          ) : (
            exercises.map((exercise, index) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 300,
                  damping: 24
                }}
                layout
              >
                <Card
                  className="p-4 hover:shadow-lg transition-all group relative overflow-hidden cursor-pointer"
                  onClick={() => onSelect(exercise)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-violet-500 bg-opacity-10 flex items-center justify-center">
                          <Dumbbell className="h-4 w-4 text-current" />
                        </div>
                        <h3 className="text-lg font-medium">
                          {exercise.name}
                        </h3>
                      </div>
                      {exercise.machineBrand && (
                        <p className="text-sm text-[hsl(var(--color-muted-foreground))] ml-10">
                          {exercise.machineBrand}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-[hsl(var(--color-muted-foreground))] group-hover:translate-x-1 transition-transform flex-shrink-0" />
                  </div>
                  <div className="absolute inset-0 bg-violet-500 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none" />
                  <div className="flex gap-2">
                    <Badge variant="secondary">
                      {exercise.targetRepRange} reps
                    </Badge>
                    {exercise.targetRepsInReserve !== undefined && (
                      <Badge variant="outline">
                        RIR {exercise.targetRepsInReserve}
                      </Badge>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-8 pt-8 border-t border-[hsl(var(--color-border))]"
      >
        <Button
          onClick={() => setDeleteTypeConfirmOpen(true)}
          variant="outline"
          size="lg"
          className="w-full h-12 border-[hsl(var(--color-destructive))] text-[hsl(var(--color-destructive))] hover:bg-[hsl(var(--color-destructive))] hover:text-[hsl(var(--color-destructive-foreground))]"
        >
          <Trash2 className="mr-2 h-5 w-5" />
          Delete Exercise Type
        </Button>
      </motion.div>

      <ConfirmDialog
        isOpen={deleteTypeConfirmOpen}
        onOpenChange={setDeleteTypeConfirmOpen}
        title={`Delete ${exerciseType.name}?`}
        description={
          exercises.length > 0
            ? `This will permanently delete the exercise type and all ${exercises.length} associated ${exercises.length === 1 ? 'exercise' : 'exercises'}. This action cannot be undone.`
            : "This action cannot be undone. This will permanently delete this exercise type."
        }
        confirmText="Delete"
        onConfirm={handleConfirmDeleteType}
        onCancel={() => { }}
        variant="destructive"
        showWarningIcon={exercises.length > 0}
      />
    </div>
  )
}
