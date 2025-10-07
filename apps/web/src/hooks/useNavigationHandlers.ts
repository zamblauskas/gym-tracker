import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ExerciseType } from '@/types/exerciseType'
import { Exercise, CreateExerciseInput } from '@/types/exercise'
import { Routine, CreateRoutineInput } from '@/types/routine'
import { Program, CreateProgramInput } from '@/types/program'
import { WorkoutSession } from '@/types/workoutSession'

/**
 * Custom hook that encapsulates all navigation logic
 * Reduces prop drilling by handling navigation state internally
 */
export function useNavigationHandlers(handlers: {
  handleCreateExerciseType: (name: string) => void
  handleEditExerciseType: (id: string, name: string) => boolean
  handleCreateExercise: (input: CreateExerciseInput) => void
  handleCreateRoutine: (input: CreateRoutineInput) => void
  handleEditRoutine: (id: string, name: string) => boolean
  handleCreateProgram: (input: CreateProgramInput) => void
  handleEditProgram: (id: string, name: string) => boolean
  handleDeleteExercise: (exerciseId: string) => void
  handleDeleteExerciseType: (exerciseTypeId: string) => void
  handleDeleteRoutine: (routineId: string) => void
  handleDeleteProgram: (programId: string) => void
  handleStartWorkout: () => void
  handleFinishWorkout: (session: WorkoutSession) => void
  handleCancelWorkout: () => void
}) {
  const navigate = useNavigate()

  // Simple navigation handlers
  const handleSelectExerciseType = useCallback((exerciseType: ExerciseType) => {
    navigate(`/exercise-types/${exerciseType.id}`)
  }, [navigate])

  const handleSelectExercise = useCallback((exercise: Exercise, exerciseTypeId: string) => {
    navigate(`/exercise-types/${exerciseTypeId}/exercises/${exercise.id}`)
  }, [navigate])

  const handleSelectRoutine = useCallback((routine: Routine) => {
    navigate(`/routines/${routine.id}`)
  }, [navigate])

  const handleSelectProgram = useCallback((program: Program) => {
    navigate(`/programs/${program.id}`)
  }, [navigate])

  const handleSelectRoutineFromProgram = useCallback((programId: string, routine: Routine) => {
    navigate(`/programs/${programId}/routines/${routine.id}`)
  }, [navigate])

  const handleSelectExerciseTypeFromRoutine = useCallback((
    routineId: string,
    exerciseType: ExerciseType,
    programId?: string
  ) => {
    if (programId) {
      navigate(`/programs/${programId}/routines/${routineId}/exercise-types/${exerciseType.id}`)
    } else {
      navigate(`/routines/${routineId}/exercise-types/${exerciseType.id}`)
    }
  }, [navigate])

  // Wrapped handlers that navigate after entity operations
  const handleCreateExerciseTypeWithNav = useCallback((name: string) => {
    handlers.handleCreateExerciseType(name)
    navigate('/exercise-types')
  }, [handlers, navigate])

  const handleEditExerciseTypeWithNav = useCallback((id: string, name: string) => {
    if (handlers.handleEditExerciseType(id, name)) {
      navigate(-1)
    }
  }, [handlers, navigate])

  const handleCreateExerciseWithNav = useCallback((input: CreateExerciseInput) => {
    handlers.handleCreateExercise(input)
    navigate(-1)
  }, [handlers, navigate])

  const handleCreateRoutineWithNav = useCallback((input: CreateRoutineInput) => {
    handlers.handleCreateRoutine(input)
    navigate('/routines')
  }, [handlers, navigate])

  const handleEditRoutineWithNav = useCallback((id: string, name: string) => {
    if (handlers.handleEditRoutine(id, name)) {
      navigate(-1)
    }
  }, [handlers, navigate])

  const handleCreateProgramWithNav = useCallback((input: CreateProgramInput) => {
    handlers.handleCreateProgram(input)
    navigate('/programs')
  }, [handlers, navigate])

  const handleEditProgramWithNav = useCallback((id: string, name: string) => {
    if (handlers.handleEditProgram(id, name)) {
      navigate(-1)
    }
  }, [handlers, navigate])

  const handleDeleteExerciseWithNav = useCallback((exerciseId: string, exerciseTypeId: string) => {
    handlers.handleDeleteExercise(exerciseId)
    navigate(`/exercise-types/${exerciseTypeId}`)
  }, [handlers, navigate])

  const handleDeleteExerciseTypeWithNav = useCallback((exerciseTypeId: string) => {
    handlers.handleDeleteExerciseType(exerciseTypeId)
    navigate('/exercise-types')
  }, [handlers, navigate])

  const handleDeleteRoutineWithNav = useCallback((routineId: string) => {
    handlers.handleDeleteRoutine(routineId)
    navigate('/routines')
  }, [handlers, navigate])

  const handleDeleteProgramWithNav = useCallback((programId: string) => {
    handlers.handleDeleteProgram(programId)
    navigate('/programs')
  }, [handlers, navigate])

  const handleStartWorkoutWithNav = useCallback(() => {
    handlers.handleStartWorkout()
    navigate('/workout/active')
  }, [handlers, navigate])

  const handleFinishWorkoutWithNav = useCallback((session: WorkoutSession) => {
    handlers.handleFinishWorkout(session)
    navigate('/')
  }, [handlers, navigate])

  const handleCancelWorkoutWithNav = useCallback(() => {
    handlers.handleCancelWorkout()
    navigate('/')
  }, [handlers, navigate])

  return {
    // Selection handlers
    handleSelectExerciseType,
    handleSelectExercise,
    handleSelectRoutine,
    handleSelectProgram,
    handleSelectRoutineFromProgram,
    handleSelectExerciseTypeFromRoutine,

    // CRUD with navigation
    handleCreateExerciseTypeWithNav,
    handleEditExerciseTypeWithNav,
    handleCreateExerciseWithNav,
    handleCreateRoutineWithNav,
    handleEditRoutineWithNav,
    handleCreateProgramWithNav,
    handleEditProgramWithNav,
    handleDeleteExerciseWithNav,
    handleDeleteExerciseTypeWithNav,
    handleDeleteRoutineWithNav,
    handleDeleteProgramWithNav,
    handleStartWorkoutWithNav,
    handleFinishWorkoutWithNav,
    handleCancelWorkoutWithNav,
  }
}
