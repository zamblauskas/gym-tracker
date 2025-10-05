import { motion } from 'framer-motion'
import { X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WorkoutActionsProps {
  isLastExercise: boolean
  onCancelClick: () => void
  onFinishClick: () => void
}

export function WorkoutActions({
  isLastExercise,
  onCancelClick,
  onFinishClick
}: WorkoutActionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="mt-8 pt-8 border-t border-[hsl(var(--color-border))] space-y-3"
    >
      {isLastExercise && (
        <Button
          onClick={onFinishClick}
          size="lg"
          className="w-full h-14 gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90"
        >
          <Check className="h-5 w-5" />
          Finish Workout
        </Button>
      )}

      <Button
        onClick={onCancelClick}
        variant="outline"
        size="lg"
        className="w-full h-12 border-[hsl(var(--color-destructive))] text-[hsl(var(--color-destructive))] hover:bg-[hsl(var(--color-destructive))] hover:text-[hsl(var(--color-destructive-foreground))]"
      >
        <X className="mr-2 h-5 w-5" />
        Cancel Workout
      </Button>
    </motion.div>
  )
}
