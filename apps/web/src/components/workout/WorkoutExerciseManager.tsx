import { Exercise } from '@/types/exercise'
import { ExerciseType } from '@/types/exerciseType'
import { ExerciseLog } from '@/types/workoutSession'
import { ExerciseCard } from '@/components/workout/ExerciseCard'
import { ExerciseSelectionDrawer } from '@/components/workout/ExerciseSelectionDrawer'
import { SetLoggerDrawer } from '@/components/workout/SetLoggerDrawer'
import { ExerciseNotes } from '@/components/workout/ExerciseNotes'
import { PreviousSessionHistory } from '@/components/workout/PreviousSessionHistory'
import { PreviousExerciseData } from '@/lib/exerciseHistory'

interface WorkoutExerciseManagerProps {
  exerciseType: ExerciseType
  availableExercises: Exercise[]
  selectedExercise: Exercise | null
  exerciseLog: ExerciseLog | undefined
  previousExerciseData: PreviousExerciseData | null
  currentNotes: string
  exerciseSelectionOpen: boolean
  setLoggerOpen: boolean
  onChooseExercise: () => void
  onChangeExercise: () => void
  onSelectExercise: (exercise: Exercise) => void
  onCloseExerciseSelection: () => void
  onOpenSetLogger: () => void
  onCloseSetLogger: () => void
  onAddSet: (weight: number, reps: number, rir?: number) => void
  onRemoveSet: (setId: string) => void
  onNotesChange: (notes: string) => void
  onNotesBlur: () => void
}

/**
 * Fully controlled component for managing exercise selection, logging, and notes
 * All state is managed by parent component (ActiveWorkout)
 */
export function WorkoutExerciseManager({
  exerciseType,
  availableExercises,
  selectedExercise,
  exerciseLog,
  previousExerciseData,
  currentNotes,
  exerciseSelectionOpen,
  setLoggerOpen,
  onChooseExercise,
  onChangeExercise,
  onSelectExercise,
  onCloseExerciseSelection,
  onOpenSetLogger,
  onCloseSetLogger,
  onAddSet,
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

      <ExerciseSelectionDrawer
        open={exerciseSelectionOpen}
        onOpenChange={onCloseExerciseSelection}
        exerciseType={exerciseType}
        availableExercises={availableExercises}
        onSelectExercise={onSelectExercise}
      />

      {selectedExercise && (
        <SetLoggerDrawer
          open={setLoggerOpen}
          onOpenChange={onCloseSetLogger}
          exercise={selectedExercise}
          onAddSet={onAddSet}
        />
      )}
    </>
  )
}
