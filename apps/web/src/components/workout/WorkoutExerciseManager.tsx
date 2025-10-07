import { useState, useEffect } from 'react'
import { Exercise } from '@/types/exercise'
import { ExerciseType } from '@/types/exerciseType'
import { ExerciseLog } from '@/types/workoutSession'
import { ExerciseCard } from '@/components/workout/ExerciseCard'
import { ExerciseSelectionDrawer } from '@/components/workout/ExerciseSelectionDrawer'
import { SetLoggerDrawer } from '@/components/workout/SetLoggerDrawer'
import { ExerciseNotes } from '@/components/workout/ExerciseNotes'
import { PreviousSessionHistory } from '@/components/workout/PreviousSessionHistory'
import { useAutoSaveNotes } from '@/hooks/useAutoSaveNotes'
import { NOTES_AUTOSAVE_DEBOUNCE_MS } from '@/lib/constants'
import { PreviousExerciseData } from '@/lib/exerciseHistory'

interface WorkoutExerciseManagerProps {
  exerciseType: ExerciseType
  availableExercises: Exercise[]
  exerciseLog: ExerciseLog | undefined
  previousExerciseData: PreviousExerciseData | null
  exerciseSelections: Record<number, string>
  currentExerciseTypeIndex: number
  onSelectExercise: (exercise: Exercise) => void
  onAddSet: (weight: number, reps: number, rir?: number) => void
  onRemoveSet: (setId: string) => void
  onUpdateNotes: (notes: string) => void
}

/**
 * Manages the exercise selection, logging, and notes for a single exercise type
 * Extracted from ActiveWorkout to reduce component complexity
 */
export function WorkoutExerciseManager({
  exerciseType,
  availableExercises,
  exerciseLog,
  previousExerciseData,
  exerciseSelections,
  currentExerciseTypeIndex,
  onSelectExercise,
  onAddSet,
  onRemoveSet,
  onUpdateNotes,
}: WorkoutExerciseManagerProps) {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [exerciseSelectionOpen, setExerciseSelectionOpen] = useState(false)
  const [setLoggerOpen, setSetLoggerOpen] = useState(false)
  const [currentNotes, setCurrentNotes] = useState('')

  // Auto-save notes with debouncing
  useAutoSaveNotes({
    notes: currentNotes,
    onSave: () => onUpdateNotes(currentNotes),
    enabled: !!selectedExercise,
    debounceMs: NOTES_AUTOSAVE_DEBOUNCE_MS
  })

  // Restore exercise selection when navigating
  useEffect(() => {
    const savedExerciseId = exerciseSelections[currentExerciseTypeIndex]
    if (savedExerciseId) {
      const exercise = availableExercises.find(ex => ex.id === savedExerciseId)
      if (exercise) {
        setSelectedExercise(exercise)
        setCurrentNotes(exerciseLog?.notes || '')
      }
    } else {
      setSelectedExercise(null)
      setCurrentNotes('')
    }
  }, [currentExerciseTypeIndex, availableExercises, exerciseSelections, exerciseLog])

  function handleSelectExercise(exercise: Exercise) {
    setSelectedExercise(exercise)
    onSelectExercise(exercise)
    setCurrentNotes(exerciseLog?.notes || '')
  }

  function handleNotesChange(notes: string) {
    setCurrentNotes(notes)
  }

  function handleNotesBlur() {
    onUpdateNotes(currentNotes)
  }

  return (
    <>
      <ExerciseCard
        exerciseType={exerciseType}
        selectedExercise={selectedExercise}
        currentExerciseLog={exerciseLog}
        onChooseExercise={() => setExerciseSelectionOpen(true)}
        onChangeExercise={() => {
          setSelectedExercise(null)
          setExerciseSelectionOpen(true)
        }}
        onAddSet={() => setSetLoggerOpen(true)}
        onRemoveSet={onRemoveSet}
      />

      {selectedExercise && (
        <>
          <ExerciseNotes
            notes={currentNotes}
            onNotesChange={handleNotesChange}
            onBlur={handleNotesBlur}
          />

          {previousExerciseData && (
            <PreviousSessionHistory previousExerciseData={previousExerciseData} />
          )}
        </>
      )}

      <ExerciseSelectionDrawer
        open={exerciseSelectionOpen}
        onOpenChange={setExerciseSelectionOpen}
        exerciseType={exerciseType}
        availableExercises={availableExercises}
        onSelectExercise={handleSelectExercise}
      />

      {selectedExercise && (
        <SetLoggerDrawer
          open={setLoggerOpen}
          onOpenChange={setSetLoggerOpen}
          exercise={selectedExercise}
          onAddSet={onAddSet}
        />
      )}
    </>
  )
}
