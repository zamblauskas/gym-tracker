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

  const handleSelectExercise = useCallback((
    exercise: Exercise,
    exerciseTypeId: string,
    fromContext?: { programId?: string; routineId?: string }
  ) => {
    // Build 'from' query param to preserve navigation context
    const queryParts: string[] = []
    if (fromContext?.programId) queryParts.push(`program:${fromContext.programId}`)
    if (fromContext?.routineId) queryParts.push(`routine:${fromContext.routineId}`)
    queryParts.push(`exerciseType:${exerciseTypeId}`)

    const query = queryParts.length > 0 ? `?from=${queryParts.join(',')}` : ''
    navigate(`/exercises/${exercise.id}${query}`)
  }, [navigate])

  const handleSelectRoutine = useCallback((routine: Routine) => {
    navigate(`/routines/${routine.id}`)
  }, [navigate])

  const handleSelectProgram = useCallback((program: Program) => {
    navigate(`/programs/${program.id}`)
  }, [navigate])

  const handleSelectRoutineFromProgram = useCallback((
    programId: string,
    routine: Routine
  ) => {
    // Add 'from' query param to preserve navigation context
    navigate(`/routines/${routine.id}?from=program:${programId}`)
  }, [navigate])

  const handleSelectExerciseTypeFromRoutine = useCallback((
    routineId: string,
    exerciseType: ExerciseType,
    programId?: string
  ) => {
    // Build 'from' query param to preserve navigation context
    const queryParts: string[] = []
    if (programId) queryParts.push(`program:${programId}`)
    queryParts.push(`routine:${routineId}`)

    const query = queryParts.length > 0 ? `?from=${queryParts.join(',')}` : ''
    navigate(`/exercise-types/${exerciseType.id}${query}`)
  }, [navigate])

  // Wrapped handlers that navigate after entity operations
  const handleCreateExerciseTypeWithNav = useCallback((name: string) => {
    handlers.handleCreateExerciseType(name)
    navigate('/exercise-types')
  }, [handlers, navigate])

  const handleEditExerciseTypeWithNav = useCallback((id: string, name: string) => {
    // Just update the entity - drawer close will handle navigation via closeDrawer()
    handlers.handleEditExerciseType(id, name)
  }, [handlers])

  const handleCreateExerciseWithNav = useCallback((input: CreateExerciseInput) => {
    // Just create the entity - drawer close will handle navigation via closeDrawer()
    handlers.handleCreateExercise(input)
  }, [handlers])

  const handleCreateRoutineWithNav = useCallback((input: CreateRoutineInput) => {
    handlers.handleCreateRoutine(input)
    navigate('/routines')
  }, [handlers, navigate])

  const handleEditRoutineWithNav = useCallback((id: string, name: string) => {
    // Just update the entity - drawer close will handle navigation via closeDrawer()
    handlers.handleEditRoutine(id, name)
  }, [handlers])

  const handleCreateProgramWithNav = useCallback((input: CreateProgramInput) => {
    handlers.handleCreateProgram(input)
    navigate('/programs')
  }, [handlers, navigate])

  const handleEditProgramWithNav = useCallback((id: string, name: string) => {
    // Just update the entity - drawer close will handle navigation via closeDrawer()
    handlers.handleEditProgram(id, name)
  }, [handlers])

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
    navigate('/workout/active/0')
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
