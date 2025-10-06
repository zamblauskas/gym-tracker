import { useCallback } from 'react'
import { ExerciseType } from '@/types/exerciseType'
import { Exercise, CreateExerciseInput } from '@/types/exercise'
import { Routine, CreateRoutineInput } from '@/types/routine'
import { Program, CreateProgramInput } from '@/types/program'
import {
  createExerciseType,
  createExercise,
  createRoutine,
  createProgram,
  updateEntity,
  updateInArray,
  removeFromArray,
  addToArray,
} from '@/lib/entityFactory'

export interface UseEntityHandlersProps {
  exerciseTypes: ExerciseType[]
  exercises: Exercise[]
  routines: Routine[]
  programs: Program[]
  setExerciseTypes: (items: ExerciseType[]) => void
  setExercises: (items: Exercise[]) => void
  setRoutines: (items: Routine[]) => void
  setPrograms: (items: Program[]) => void
}

export function useEntityHandlers({
  exerciseTypes,
  exercises,
  routines,
  programs,
  setExerciseTypes,
  setExercises,
  setRoutines,
  setPrograms,
}: UseEntityHandlersProps) {
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

  const handleDeleteExerciseType = useCallback((exerciseTypeId: string) => {
    // Remove exercise type
    setExerciseTypes(removeFromArray(exerciseTypes, exerciseTypeId))

    // CASCADE: Remove all exercises belonging to this exercise type
    setExercises(exercises.filter(ex => ex.exerciseTypeId !== exerciseTypeId))

    // Remove from routines
    setRoutines(
      routines.map(routine =>
        updateEntity({
          ...routine,
          exerciseTypeIds: routine.exerciseTypeIds.filter(id => id !== exerciseTypeId),
        })
      )
    )
  }, [exerciseTypes, exercises, routines, setExerciseTypes, setExercises, setRoutines])

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

  // Routine handlers
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

  const handleDeleteRoutine = useCallback((routineId: string) => {
    setRoutines(removeFromArray(routines, routineId))

    // Remove from programs
    setPrograms(
      programs.map(program =>
        updateEntity({
          ...program,
          routineIds: program.routineIds.filter(id => id !== routineId),
        })
      )
    )
  }, [routines, programs, setRoutines, setPrograms])

  // Program handlers
  const handleCreateProgram = useCallback((input: CreateProgramInput) => {
    const newProgram = createProgram(input)
    setPrograms(addToArray(programs, newProgram))
    return newProgram
  }, [programs, setPrograms])

  const handleEditProgram = useCallback((id: string, name: string) => {
    const existingProgram = programs.find(p => p.id === id)
    if (!existingProgram) return false

    setPrograms(
      updateInArray(programs, id, (p) => updateEntity({ ...p, name }))
    )
    return true
  }, [programs, setPrograms])

  const handleAddRoutineToProgram = useCallback((programId: string, routineId: string) => {
    setPrograms(
      updateInArray(programs, programId, (p) =>
        updateEntity({
          ...p,
          routineIds: addToArray(p.routineIds, routineId),
        })
      )
    )
  }, [programs, setPrograms])

  const handleRemoveRoutineFromProgram = useCallback((programId: string, routineId: string) => {
    setPrograms(
      updateInArray(programs, programId, (p) =>
        updateEntity({
          ...p,
          routineIds: p.routineIds.filter(id => id !== routineId),
        })
      )
    )
  }, [programs, setPrograms])

  const handleDeleteProgram = useCallback((programId: string) => {
    setPrograms(removeFromArray(programs, programId))
  }, [programs, setPrograms])

  return {
    // Exercise Type handlers
    handleCreateExerciseType,
    handleEditExerciseType,
    handleDeleteExerciseType,

    // Exercise handlers
    handleCreateExercise,
    handleUpdateExercise,
    handleDeleteExercise,

    // Routine handlers
    handleCreateRoutine,
    handleEditRoutine,
    handleAddExerciseTypeToRoutine,
    handleRemoveExerciseTypeFromRoutine,
    handleDeleteRoutine,

    // Program handlers
    handleCreateProgram,
    handleEditProgram,
    handleAddRoutineToProgram,
    handleRemoveRoutineFromProgram,
    handleDeleteProgram,
  }
}
