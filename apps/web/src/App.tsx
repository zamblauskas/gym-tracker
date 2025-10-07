import { useAppState } from '@/contexts/AppStateContext'
import { useNavigationHandlers } from '@/hooks/useNavigationHandlers'
import { AppRouter } from '@/components/AppRouter'
import { DrawerManager } from '@/components/DrawerManager'
import { Toast } from '@/components/ui/toast'

function App() {
  const {
    // Entity data
    exerciseTypes,
    exercises,
    routines,
    programs,
    workoutSessions,
    isLoading,

    // Workout state
    activeSession,
    nextWorkoutInfo,

    // Entity handlers
    handleCreateExerciseType,
    handleEditExerciseType,
    handleDeleteExerciseType,
    handleCreateExercise,
    handleUpdateExercise,
    handleDeleteExercise,
    handleCreateRoutine,
    handleEditRoutine,
    handleAddExerciseTypeToRoutine,
    handleRemoveExerciseTypeFromRoutine,
    handleDeleteRoutine,
    handleCreateProgram,
    handleEditProgram,
    handleAddRoutineToProgram,
    handleRemoveRoutineFromProgram,
    handleDeleteProgram,

    // Workout handlers
    handleStartWorkout,
    handleSkipWorkout,
    handleUpdateWorkoutSession,
    handleFinishWorkout,
    handleCancelWorkout,
  } = useAppState()

  // All navigation logic encapsulated in custom hook
  const navHandlers = useNavigationHandlers({
    handleCreateExerciseType,
    handleEditExerciseType,
    handleCreateExercise,
    handleCreateRoutine,
    handleEditRoutine,
    handleCreateProgram,
    handleEditProgram,
    handleDeleteExercise,
    handleDeleteExerciseType,
    handleDeleteRoutine,
    handleDeleteProgram,
    handleStartWorkout,
    handleFinishWorkout,
    handleCancelWorkout,
  })

  return (
    <div className="min-h-screen">
      <AppRouter
        isLoading={isLoading}
        exerciseTypes={exerciseTypes}
        exercises={exercises}
        routines={routines}
        programs={programs}
        activeSession={activeSession}
        nextWorkoutInfo={nextWorkoutInfo}
        workoutSessions={workoutSessions}
        onSelectExerciseType={navHandlers.handleSelectExerciseType}
        onSelectExercise={navHandlers.handleSelectExercise}
        onSelectRoutine={navHandlers.handleSelectRoutine}
        onSelectProgram={navHandlers.handleSelectProgram}
        onSelectRoutineFromProgram={navHandlers.handleSelectRoutineFromProgram}
        onSelectExerciseTypeFromRoutine={navHandlers.handleSelectExerciseTypeFromRoutine}
        onDeleteExercise={navHandlers.handleDeleteExerciseWithNav}
        onDeleteExerciseType={navHandlers.handleDeleteExerciseTypeWithNav}
        onDeleteRoutine={navHandlers.handleDeleteRoutineWithNav}
        onDeleteProgram={navHandlers.handleDeleteProgramWithNav}
        onUpdateExercise={handleUpdateExercise}
        onRemoveExerciseTypeFromRoutine={handleRemoveExerciseTypeFromRoutine}
        onAddRoutineToProgram={handleAddRoutineToProgram}
        onRemoveRoutineFromProgram={handleRemoveRoutineFromProgram}
        onStartWorkout={navHandlers.handleStartWorkoutWithNav}
        onSkipWorkout={handleSkipWorkout}
        onUpdateWorkoutSession={handleUpdateWorkoutSession}
        onFinishWorkout={navHandlers.handleFinishWorkoutWithNav}
        onCancelWorkout={navHandlers.handleCancelWorkoutWithNav}
      />

      <DrawerManager
        exerciseTypes={exerciseTypes}
        routines={routines}
        programs={programs}
        onCreateExerciseType={navHandlers.handleCreateExerciseTypeWithNav}
        onEditExerciseType={navHandlers.handleEditExerciseTypeWithNav}
        onCreateExercise={navHandlers.handleCreateExerciseWithNav}
        onCreateRoutine={navHandlers.handleCreateRoutineWithNav}
        onEditRoutine={navHandlers.handleEditRoutineWithNav}
        onCreateProgram={navHandlers.handleCreateProgramWithNav}
        onEditProgram={navHandlers.handleEditProgramWithNav}
        onAddExerciseTypeToRoutine={handleAddExerciseTypeToRoutine}
      />

      <Toast />
    </div>
  )
}

export default App
