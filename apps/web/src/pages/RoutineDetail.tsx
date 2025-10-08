import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Trash2, Edit, ChevronRight, Dumbbell } from 'lucide-react'
import { Routine } from '@/types/routine'
import { ExerciseType } from '@/types/exerciseType'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useState } from 'react'
import { Exercise } from '@/types/exercise'
import { useExercisesByType } from '@/hooks/useExercisesByType'
import { useDrawer } from '@/hooks/useDrawer'
import { DRAWER_MODE } from '@/lib/constants'

interface RoutineDetailProps {
  routine: Routine
  exerciseTypes: ExerciseType[]
  exercises: Exercise[]
  onRemoveExerciseType: (exerciseTypeId: string) => void
  onDelete: (routineId: string) => void
  onEdit: () => void
  onSelectExerciseType?: (exerciseType: ExerciseType) => void
}

export default function RoutineDetail({
  routine,
  exerciseTypes,
  exercises,
  onRemoveExerciseType,
  onDelete,
  onEdit,
  onSelectExerciseType
}: RoutineDetailProps) {
  const { openDrawer } = useDrawer()
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const handleOpenAddDrawer = () => {
    openDrawer(DRAWER_MODE.ADD_EXERCISE_TYPE_TO_ROUTINE, { routineId: routine.id })
  }

  const handleConfirmDelete = () => {
    onDelete(routine.id)
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{routine.name}</h1>
            <p className="text-[hsl(var(--color-muted-foreground))] text-sm mt-1">
              {exerciseTypes.length} exercise {exerciseTypes.length === 1 ? 'type' : 'types'}
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

        <Button onClick={handleOpenAddDrawer} size="lg" className="w-full h-12 gap-2">
          <Plus className="h-5 w-5" />
          Add Exercise Type
        </Button>
      </motion.div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {exerciseTypes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="p-12">
                <div className="text-center">
                  <p className="text-[hsl(var(--color-muted-foreground))]">
                    No exercise types yet. Click "Add" to add one.
                  </p>
                </div>
              </Card>
            </motion.div>
          ) : (
            exerciseTypes.map((exerciseType, index) => {
              const { count, names } = useExercisesByType(exercises, exerciseType.id)

              return <motion.div
                key={exerciseType.id}
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
                <Card className="p-4 hover:shadow-lg transition-all group relative overflow-hidden">
                  <div
                    className={`flex items-start justify-between mb-3 ${onSelectExerciseType ? 'cursor-pointer' : ''}`}
                    onClick={() => onSelectExerciseType?.(exerciseType)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-500 bg-opacity-10 flex items-center justify-center">
                          <Dumbbell className="h-4 w-4 text-current" />
                        </div>
                        <h3 className="text-lg font-medium">
                          {exerciseType.name}
                        </h3>
                      </div>
                      <p className="text-sm text-[hsl(var(--color-muted-foreground))] ml-10">
                        {count} {count === 1 ? 'exercise' : 'exercises'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {onSelectExerciseType && (
                        <ChevronRight className="h-5 w-5 text-[hsl(var(--color-muted-foreground))] group-hover:translate-x-1 transition-transform" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onRemoveExerciseType(exerciseType.id)
                        }}
                        className="p-2 hover:bg-[hsl(var(--color-destructive))] hover:bg-opacity-10 rounded-lg transition-colors group/remove"
                        aria-label="Remove exercise type"
                      >
                        <X className="h-5 w-5 text-[hsl(var(--color-muted-foreground))] group-hover/remove:text-[hsl(var(--color-destructive))]" />
                      </button>
                    </div>
                  </div>
                  {onSelectExerciseType && (
                    <div className="absolute inset-0 bg-purple-500 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none" />
                  )}
                  {names.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {names.map((exerciseName, idx) => (
                        <Badge key={idx} variant="secondary">
                          {exerciseName}
                        </Badge>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            })
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
          onClick={() => setDeleteConfirmOpen(true)}
          variant="outline"
          size="lg"
          className="w-full h-12 border-[hsl(var(--color-destructive))] text-[hsl(var(--color-destructive))] hover:bg-[hsl(var(--color-destructive))] hover:text-[hsl(var(--color-destructive-foreground))]"
        >
          <Trash2 className="mr-2 h-5 w-5" />
          Delete Routine
        </Button>
      </motion.div>

      {/* Exercise Type Selector Drawer is now handled by DrawerManager */}

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={`Delete ${routine.name}?`}
        description="This will remove the routine but keep all exercise types. This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => { }}
        variant="destructive"
      />
    </div>
  )
}
