import { createContext, useContext, useMemo, ReactNode, useCallback } from 'react'
import { Routine, CreateRoutineInput } from '@/types/routine'
import { usePersistedState } from '@/hooks/usePersistedState'
import { createRoutineRepository } from '@/lib/repositories'
import {
  createRoutine,
  updateEntity,
  updateInArray,
  removeFromArray,
  addToArray,
} from '@/lib/entityFactory'

interface RoutinesContextValue {
  // Data
  routines: Routine[]
  isLoading: boolean

  // Routine handlers
  handleCreateRoutine: (input: CreateRoutineInput) => Routine
  handleEditRoutine: (id: string, name: string) => boolean
  handleAddExerciseTypeToRoutine: (routineId: string, exerciseTypeId: string) => void
  handleRemoveExerciseTypeFromRoutine: (routineId: string, exerciseTypeId: string) => void
  handleDeleteRoutine: (routineId: string, onProgramUpdate: (programUpdater: (routineIds: string[]) => string[]) => void) => void
  handleUpdateRoutineExerciseTypes: (updater: (exerciseTypeIds: string[]) => string[]) => void
}

const RoutinesContext = createContext<RoutinesContextValue | undefined>(undefined)

interface RoutinesProviderProps {
  children: ReactNode
}

export function RoutinesProvider({ children }: RoutinesProviderProps) {
  const routineRepo = useMemo(() => createRoutineRepository(), [])
  const [routines, setRoutines, isLoading] = usePersistedState<Routine>(routineRepo)

  const handleCreateRoutine = useCallback((input: CreateRoutineInput) => {
    const newRoutine = createRoutine(input)
    setRoutines(addToArray(routines, newRoutine))
    return newRoutine
  }, [routines, setRoutines])

  const handleEditRoutine = useCallback((id: string, name: string) => {
    const existingRoutine = routines.find(r => r.id === id)
    if (!existingRoutine) return false

    setRoutines(
      updateInArray(routines, id, (r) => updateEntity({ ...r, name }))
    )
    return true
  }, [routines, setRoutines])

  const handleAddExerciseTypeToRoutine = useCallback((routineId: string, exerciseTypeId: string) => {
    setRoutines(
      updateInArray(routines, routineId, (r) =>
        updateEntity({
          ...r,
          exerciseTypeIds: addToArray(r.exerciseTypeIds, exerciseTypeId),
        })
      )
    )
  }, [routines, setRoutines])

  const handleRemoveExerciseTypeFromRoutine = useCallback((routineId: string, exerciseTypeId: string) => {
    setRoutines(
      updateInArray(routines, routineId, (r) =>
        updateEntity({
          ...r,
          exerciseTypeIds: r.exerciseTypeIds.filter(id => id !== exerciseTypeId),
        })
      )
    )
  }, [routines, setRoutines])

  const handleDeleteRoutine = useCallback((
    routineId: string,
    onProgramUpdate: (programUpdater: (routineIds: string[]) => string[]) => void
  ) => {
    setRoutines(removeFromArray(routines, routineId))

    // Remove from programs via callback
    onProgramUpdate((routineIds) => routineIds.filter(id => id !== routineId))
  }, [routines, setRoutines])

  const handleUpdateRoutineExerciseTypes = useCallback((
    updater: (exerciseTypeIds: string[]) => string[]
  ) => {
    setRoutines(
      routines.map(routine =>
        updateEntity({
          ...routine,
          exerciseTypeIds: updater(routine.exerciseTypeIds),
        })
      )
    )
  }, [routines, setRoutines])

  const contextValue = useMemo<RoutinesContextValue>(
    () => ({
      routines,
      isLoading,
      handleCreateRoutine,
      handleEditRoutine,
      handleAddExerciseTypeToRoutine,
      handleRemoveExerciseTypeFromRoutine,
      handleDeleteRoutine,
      handleUpdateRoutineExerciseTypes,
    }),
    [
      routines,
      isLoading,
      handleCreateRoutine,
      handleEditRoutine,
      handleAddExerciseTypeToRoutine,
      handleRemoveExerciseTypeFromRoutine,
      handleDeleteRoutine,
      handleUpdateRoutineExerciseTypes,
    ]
  )

  return <RoutinesContext.Provider value={contextValue}>{children}</RoutinesContext.Provider>
}

export function useRoutines(): RoutinesContextValue {
  const context = useContext(RoutinesContext)
  if (!context) {
    throw new Error('useRoutines must be used within RoutinesProvider')
  }
  return context
}
