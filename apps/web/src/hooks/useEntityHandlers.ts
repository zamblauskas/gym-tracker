import { useCallback } from 'react'
import { ExerciseType } from '@/types/exerciseType'
import { Exercise, CreateExerciseInput } from '@/types/exercise'
import { Routine, CreateRoutineInput } from '@/types/routine'
import { Program, CreateProgramInput } from '@/types/program'

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
    const newExerciseType: ExerciseType = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setExerciseTypes([...exerciseTypes, newExerciseType])
    return newExerciseType
  }, [exerciseTypes, setExerciseTypes])

  const handleEditExerciseType = useCallback((id: string, name: string) => {
    const existingExerciseType = exerciseTypes.find(et => et.id === id)
    if (!existingExerciseType) return false

    const updatedExerciseType: ExerciseType = {
      ...existingExerciseType,
      name,
      updatedAt: new Date(),
    }
    setExerciseTypes(exerciseTypes.map(et => et.id === id ? updatedExerciseType : et))
    return true
  }, [exerciseTypes, setExerciseTypes])

  const handleDeleteExerciseType = useCallback((exerciseTypeId: string) => {
    // Remove exercise type
    setExerciseTypes(exerciseTypes.filter(et => et.id !== exerciseTypeId))

    // CASCADE: Remove all exercises belonging to this exercise type
    setExercises(exercises.filter(ex => ex.exerciseTypeId !== exerciseTypeId))

    // Remove from routines
    setRoutines(routines.map(routine => ({
      ...routine,
      exerciseTypeIds: routine.exerciseTypeIds.filter(id => id !== exerciseTypeId),
      updatedAt: new Date(),
    })))
  }, [exerciseTypes, exercises, routines, setExerciseTypes, setExercises, setRoutines])

  // Exercise handlers
  const handleCreateExercise = useCallback((input: CreateExerciseInput) => {
    const newExercise: Exercise = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setExercises([...exercises, newExercise])
    return newExercise
  }, [exercises, setExercises])

  const handleUpdateExercise = useCallback((updatedExercise: Exercise) => {
    setExercises(exercises.map(ex => ex.id === updatedExercise.id ? updatedExercise : ex))
  }, [exercises, setExercises])

  const handleDeleteExercise = useCallback((exerciseId: string) => {
    setExercises(exercises.filter(ex => ex.id !== exerciseId))
  }, [exercises, setExercises])

  // Routine handlers
  const handleCreateRoutine = useCallback((input: CreateRoutineInput) => {
    const newRoutine: Routine = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setRoutines([...routines, newRoutine])
    return newRoutine
  }, [routines, setRoutines])

  const handleEditRoutine = useCallback((id: string, name: string) => {
    const existingRoutine = routines.find(r => r.id === id)
    if (!existingRoutine) return false

    const updatedRoutine: Routine = {
      ...existingRoutine,
      name,
      updatedAt: new Date(),
    }
    setRoutines(routines.map(r => r.id === id ? updatedRoutine : r))
    return true
  }, [routines, setRoutines])

  const handleAddExerciseTypeToRoutine = useCallback((routineId: string, exerciseTypeId: string) => {
    const routine = routines.find(r => r.id === routineId)
    if (!routine) return

    const updatedRoutine = {
      ...routine,
      exerciseTypeIds: [...routine.exerciseTypeIds, exerciseTypeId],
      updatedAt: new Date(),
    }
    setRoutines(routines.map(r => r.id === updatedRoutine.id ? updatedRoutine : r))
  }, [routines, setRoutines])

  const handleRemoveExerciseTypeFromRoutine = useCallback((routineId: string, exerciseTypeId: string) => {
    const routine = routines.find(r => r.id === routineId)
    if (!routine) return

    const updatedRoutine = {
      ...routine,
      exerciseTypeIds: routine.exerciseTypeIds.filter(id => id !== exerciseTypeId),
      updatedAt: new Date(),
    }
    setRoutines(routines.map(r => r.id === updatedRoutine.id ? updatedRoutine : r))
  }, [routines, setRoutines])

  const handleDeleteRoutine = useCallback((routineId: string) => {
    setRoutines(routines.filter(r => r.id !== routineId))

    // Remove from programs
    setPrograms(programs.map(program => ({
      ...program,
      routineIds: program.routineIds.filter(id => id !== routineId),
      updatedAt: new Date(),
    })))
  }, [routines, programs, setRoutines, setPrograms])

  // Program handlers
  const handleCreateProgram = useCallback((input: CreateProgramInput) => {
    const newProgram: Program = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setPrograms([...programs, newProgram])
    return newProgram
  }, [programs, setPrograms])

  const handleEditProgram = useCallback((id: string, name: string) => {
    const existingProgram = programs.find(p => p.id === id)
    if (!existingProgram) return false

    const updatedProgram: Program = {
      ...existingProgram,
      name,
      updatedAt: new Date(),
    }
    setPrograms(programs.map(p => p.id === id ? updatedProgram : p))
    return true
  }, [programs, setPrograms])

  const handleAddRoutineToProgram = useCallback((programId: string, routineId: string) => {
    const program = programs.find(p => p.id === programId)
    if (!program) return

    const updatedProgram = {
      ...program,
      routineIds: [...program.routineIds, routineId],
      updatedAt: new Date(),
    }
    setPrograms(programs.map(p => p.id === updatedProgram.id ? updatedProgram : p))
  }, [programs, setPrograms])

  const handleRemoveRoutineFromProgram = useCallback((programId: string, routineId: string) => {
    const program = programs.find(p => p.id === programId)
    if (!program) return

    const updatedProgram = {
      ...program,
      routineIds: program.routineIds.filter(id => id !== routineId),
      updatedAt: new Date(),
    }
    setPrograms(programs.map(p => p.id === updatedProgram.id ? updatedProgram : p))
  }, [programs, setPrograms])

  const handleDeleteProgram = useCallback((programId: string) => {
    setPrograms(programs.filter(p => p.id !== programId))
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
