import { PersonStanding, Plus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Exercise } from '@/types/exercise'
import { ExerciseType } from '@/types/exerciseType'
import { ExerciseLog } from '@/types/workoutSession'

interface ExerciseCardProps {
  exerciseType: ExerciseType
  selectedExercise: Exercise | null
  currentExerciseLog: ExerciseLog | undefined
  onChooseExercise: () => void
  onChangeExercise: () => void
  onAddSet: () => void
  onRemoveSet: (setId: string) => void
}

export function ExerciseCard({
  exerciseType,
  selectedExercise,
  currentExerciseLog,
  onChooseExercise,
  onChangeExercise,
  onAddSet,
  onRemoveSet
}: ExerciseCardProps) {
  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-purple-500 bg-opacity-10 flex items-center justify-center">
          <PersonStanding className="h-6 w-6 text-lg" />
        </div>
        <div>
          <h2 className="text-xl font-bold">{exerciseType.name}</h2>
          {selectedExercise ? (
            <p className="text-sm text-[hsl(var(--color-muted-foreground))]">
              {selectedExercise.name}
              {selectedExercise.machineBrand && ` (${selectedExercise.machineBrand})`}
            </p>
          ) : (
            <p className="text-sm text-[hsl(var(--color-muted-foreground))]">
              Select an exercise
            </p>
          )}
        </div>
      </div>

      {!selectedExercise ? (
        <Button
          onClick={onChooseExercise}
          size="lg"
          className="w-full h-12"
        >
          Choose Exercise
        </Button>
      ) : (
        <div className="space-y-3">
          {currentExerciseLog && currentExerciseLog.sets.length > 0 && (
            <div className="space-y-2">
              {currentExerciseLog.sets.map((set, index) => (
                <div
                  key={set.id}
                  className="flex items-center justify-between p-3 bg-[hsl(var(--color-muted))] bg-opacity-30 rounded-lg"
                >
                  <span className="text-sm font-medium">Set {index + 1}</span>
                  <span className="font-medium">
                    {set.weight}kg × {set.reps} reps
                    {set.rir !== undefined && ` @ ${set.rir} RIR`}
                  </span>
                  <button
                    onClick={() => onRemoveSet(set.id)}
                    className="text-[hsl(var(--color-destructive))] hover:opacity-70 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <Button
            onClick={onAddSet}
            size="lg"
            className="w-full h-12 gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Set
          </Button>

          <Button
            onClick={onChangeExercise}
            variant="outline"
            className="w-full"
          >
            Change Exercise
          </Button>
        </div>
      )}
    </Card>
  )
}
