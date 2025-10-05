import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { PreviousExerciseData, formatSessionDate } from '@/lib/exerciseHistory'

interface PreviousSessionHistoryProps {
  previousExerciseData: PreviousExerciseData
}

export function PreviousSessionHistory({ previousExerciseData }: PreviousSessionHistoryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="p-4 bg-[hsl(var(--color-muted))] bg-opacity-20">
        <h3 className="text-sm font-medium mb-3 text-[hsl(var(--color-muted-foreground))]">
          Last time you did this ({formatSessionDate(previousExerciseData.sessionDate)})
        </h3>
        <div className="space-y-1">
          {previousExerciseData.log.sets.map((set, index) => (
            <p key={index} className="text-sm">
              Set {index + 1}: {set.weight}kg × {set.reps} reps
              {set.rir !== undefined && ` @ ${set.rir} RIR`}
            </p>
          ))}
          {previousExerciseData.log.notes && (
            <div className="mt-3 pt-3 border-t border-[hsl(var(--color-border))]">
              <p className="text-sm font-medium text-[hsl(var(--color-muted-foreground))] mb-1">
                Previous Note:
              </p>
              <p className="text-sm italic bg-yellow-500/10 p-2 rounded">
                "{previousExerciseData.log.notes}"
              </p>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}
