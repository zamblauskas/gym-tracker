import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDrawer } from '@/hooks/useDrawer'
import { useWorkoutDrawer } from '@/contexts/WorkoutDrawerContext'
import { WorkoutSession, ExerciseLog, SetLog } from '@/types/workoutSession'
import { Routine } from '@/types/routine'
import { ExerciseType } from '@/types/exerciseType'
import { Exercise } from '@/types/exercise'
import { ActiveWorkoutHeader } from '@/components/workout/ActiveWorkoutHeader'
import { WorkoutExerciseManager } from '@/components/workout/WorkoutExerciseManager'
import { WorkoutActions } from '@/components/workout/WorkoutActions'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useExerciseHistory } from '@/hooks/useExerciseHistory'
import { finishWorkoutSession } from '@/lib/workoutCalculations'
import { DRAWER_MODE } from '@/lib/constants'

interface ActiveWorkoutProps {
  session: WorkoutSession
  routine: Routine
  exerciseTypes: ExerciseType[]
  exercises: Exercise[]
  previousSessions: WorkoutSession[]
  onUpdateSession: (session: WorkoutSession) => void
  onFinishWorkout: (finishedSession: WorkoutSession) => void
  onBack: () => void
  currentExerciseIndex: number
}

export default function ActiveWorkout({
  session,
  routine,
  exerciseTypes,
  exercises,
  previousSessions,
  onUpdateSession,
  onFinishWorkout,
  onBack,
  currentExerciseIndex
}: ActiveWorkoutProps) {
  const navigate = useNavigate()
  const { openDrawer, closeDrawer } = useDrawer()
  const { setWorkoutDrawerHandlers } = useWorkoutDrawer()
  const [currentNotes, setCurrentNotes] = useState('')
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false)
  const [finishConfirmOpen, setFinishConfirmOpen] = useState(false)

  // Get exercise selections from session (single source of truth)
  const exerciseSelections = session.exerciseSelections || {}

  const currentExerciseType = exerciseTypes[currentExerciseIndex]

  const selectedExerciseId = exerciseSelections[currentExerciseIndex]
  const selectedExercise = selectedExerciseId
    ? exercises.find(ex => ex.id === selectedExerciseId)
    : undefined

  const currentExerciseLog = selectedExercise
    ? session.exerciseLogs.find(log => log.exerciseId === selectedExercise.id)
    : undefined

  const previousExerciseData = useExerciseHistory({
    selectedExercise: selectedExercise || null,
    previousSessions,
    currentSessionId: session.id
  })

  // Sync notes when navigating between exercise types
  useEffect(() => {
    if (selectedExercise && currentExerciseLog) {
      setCurrentNotes(currentExerciseLog.notes || '')
    } else {
      setCurrentNotes('')
    }
  }, [currentExerciseIndex, selectedExercise?.id, currentExerciseLog?.notes])

  // Register workout drawer handlers with context on mount, cleanup on unmount
  useEffect(() => {
    setWorkoutDrawerHandlers({
      onAddSet: handleAddSet,
      onSelectExercise: handleSelectExercise,
    })
    return () => {
      setWorkoutDrawerHandlers(null)
    }
  }, [session, selectedExercise, currentExerciseLog])

  function handleSelectExercise(exercise: Exercise) {
    // Update session with new exercise selection
    const updatedSession: WorkoutSession = {
      ...session,
      exerciseSelections: {
        ...exerciseSelections,
        [currentExerciseIndex]: exercise.id
      },
      updatedAt: new Date()
    }
    onUpdateSession(updatedSession)

    // Load notes for the selected exercise
    const exerciseLog = session.exerciseLogs.find(log => log.exerciseId === exercise.id)
    setCurrentNotes(exerciseLog?.notes || '')
    closeDrawer()
  }

  function handleChooseExercise() {
    openExerciseSelectionDrawer()
  }

  function handleChangeExercise() {
    openExerciseSelectionDrawer()
  }

  function handleOpenSetLogger() {
    openSetLoggerDrawer()
  }

  // Drawer navigation helpers
  function openExerciseSelectionDrawer() {
    if (!currentExerciseType) return
    openDrawer(DRAWER_MODE.EXERCISE_SELECTION, { exerciseTypeId: currentExerciseType.id })
  }

  function openSetLoggerDrawer() {
    if (!selectedExercise) return
    openDrawer(DRAWER_MODE.SET_LOGGER, { exerciseId: selectedExercise.id })
  }

  function handleNotesChange(notes: string) {
    setCurrentNotes(notes)
  }

  function handleNotesBlur() {
    handleUpdateNotes(currentNotes)
  }

  function handleAddSet(weight: number, reps: number, rir?: number) {
    if (!selectedExercise) {
      console.error('handleAddSet called but no selectedExercise')
      return
    }

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

    // Update session and close drawer
    onUpdateSession(updatedSession)
    closeDrawer()
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

  function handleUpdateNotes(notes: string) {
    if (!selectedExercise) return

    let updatedSession: WorkoutSession

    if (currentExerciseLog) {
      updatedSession = {
        ...session,
        exerciseLogs: session.exerciseLogs.map(log =>
          log.exerciseId === selectedExercise.id
            ? { ...log, notes: notes || undefined }
            : log
        ),
        updatedAt: new Date()
      }
    } else if (notes.trim()) {
      const newExerciseLog: ExerciseLog = {
        id: crypto.randomUUID(),
        exerciseId: selectedExercise.id,
        exerciseTypeId: selectedExercise.exerciseTypeId,
        sets: [],
        notes: notes,
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
    if (currentExerciseIndex > 0) {
      navigate(`/workout/active/${currentExerciseIndex - 1}`)
    }
  }

  function handleNextExerciseType() {
    if (currentExerciseIndex < exerciseTypes.length - 1) {
      navigate(`/workout/active/${currentExerciseIndex + 1}`)
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
        currentIndex={currentExerciseIndex}
        totalExercises={exerciseTypes.length}
        onPrevious={handlePreviousExerciseType}
        onNext={handleNextExerciseType}
      />

      <WorkoutExerciseManager
        exerciseType={currentExerciseType}
        selectedExercise={selectedExercise || null}
        exerciseLog={currentExerciseLog}
        previousExerciseData={previousExerciseData}
        currentNotes={currentNotes}
        onChooseExercise={handleChooseExercise}
        onChangeExercise={handleChangeExercise}
        onOpenSetLogger={handleOpenSetLogger}
        onRemoveSet={handleRemoveSet}
        onNotesChange={handleNotesChange}
        onNotesBlur={handleNotesBlur}
      />

      <WorkoutActions
        isLastExercise={currentExerciseIndex === exerciseTypes.length - 1}
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
