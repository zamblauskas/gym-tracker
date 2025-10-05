import { useState, useEffect } from 'react'
import { WorkoutSession, ExerciseLog, SetLog } from '@/types/workoutSession'
import { Routine } from '@/types/routine'
import { ExerciseType } from '@/types/exerciseType'
import { Exercise } from '@/types/exercise'
import { ActiveWorkoutHeader } from '@/components/workout/ActiveWorkoutHeader'
import { ExerciseCard } from '@/components/workout/ExerciseCard'
import { ExerciseSelectionDrawer } from '@/components/workout/ExerciseSelectionDrawer'
import { SetLoggerDrawer } from '@/components/workout/SetLoggerDrawer'
import { ExerciseNotes } from '@/components/workout/ExerciseNotes'
import { PreviousSessionHistory } from '@/components/workout/PreviousSessionHistory'
import { WorkoutActions } from '@/components/workout/WorkoutActions'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useExerciseHistory } from '@/hooks/useExerciseHistory'
import { useAutoSaveNotes } from '@/hooks/useAutoSaveNotes'
import { finishWorkoutSession } from '@/lib/workoutCalculations'

interface ActiveWorkoutProps {
  session: WorkoutSession
  routine: Routine
  exerciseTypes: ExerciseType[]
  exercises: Exercise[]
  previousSessions: WorkoutSession[]
  onUpdateSession: (session: WorkoutSession) => void
  onFinishWorkout: (finishedSession: WorkoutSession) => void
  onBack: () => void
}

export default function ActiveWorkout({
  session,
  routine,
  exerciseTypes,
  exercises,
  previousSessions,
  onUpdateSession,
  onFinishWorkout,
  onBack
}: ActiveWorkoutProps) {
  const [currentExerciseTypeIndex, setCurrentExerciseTypeIndex] = useState(0)
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [exerciseSelectionOpen, setExerciseSelectionOpen] = useState(false)
  const [setLoggerOpen, setSetLoggerOpen] = useState(false)
  const [currentNotes, setCurrentNotes] = useState('')
  const [exerciseSelections, setExerciseSelections] = useState<Record<number, string>>({})
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false)
  const [finishConfirmOpen, setFinishConfirmOpen] = useState(false)

  const currentExerciseType = exerciseTypes[currentExerciseTypeIndex]

  const availableExercises = exercises.filter(
    ex => ex.exerciseTypeId === currentExerciseType?.id
  )

  const currentExerciseLog = session.exerciseLogs.find(
    log => log.exerciseId === selectedExercise?.id
  )

  const previousExerciseData = useExerciseHistory({
    selectedExercise,
    previousSessions,
    currentSessionId: session.id
  })

  // Auto-save notes with debouncing
  useAutoSaveNotes({
    notes: currentNotes,
    onSave: handleUpdateNotes,
    enabled: !!selectedExercise,
    debounceMs: 500
  })

  // Restore exercise selection when navigating
  useEffect(() => {
    const savedExerciseId = exerciseSelections[currentExerciseTypeIndex]
    if (savedExerciseId) {
      const exercise = exercises.find(ex => ex.id === savedExerciseId)
      if (exercise) {
        setSelectedExercise(exercise)
        const existingLog = session.exerciseLogs.find(log => log.exerciseId === exercise.id)
        setCurrentNotes(existingLog?.notes || '')
      }
    } else {
      setSelectedExercise(null)
      setCurrentNotes('')
    }
  }, [currentExerciseTypeIndex, exercises, exerciseSelections, session.exerciseLogs])

  function handleSelectExercise(exercise: Exercise) {
    setSelectedExercise(exercise)
    setExerciseSelections({
      ...exerciseSelections,
      [currentExerciseTypeIndex]: exercise.id
    })
    const existingLog = session.exerciseLogs.find(log => log.exerciseId === exercise.id)
    setCurrentNotes(existingLog?.notes || '')
  }

  function handleAddSet(weight: number, reps: number, rir?: number) {
    if (!selectedExercise) return

    const newSet: SetLog = {
      id: crypto.randomUUID(),
      weight,
      reps,
      rir,
      createdAt: new Date()
    }

    let updatedSession: WorkoutSession

    if (currentExerciseLog) {
      updatedSession = {
        ...session,
        exerciseLogs: session.exerciseLogs.map(log =>
          log.exerciseId === selectedExercise.id
            ? { ...log, sets: [...log.sets, newSet] }
            : log
        ),
        updatedAt: new Date()
      }
    } else {
      const newExerciseLog: ExerciseLog = {
        id: crypto.randomUUID(),
        exerciseId: selectedExercise.id,
        exerciseTypeId: selectedExercise.exerciseTypeId,
        sets: [newSet],
        createdAt: new Date()
      }
      updatedSession = {
        ...session,
        exerciseLogs: [...session.exerciseLogs, newExerciseLog],
        updatedAt: new Date()
      }
    }

    onUpdateSession(updatedSession)
  }

  function handleRemoveSet(setId: string) {
    if (!selectedExercise || !currentExerciseLog) return

    const updatedSession: WorkoutSession = {
      ...session,
      exerciseLogs: session.exerciseLogs.map(log =>
        log.exerciseId === selectedExercise.id
          ? { ...log, sets: log.sets.filter(s => s.id !== setId) }
          : log
      ),
      updatedAt: new Date()
    }

    onUpdateSession(updatedSession)
  }

  function handleUpdateNotes() {
    if (!selectedExercise) return

    let updatedSession: WorkoutSession

    if (currentExerciseLog) {
      updatedSession = {
        ...session,
        exerciseLogs: session.exerciseLogs.map(log =>
          log.exerciseId === selectedExercise.id
            ? { ...log, notes: currentNotes || undefined }
            : log
        ),
        updatedAt: new Date()
      }
    } else if (currentNotes.trim()) {
      const newExerciseLog: ExerciseLog = {
        id: crypto.randomUUID(),
        exerciseId: selectedExercise.id,
        exerciseTypeId: selectedExercise.exerciseTypeId,
        sets: [],
        notes: currentNotes,
        createdAt: new Date()
      }
      updatedSession = {
        ...session,
        exerciseLogs: [...session.exerciseLogs, newExerciseLog],
        updatedAt: new Date()
      }
    } else {
      return
    }

    onUpdateSession(updatedSession)
  }

  function handlePreviousExerciseType() {
    if (currentExerciseTypeIndex > 0) {
      setCurrentExerciseTypeIndex(currentExerciseTypeIndex - 1)
      setSetLoggerOpen(false)
    }
  }

  function handleNextExerciseType() {
    if (currentExerciseTypeIndex < exerciseTypes.length - 1) {
      setCurrentExerciseTypeIndex(currentExerciseTypeIndex + 1)
      setSetLoggerOpen(false)
    }
  }

  function handleConfirmCancel() {
    onBack()
  }

  function handleConfirmFinish() {
    const finishedSession = finishWorkoutSession(session)
    onFinishWorkout(finishedSession)
  }

  if (!currentExerciseType) {
    return null
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-8">
      <ActiveWorkoutHeader
        routine={routine}
        currentIndex={currentExerciseTypeIndex}
        totalExercises={exerciseTypes.length}
        onPrevious={handlePreviousExerciseType}
        onNext={handleNextExerciseType}
      />

      <ExerciseCard
        exerciseType={currentExerciseType}
        selectedExercise={selectedExercise}
        currentExerciseLog={currentExerciseLog}
        onChooseExercise={() => setExerciseSelectionOpen(true)}
        onChangeExercise={() => {
          setSelectedExercise(null)
          setExerciseSelectionOpen(true)
        }}
        onAddSet={() => setSetLoggerOpen(true)}
        onRemoveSet={handleRemoveSet}
      />

      {selectedExercise && (
        <>
          <ExerciseNotes
            notes={currentNotes}
            onNotesChange={setCurrentNotes}
            onBlur={handleUpdateNotes}
          />

          {previousExerciseData && (
            <PreviousSessionHistory previousExerciseData={previousExerciseData} />
          )}
        </>
      )}

      <ExerciseSelectionDrawer
        open={exerciseSelectionOpen}
        onOpenChange={setExerciseSelectionOpen}
        exerciseType={currentExerciseType}
        availableExercises={availableExercises}
        onSelectExercise={handleSelectExercise}
      />

      {selectedExercise && (
        <SetLoggerDrawer
          open={setLoggerOpen}
          onOpenChange={setSetLoggerOpen}
          exercise={selectedExercise}
          onAddSet={handleAddSet}
        />
      )}

      <WorkoutActions
        isLastExercise={currentExerciseTypeIndex === exerciseTypes.length - 1}
        onCancelClick={() => setCancelConfirmOpen(true)}
        onFinishClick={() => setFinishConfirmOpen(true)}
      />

      <ConfirmDialog
        isOpen={cancelConfirmOpen}
        onOpenChange={setCancelConfirmOpen}
        title="Cancel Workout?"
        description="Are you sure you want to cancel this workout? All progress will be lost. This action cannot be undone."
        confirmText="Yes, Cancel Workout"
        cancelText="No, Continue"
        onConfirm={handleConfirmCancel}
        onCancel={() => {}}
        variant="destructive"
        showWarningIcon={true}
      />

      <ConfirmDialog
        isOpen={finishConfirmOpen}
        onOpenChange={setFinishConfirmOpen}
        title="Finish Workout?"
        description="Are you sure you want to complete this workout? Your progress will be saved."
        confirmText="Yes, Finish"
        cancelText="No, Continue"
        onConfirm={handleConfirmFinish}
        onCancel={() => {}}
        variant="default"
        showWarningIcon={false}
      />
    </div>
  )
}
