import { ExerciseType } from '@/types/exerciseType'
import { Exercise } from '@/types/exercise'
import { Routine } from '@/types/routine'
import { Program } from '@/types/program'
import { WorkoutSession } from '@/types/workoutSession'
import { LocalStorageRepository } from './localStorage'
import { IDataRepository } from './types'

/**
 * Factory functions to create repository instances
 * Currently using LocalStorage, but can be swapped for Supabase later
 */

export function createExerciseTypeRepository(): IDataRepository<ExerciseType> {
  return new LocalStorageRepository<ExerciseType>('exercise-types')
}

export function createExerciseRepository(): IDataRepository<Exercise> {
  return new LocalStorageRepository<Exercise>('exercises')
}

export function createRoutineRepository(): IDataRepository<Routine> {
  return new LocalStorageRepository<Routine>('routines')
}

export function createProgramRepository(): IDataRepository<Program> {
  return new LocalStorageRepository<Program>('programs')
}

export function createWorkoutSessionRepository(): IDataRepository<WorkoutSession> {
  return new LocalStorageRepository<WorkoutSession>('workout-sessions')
}

// Re-export types for convenience
export type { IDataRepository } from './types'
