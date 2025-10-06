import { createContext, useContext, useMemo, ReactNode } from 'react'
import { ExerciseType } from '@/types/exerciseType'
import { Exercise, CreateExerciseInput } from '@/types/exercise'
import { Routine, CreateRoutineInput } from '@/types/routine'
import { Program, CreateProgramInput } from '@/types/program'
import { WorkoutSession } from '@/types/workoutSession'
import { usePersistedState } from '@/hooks/usePersistedState'
import { useEntityHandlers } from '@/hooks/useEntityHandlers'
import { useWorkoutLogic, NextWorkoutInfo } from '@/hooks/useWorkoutLogic'
import {
  createExerciseTypeRepository,
  createExerciseRepository,
  createRoutineRepository,
  createProgramRepository,
  createWorkoutSessionRepository,
} from '@/lib/repositories'

/**
 * App State Context - Central state management for the entire application
 * Provides all entity data, handlers, and loading states
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
  // Create repository instances (memoized to avoid recreating on every render)
  const exerciseTypeRepo = useMemo(() => createExerciseTypeRepository(), [])
  const exerciseRepo = useMemo(() => createExerciseRepository(), [])
  const routineRepo = useMemo(() => createRoutineRepository(), [])
  const programRepo = useMemo(() => createProgramRepository(), [])
  const workoutSessionRepo = useMemo(() => createWorkoutSessionRepository(), [])

  // Use persisted state for all entities
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

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<AppStateContextValue>(
    () => ({
      // Entity data
      exerciseTypes,
      exercises,
      routines,
      programs,
      workoutSessions,

      // Loading states
      isLoading,

      // Workout state
      activeSession: workoutLogic.activeSession,
      nextWorkoutInfo: workoutLogic.nextWorkoutInfo,

      // Entity handlers
      handleCreateExerciseType: entityHandlers.handleCreateExerciseType,
      handleEditExerciseType: entityHandlers.handleEditExerciseType,
      handleDeleteExerciseType: entityHandlers.handleDeleteExerciseType,

      handleCreateExercise: entityHandlers.handleCreateExercise,
      handleUpdateExercise: entityHandlers.handleUpdateExercise,
      handleDeleteExercise: entityHandlers.handleDeleteExercise,

      handleCreateRoutine: entityHandlers.handleCreateRoutine,
      handleEditRoutine: entityHandlers.handleEditRoutine,
      handleAddExerciseTypeToRoutine: entityHandlers.handleAddExerciseTypeToRoutine,
      handleRemoveExerciseTypeFromRoutine: entityHandlers.handleRemoveExerciseTypeFromRoutine,
      handleDeleteRoutine: entityHandlers.handleDeleteRoutine,

      handleCreateProgram: entityHandlers.handleCreateProgram,
      handleEditProgram: entityHandlers.handleEditProgram,
      handleAddRoutineToProgram: entityHandlers.handleAddRoutineToProgram,
      handleRemoveRoutineFromProgram: entityHandlers.handleRemoveRoutineFromProgram,
      handleDeleteProgram: entityHandlers.handleDeleteProgram,

      // Workout handlers
      handleStartWorkout: workoutLogic.handleStartWorkout,
      handleSkipWorkout: workoutLogic.handleSkipWorkout,
      handleUpdateWorkoutSession: workoutLogic.handleUpdateWorkoutSession,
      handleFinishWorkout: workoutLogic.handleFinishWorkout,
      handleCancelWorkout: workoutLogic.handleCancelWorkout,
    }),
    [
      exerciseTypes,
      exercises,
      routines,
      programs,
      workoutSessions,
      isLoading,
      workoutLogic,
      entityHandlers,
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
