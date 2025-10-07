import { createContext, useContext, useMemo, ReactNode } from 'react'
import { ExerciseType } from '@/types/exerciseType'
import { Exercise, CreateExerciseInput } from '@/types/exercise'
import { usePersistedState } from '@/hooks/usePersistedState'
import {
  createExerciseTypeRepository,
  createExerciseRepository,
} from '@/lib/repositories'
import {
  createExerciseType,
  createExercise,
  updateEntity,
  updateInArray,
  removeFromArray,
  addToArray,
} from '@/lib/entityFactory'
import { useCallback } from 'react'

interface ExercisesContextValue {
  // Data
  exerciseTypes: ExerciseType[]
  exercises: Exercise[]
  isLoading: boolean

  // Exercise Type handlers
  handleCreateExerciseType: (name: string) => ExerciseType
  handleEditExerciseType: (id: string, name: string) => boolean
  handleDeleteExerciseType: (exerciseTypeId: string, onRoutineUpdate: (routineUpdater: (exerciseTypeIds: string[]) => string[]) => void) => void

  // Exercise handlers
  handleCreateExercise: (input: CreateExerciseInput) => Exercise
  handleUpdateExercise: (exercise: Exercise) => void
  handleDeleteExercise: (exerciseId: string) => void
}

const ExercisesContext = createContext<ExercisesContextValue | undefined>(undefined)

interface ExercisesProviderProps {
  children: ReactNode
}

export function ExercisesProvider({ children }: ExercisesProviderProps) {
  const exerciseTypeRepo = useMemo(() => createExerciseTypeRepository(), [])
  const exerciseRepo = useMemo(() => createExerciseRepository(), [])

  const [exerciseTypes, setExerciseTypes, isLoadingTypes] = usePersistedState<ExerciseType>(exerciseTypeRepo)
  const [exercises, setExercises, isLoadingExercises] = usePersistedState<Exercise>(exerciseRepo)

  const isLoading = isLoadingTypes || isLoadingExercises

  // Exercise Type handlers
  const handleCreateExerciseType = useCallback((name: string) => {
    const newExerciseType = createExerciseType(name)
    setExerciseTypes(addToArray(exerciseTypes, newExerciseType))
    return newExerciseType
  }, [exerciseTypes, setExerciseTypes])

  const handleEditExerciseType = useCallback((id: string, name: string) => {
    const existingExerciseType = exerciseTypes.find(et => et.id === id)
    if (!existingExerciseType) return false

    setExerciseTypes(
      updateInArray(exerciseTypes, id, (et) =>
        updateEntity({ ...et, name })
      )
    )
    return true
  }, [exerciseTypes, setExerciseTypes])

  const handleDeleteExerciseType = useCallback((
    exerciseTypeId: string,
    onRoutineUpdate: (routineUpdater: (exerciseTypeIds: string[]) => string[]) => void
  ) => {
    // Remove exercise type
    setExerciseTypes(removeFromArray(exerciseTypes, exerciseTypeId))

    // CASCADE: Remove all exercises belonging to this exercise type
    setExercises(exercises.filter(ex => ex.exerciseTypeId !== exerciseTypeId))

    // Remove from routines via callback
    onRoutineUpdate((exerciseTypeIds) =>
      exerciseTypeIds.filter(id => id !== exerciseTypeId)
    )
  }, [exerciseTypes, exercises, setExerciseTypes, setExercises])

  // Exercise handlers
  const handleCreateExercise = useCallback((input: CreateExerciseInput) => {
    const newExercise = createExercise(input)
    setExercises(addToArray(exercises, newExercise))
    return newExercise
  }, [exercises, setExercises])

  const handleUpdateExercise = useCallback((updatedExercise: Exercise) => {
    setExercises(
      updateInArray(exercises, updatedExercise.id, () => updatedExercise)
    )
  }, [exercises, setExercises])

  const handleDeleteExercise = useCallback((exerciseId: string) => {
    setExercises(removeFromArray(exercises, exerciseId))
  }, [exercises, setExercises])

  const contextValue = useMemo<ExercisesContextValue>(
    () => ({
      exerciseTypes,
      exercises,
      isLoading,
      handleCreateExerciseType,
      handleEditExerciseType,
      handleDeleteExerciseType,
      handleCreateExercise,
      handleUpdateExercise,
      handleDeleteExercise,
    }),
    [
      exerciseTypes,
      exercises,
      isLoading,
      handleCreateExerciseType,
      handleEditExerciseType,
      handleDeleteExerciseType,
      handleCreateExercise,
      handleUpdateExercise,
      handleDeleteExercise,
    ]
  )

  return <ExercisesContext.Provider value={contextValue}>{children}</ExercisesContext.Provider>
}

export function useExercises(): ExercisesContextValue {
  const context = useContext(ExercisesContext)
  if (!context) {
    throw new Error('useExercises must be used within ExercisesProvider')
  }
  return context
}
