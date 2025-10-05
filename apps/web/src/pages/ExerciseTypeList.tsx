import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ChevronRight, ChevronLeft, PersonStanding } from 'lucide-react'
import { ExerciseType } from '../types/exerciseType'
import { Exercise } from '../types/exercise'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ExerciseTypeListProps {
  exerciseTypes: ExerciseType[]
  exercises: Exercise[]
  onAdd: () => void
  onSelect: (exerciseType: ExerciseType) => void
  onBack: () => void
}

export default function ExerciseTypeList({ exerciseTypes, exercises, onAdd, onSelect, onBack }: ExerciseTypeListProps) {
  const getExerciseNames = (exerciseTypeId: string) => {
    return exercises
      .filter(ex => ex.exerciseTypeId === exerciseTypeId)
      .map(ex => ex.name)
      .slice(0, 3) // Show first 3
  }

  const getExerciseCount = (exerciseTypeId: string) => {
    return exercises.filter(ex => ex.exerciseTypeId === exerciseTypeId).length
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

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Exercise Types</h1>
            <p className="text-[hsl(var(--color-muted-foreground))] text-sm mt-1">
              {exerciseTypes.length} {exerciseTypes.length === 1 ? 'type' : 'types'}
            </p>
          </div>
          <Button onClick={onAdd} size="lg" className="h-12">
            <Plus className="mr-2 h-5 w-5" />
            Add
          </Button>
        </div>
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
                  <div className="mx-auto w-12 h-12 rounded-full bg-[hsl(var(--color-muted))] flex items-center justify-center mb-4">
                    <PersonStanding className="h-6 w-6 text-[hsl(var(--color-muted-foreground))]" />
                  </div>
                  <p className="text-[hsl(var(--color-muted-foreground))]">
                    No exercise types yet. Click "Add" to create one.
                  </p>
                </div>
              </Card>
            </motion.div>
          ) : (
            exerciseTypes.map((exerciseType, index) => {
              const exerciseNames = getExerciseNames(exerciseType.id)
              const exerciseCount = getExerciseCount(exerciseType.id)
              const hasMore = exerciseCount > 3

              return (
                <motion.div
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
                  <Card
                    className="p-4 hover:shadow-lg transition-all group relative overflow-hidden cursor-pointer"
                    onClick={() => onSelect(exerciseType)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-purple-500 bg-opacity-10 flex items-center justify-center">
                            <PersonStanding className="h-4 w-4 text-current" />
                          </div>
                          <h3 className="text-lg font-medium">
                            {exerciseType.name}
                          </h3>
                        </div>
                        <p className="text-sm text-[hsl(var(--color-muted-foreground))] ml-10">
                          {exerciseCount} {exerciseCount === 1 ? 'exercise' : 'exercises'}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-[hsl(var(--color-muted-foreground))] group-hover:translate-x-1 transition-transform flex-shrink-0" />
                    </div>
                    <div className="absolute inset-0 bg-purple-500 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none" />
                    {exerciseNames.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {exerciseNames.map((name, idx) => (
                          <Badge key={idx} variant="secondary">
                            {name}
                          </Badge>
                        ))}
                        {hasMore && (
                          <Badge variant="outline">
                            +{exerciseCount - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </Card>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
