import { useNavigate } from 'react-router-dom'
import { ExerciseType } from '@/types/exerciseType'
import { Exercise, CreateExerciseInput } from '@/types/exercise'
import { Routine, CreateRoutineInput } from '@/types/routine'
import { Program, CreateProgramInput } from '@/types/program'
import { WorkoutSession } from '@/types/workoutSession'
import { useAppState } from '@/contexts/AppStateContext'
import { AppRouter } from '@/components/AppRouter'
import { DrawerManager } from '@/components/DrawerManager'

function App() {
  const navigate = useNavigate()
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

  // Navigation handlers
  const handleSelectExerciseType = (exerciseType: ExerciseType) => {
    navigate(`/exercise-types/${exerciseType.id}`)
  }

  const handleSelectExercise = (exercise: Exercise, exerciseTypeId: string) => {
    navigate(`/exercise-types/${exerciseTypeId}/exercises/${exercise.id}`)
  }

  const handleSelectRoutine = (routine: Routine) => {
    navigate(`/routines/${routine.id}`)
  }

  const handleSelectProgram = (program: Program) => {
    navigate(`/programs/${program.id}`)
  }

  const handleSelectRoutineFromProgram = (programId: string, routine: Routine) => {
    navigate(`/programs/${programId}/routines/${routine.id}`)
  }

  const handleSelectExerciseTypeFromRoutine = (
    routineId: string,
    exerciseType: ExerciseType,
    programId?: string
  ) => {
    if (programId) {
      navigate(`/programs/${programId}/routines/${routineId}/exercise-types/${exerciseType.id}`)
    } else {
      navigate(`/routines/${routineId}/exercise-types/${exerciseType.id}`)
    }
  }

  // Wrapped handlers that navigate after entity operations
  const handleCreateExerciseTypeWithNav = (name: string) => {
    handleCreateExerciseType(name)
    navigate('/exercise-types')
  }

  const handleEditExerciseTypeWithNav = (id: string, name: string) => {
    if (handleEditExerciseType(id, name)) {
      navigate(-1)
    }
  }

  const handleCreateExerciseWithNav = (input: CreateExerciseInput) => {
    handleCreateExercise(input)
    navigate(-1)
  }

  const handleCreateRoutineWithNav = (input: CreateRoutineInput) => {
    handleCreateRoutine(input)
    navigate('/routines')
  }

  const handleEditRoutineWithNav = (id: string, name: string) => {
    if (handleEditRoutine(id, name)) {
      navigate(-1)
    }
  }

  const handleCreateProgramWithNav = (input: CreateProgramInput) => {
    handleCreateProgram(input)
    navigate('/programs')
  }

  const handleEditProgramWithNav = (id: string, name: string) => {
    if (handleEditProgram(id, name)) {
      navigate(-1)
    }
  }

  const handleDeleteExerciseWithNav = (exerciseId: string, exerciseTypeId: string) => {
    handleDeleteExercise(exerciseId)
    navigate(`/exercise-types/${exerciseTypeId}`)
  }

  const handleDeleteExerciseTypeWithNav = (exerciseTypeId: string) => {
    handleDeleteExerciseType(exerciseTypeId)
    navigate('/exercise-types')
  }

  const handleDeleteRoutineWithNav = (routineId: string) => {
    handleDeleteRoutine(routineId)
    navigate('/routines')
  }

  const handleDeleteProgramWithNav = (programId: string) => {
    handleDeleteProgram(programId)
    navigate('/programs')
  }

  const handleStartWorkoutWithNav = () => {
    handleStartWorkout()
    navigate('/workout/active')
  }

  const handleFinishWorkoutWithNav = (session: WorkoutSession) => {
    handleFinishWorkout(session)
    navigate('/')
  }

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
        onSelectExerciseType={handleSelectExerciseType}
        onSelectExercise={handleSelectExercise}
        onSelectRoutine={handleSelectRoutine}
        onSelectProgram={handleSelectProgram}
        onSelectRoutineFromProgram={handleSelectRoutineFromProgram}
        onSelectExerciseTypeFromRoutine={handleSelectExerciseTypeFromRoutine}
        onDeleteExercise={handleDeleteExerciseWithNav}
        onDeleteExerciseType={handleDeleteExerciseTypeWithNav}
        onDeleteRoutine={handleDeleteRoutineWithNav}
        onDeleteProgram={handleDeleteProgramWithNav}
        onUpdateExercise={handleUpdateExercise}
        onAddExerciseTypeToRoutine={handleAddExerciseTypeToRoutine}
        onRemoveExerciseTypeFromRoutine={handleRemoveExerciseTypeFromRoutine}
        onAddRoutineToProgram={handleAddRoutineToProgram}
        onRemoveRoutineFromProgram={handleRemoveRoutineFromProgram}
        onStartWorkout={handleStartWorkoutWithNav}
        onSkipWorkout={handleSkipWorkout}
        onUpdateWorkoutSession={handleUpdateWorkoutSession}
        onFinishWorkout={handleFinishWorkoutWithNav}
        onCancelWorkout={handleCancelWorkout}
      />

      <DrawerManager
        exerciseTypes={exerciseTypes}
        routines={routines}
        programs={programs}
        onCreateExerciseType={handleCreateExerciseTypeWithNav}
        onEditExerciseType={handleEditExerciseTypeWithNav}
        onCreateExercise={handleCreateExerciseWithNav}
        onCreateRoutine={handleCreateRoutineWithNav}
        onEditRoutine={handleEditRoutineWithNav}
        onCreateProgram={handleCreateProgramWithNav}
        onEditProgram={handleEditProgramWithNav}
      />
    </div>
  )
}

export default App
