import { createContext, useContext, useMemo, ReactNode, useCallback } from 'react'
import { ExerciseType } from '@/types/exerciseType'
import { Exercise, CreateExerciseInput } from '@/types/exercise'
import { Routine, CreateRoutineInput } from '@/types/routine'
import { Program, CreateProgramInput } from '@/types/program'
import { WorkoutSession } from '@/types/workoutSession'
import { NextWorkoutInfo } from '@/hooks/useWorkoutLogic'
import { useExercises } from './ExercisesContext'
import { useRoutines } from './RoutinesContext'
import { usePrograms } from './ProgramsContext'
import { useWorkout } from './WorkoutContext'

/**
 * App State Context - Coordinator for domain-specific contexts
 * Delegates to ExercisesContext, RoutinesContext, ProgramsContext, and WorkoutContext
 */

interface AppStateContextValue {
  // Entity data
  exerciseTypes: ExerciseType[]
  exercises: Exercise[]
  routines: Routine[]
  programs: Program[]
  workoutSessions: WorkoutSession[]

  // Loading states
  isLoading: boolean

  // Workout state
  activeSession: WorkoutSession | null
  nextWorkoutInfo: NextWorkoutInfo | null

  // Entity handlers
  handleCreateExerciseType: (name: string) => ExerciseType
  handleEditExerciseType: (id: string, name: string) => boolean
  handleDeleteExerciseType: (exerciseTypeId: string) => void

  handleCreateExercise: (input: CreateExerciseInput) => Exercise
  handleUpdateExercise: (exercise: Exercise) => void
  handleDeleteExercise: (exerciseId: string) => void

  handleCreateRoutine: (input: CreateRoutineInput) => Routine
  handleEditRoutine: (id: string, name: string) => boolean
  handleAddExerciseTypeToRoutine: (routineId: string, exerciseTypeId: string) => void
  handleRemoveExerciseTypeFromRoutine: (routineId: string, exerciseTypeId: string) => void
  handleDeleteRoutine: (routineId: string) => void

  handleCreateProgram: (input: CreateProgramInput) => Program
  handleEditProgram: (id: string, name: string) => boolean
  handleAddRoutineToProgram: (programId: string, routineId: string) => void
  handleRemoveRoutineFromProgram: (programId: string, routineId: string) => void
  handleDeleteProgram: (programId: string) => void

  // Workout handlers
  handleStartWorkout: () => WorkoutSession | null
  handleSkipWorkout: () => void
  handleUpdateWorkoutSession: (session: WorkoutSession) => void
  handleFinishWorkout: (session: WorkoutSession) => WorkoutSession
  handleCancelWorkout: () => void
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined)

interface AppStateProviderProps {
  children: ReactNode
}

export function AppStateProvider({ children }: AppStateProviderProps) {
  // Get state and handlers from domain contexts
  const exercises = useExercises()
  const routines = useRoutines()
  const programs = usePrograms()
  const workout = useWorkout()

  const isLoading = exercises.isLoading || routines.isLoading || programs.isLoading || workout.isLoading

  // Wire up cross-domain dependencies
  const handleDeleteExerciseType = useCallback((exerciseTypeId: string) => {
    exercises.handleDeleteExerciseType(exerciseTypeId, routines.handleUpdateRoutineExerciseTypes)
  }, [exercises, routines])

  const handleDeleteRoutine = useCallback((routineId: string) => {
    routines.handleDeleteRoutine(routineId, programs.handleUpdateProgramRoutines)
  }, [routines, programs])

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<AppStateContextValue>(
    () => ({
      // Entity data
      exerciseTypes: exercises.exerciseTypes,
      exercises: exercises.exercises,
      routines: routines.routines,
      programs: programs.programs,
      workoutSessions: workout.workoutSessions,

      // Loading states
      isLoading,

      // Workout state
      activeSession: workout.activeSession,
      nextWorkoutInfo: workout.nextWorkoutInfo,

      // Exercise handlers
      handleCreateExerciseType: exercises.handleCreateExerciseType,
      handleEditExerciseType: exercises.handleEditExerciseType,
      handleDeleteExerciseType,

      handleCreateExercise: exercises.handleCreateExercise,
      handleUpdateExercise: exercises.handleUpdateExercise,
      handleDeleteExercise: exercises.handleDeleteExercise,

      // Routine handlers
      handleCreateRoutine: routines.handleCreateRoutine,
      handleEditRoutine: routines.handleEditRoutine,
      handleAddExerciseTypeToRoutine: routines.handleAddExerciseTypeToRoutine,
      handleRemoveExerciseTypeFromRoutine: routines.handleRemoveExerciseTypeFromRoutine,
      handleDeleteRoutine,

      // Program handlers
      handleCreateProgram: programs.handleCreateProgram,
      handleEditProgram: programs.handleEditProgram,
      handleAddRoutineToProgram: programs.handleAddRoutineToProgram,
      handleRemoveRoutineFromProgram: programs.handleRemoveRoutineFromProgram,
      handleDeleteProgram: programs.handleDeleteProgram,

      // Workout handlers
      handleStartWorkout: workout.handleStartWorkout,
      handleSkipWorkout: workout.handleSkipWorkout,
      handleUpdateWorkoutSession: workout.handleUpdateWorkoutSession,
      handleFinishWorkout: workout.handleFinishWorkout,
      handleCancelWorkout: workout.handleCancelWorkout,
    }),
    [
      exercises,
      routines,
      programs,
      workout,
      isLoading,
      handleDeleteExerciseType,
      handleDeleteRoutine,
    ]
  )

  return <AppStateContext.Provider value={contextValue}>{children}</AppStateContext.Provider>
}

/**
 * Custom hook to access app state context
 * Throws error if used outside of AppStateProvider
 */
export function useAppState(): AppStateContextValue {
  const context = useContext(AppStateContext)
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider')
  }
  return context
}
