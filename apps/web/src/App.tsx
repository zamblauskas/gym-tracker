import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ExerciseType } from './types/exerciseType'
import { Exercise } from './types/exercise'
import { Routine } from './types/routine'
import { Program } from './types/program'
import { WorkoutSession } from './types/workoutSession'
import { usePersistedState } from './hooks/usePersistedState'
import { useEntityHandlers } from './hooks/useEntityHandlers'
import { useWorkoutLogic } from './hooks/useWorkoutLogic'
import { AppRouter } from './components/AppRouter'
import { DrawerManager } from './components/DrawerManager'
import {
  createExerciseTypeRepository,
  createExerciseRepository,
  createRoutineRepository,
  createProgramRepository,
  createWorkoutSessionRepository,
} from './lib/repositories'

function App() {
  // Create repository instances (memoized to avoid recreating on every render)
  const exerciseTypeRepo = useMemo(() => createExerciseTypeRepository(), [])
  const exerciseRepo = useMemo(() => createExerciseRepository(), [])
  const routineRepo = useMemo(() => createRoutineRepository(), [])
  const programRepo = useMemo(() => createProgramRepository(), [])
  const workoutSessionRepo = useMemo(() => createWorkoutSessionRepository(), [])

  const navigate = useNavigate()

  // Use persisted state instead of regular useState
  const [exerciseTypes, setExerciseTypes, isLoadingExerciseTypes] = usePersistedState<ExerciseType>(exerciseTypeRepo)
  const [exercises, setExercises, isLoadingExercises] = usePersistedState<Exercise>(exerciseRepo)
  const [routines, setRoutines, isLoadingRoutines] = usePersistedState<Routine>(routineRepo)
  const [programs, setPrograms, isLoadingPrograms] = usePersistedState<Program>(programRepo)
  const [workoutSessions, setWorkoutSessions, isLoadingWorkoutSessions] = usePersistedState<WorkoutSession>(workoutSessionRepo)

  const isLoading = isLoadingExerciseTypes || isLoadingExercises || isLoadingRoutines || isLoadingPrograms || isLoadingWorkoutSessions

  // Entity handlers
  const entityHandlers = useEntityHandlers({
    exerciseTypes,
    exercises,
    routines,
    programs,
    setExerciseTypes,
    setExercises,
    setRoutines,
    setPrograms,
  })

  // Workout logic
  const workoutLogic = useWorkoutLogic({
    programs,
    routines,
    workoutSessions,
    setWorkoutSessions,
  })

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

  const handleSelectExerciseTypeFromRoutine = (routineId: string, exerciseType: ExerciseType, programId?: string) => {
    if (programId) {
      navigate(`/programs/${programId}/routines/${routineId}/exercise-types/${exerciseType.id}`)
    } else {
      navigate(`/routines/${routineId}/exercise-types/${exerciseType.id}`)
    }
  }

  // Wrapped handlers that navigate
  const handleCreateExerciseType = (name: string) => {
    entityHandlers.handleCreateExerciseType(name)
    navigate('/exercise-types')
  }

  const handleEditExerciseType = (id: string, name: string) => {
    if (entityHandlers.handleEditExerciseType(id, name)) {
      navigate(-1)
    }
  }

  const handleCreateExercise = (input: any) => {
    entityHandlers.handleCreateExercise(input)
    navigate(-1)
  }

  const handleCreateRoutine = (input: any) => {
    entityHandlers.handleCreateRoutine(input)
    navigate('/routines')
  }

  const handleEditRoutine = (id: string, name: string) => {
    if (entityHandlers.handleEditRoutine(id, name)) {
      navigate(-1)
    }
  }

  const handleCreateProgram = (input: any) => {
    entityHandlers.handleCreateProgram(input)
    navigate('/programs')
  }

  const handleEditProgram = (id: string, name: string) => {
    if (entityHandlers.handleEditProgram(id, name)) {
      navigate(-1)
    }
  }

  const handleDeleteExercise = (exerciseId: string, exerciseTypeId: string) => {
    entityHandlers.handleDeleteExercise(exerciseId)
    navigate(`/exercise-types/${exerciseTypeId}`)
  }

  const handleDeleteExerciseType = (exerciseTypeId: string) => {
    entityHandlers.handleDeleteExerciseType(exerciseTypeId)
    navigate('/exercise-types')
  }

  const handleDeleteRoutine = (routineId: string) => {
    entityHandlers.handleDeleteRoutine(routineId)
    navigate('/routines')
  }

  const handleDeleteProgram = (programId: string) => {
    entityHandlers.handleDeleteProgram(programId)
    navigate('/programs')
  }

  const handleStartWorkout = () => {
    workoutLogic.handleStartWorkout()
    navigate('/workout/active')
  }

  const handleFinishWorkout = (session: WorkoutSession) => {
    workoutLogic.handleFinishWorkout(session)
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
        activeSession={workoutLogic.activeSession}
        nextWorkoutInfo={workoutLogic.nextWorkoutInfo}
        workoutSessions={workoutSessions}
        onSelectExerciseType={handleSelectExerciseType}
        onSelectExercise={handleSelectExercise}
        onSelectRoutine={handleSelectRoutine}
        onSelectProgram={handleSelectProgram}
        onSelectRoutineFromProgram={handleSelectRoutineFromProgram}
        onSelectExerciseTypeFromRoutine={handleSelectExerciseTypeFromRoutine}
        onDeleteExercise={handleDeleteExercise}
        onDeleteExerciseType={handleDeleteExerciseType}
        onDeleteRoutine={handleDeleteRoutine}
        onDeleteProgram={handleDeleteProgram}
        onUpdateExercise={entityHandlers.handleUpdateExercise}
        onAddExerciseTypeToRoutine={entityHandlers.handleAddExerciseTypeToRoutine}
        onRemoveExerciseTypeFromRoutine={entityHandlers.handleRemoveExerciseTypeFromRoutine}
        onAddRoutineToProgram={entityHandlers.handleAddRoutineToProgram}
        onRemoveRoutineFromProgram={entityHandlers.handleRemoveRoutineFromProgram}
        onStartWorkout={handleStartWorkout}
        onSkipWorkout={workoutLogic.handleSkipWorkout}
        onUpdateWorkoutSession={workoutLogic.handleUpdateWorkoutSession}
        onFinishWorkout={handleFinishWorkout}
        onCancelWorkout={workoutLogic.handleCancelWorkout}
      />

      <DrawerManager
        exerciseTypes={exerciseTypes}
        routines={routines}
        programs={programs}
        onCreateExerciseType={handleCreateExerciseType}
        onEditExerciseType={handleEditExerciseType}
        onCreateExercise={handleCreateExercise}
        onCreateRoutine={handleCreateRoutine}
        onEditRoutine={handleEditRoutine}
        onCreateProgram={handleCreateProgram}
        onEditProgram={handleEditProgram}
      />
    </div>
  )
}

export default App
