import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Routine } from '@/types/routine'

interface ActiveWorkoutHeaderProps {
  routine: Routine
  currentIndex: number
  totalExercises: number
  onPrevious: () => void
  onNext: () => void
}

export function ActiveWorkoutHeader({
  routine,
  currentIndex,
  totalExercises,
  onPrevious,
  onNext
}: ActiveWorkoutHeaderProps) {
  const progressPercentage = ((currentIndex + 1) / totalExercises) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-1">{routine.name}</h1>
        <p className="text-[hsl(var(--color-muted-foreground))] text-sm">
          Exercise {currentIndex + 1} of {totalExercises}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-[hsl(var(--color-muted))] rounded-full overflow-hidden mb-6">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Exercise Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          onClick={onPrevious}
          variant="outline"
          size="sm"
          disabled={currentIndex === 0}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <span className="text-sm font-medium text-[hsl(var(--color-muted-foreground))]">
          Exercise {currentIndex + 1} of {totalExercises}
        </span>
        <Button
          onClick={onNext}
          variant="outline"
          size="sm"
          disabled={currentIndex === totalExercises - 1}
          className="gap-1"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  )
}
