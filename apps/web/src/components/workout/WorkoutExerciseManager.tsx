import { Exercise } from '@/types/exercise'
import { ExerciseType } from '@/types/exerciseType'
import { ExerciseLog } from '@/types/workoutSession'
import { ExerciseCard } from '@/components/workout/ExerciseCard'
import { ExerciseNotes } from '@/components/workout/ExerciseNotes'
import { PreviousSessionHistory } from '@/components/workout/PreviousSessionHistory'
import { PreviousExerciseData } from '@/lib/exerciseHistory'

interface WorkoutExerciseManagerProps {
  exerciseType: ExerciseType
  selectedExercise: Exercise | null
  exerciseLog: ExerciseLog | undefined
  previousExerciseData: PreviousExerciseData | null
  currentNotes: string
  onChooseExercise: () => void
  onChangeExercise: () => void
  onOpenSetLogger: () => void
  onRemoveSet: (setId: string) => void
  onNotesChange: (notes: string) => void
  onNotesBlur: () => void
}

/**
 * Fully controlled component for managing exercise selection, logging, and notes
 * All state is managed by parent component (ActiveWorkout)
 * Drawers are now managed by global DrawerManager
 */
export function WorkoutExerciseManager({
  exerciseType,
  selectedExercise,
  exerciseLog,
  previousExerciseData,
  currentNotes,
  onChooseExercise,
  onChangeExercise,
  onOpenSetLogger,
  onRemoveSet,
  onNotesChange,
  onNotesBlur,
}: WorkoutExerciseManagerProps) {

  return (
    <>
      <ExerciseCard
        exerciseType={exerciseType}
        selectedExercise={selectedExercise}
        currentExerciseLog={exerciseLog}
        onChooseExercise={onChooseExercise}
        onChangeExercise={onChangeExercise}
        onAddSet={onOpenSetLogger}
        onRemoveSet={onRemoveSet}
      />

      {selectedExercise && (
        <>
          <ExerciseNotes
            notes={currentNotes}
            onNotesChange={onNotesChange}
            onBlur={onNotesBlur}
          />

          {previousExerciseData && (
            <PreviousSessionHistory previousExerciseData={previousExerciseData} />
          )}
        </>
      )}
    </>
  )
}
