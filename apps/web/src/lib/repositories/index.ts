import { ExerciseType } from '@/types/exerciseType'
import { Exercise } from '@/types/exercise'
import { Routine } from '@/types/routine'
import { Program } from '@/types/program'
import { WorkoutSession } from '@/types/workoutSession'
import { LocalStorageRepository } from './localStorage'
import { SupabaseRepository } from './supabase'
import { IDataRepository } from './types'
import { getActiveStorageBackend } from '../config'

/**
 * Factory functions to create repository instances
 * Switches between LocalStorage and Supabase based on configuration
 */

export function createExerciseTypeRepository(): IDataRepository<ExerciseType> {
  const backend = getActiveStorageBackend()

  if (backend === 'supabase') {
    return new SupabaseRepository<ExerciseType>('exercise_types')
  }

  return new LocalStorageRepository<ExerciseType>('exercise-types')
}

export function createExerciseRepository(): IDataRepository<Exercise> {
  const backend = getActiveStorageBackend()

  if (backend === 'supabase') {
    return new SupabaseRepository<Exercise>('exercises')
  }

  return new LocalStorageRepository<Exercise>('exercises')
}

export function createRoutineRepository(): IDataRepository<Routine> {
  const backend = getActiveStorageBackend()

  if (backend === 'supabase') {
    return new SupabaseRepository<Routine>('routines')
  }

  return new LocalStorageRepository<Routine>('routines')
}

export function createProgramRepository(): IDataRepository<Program> {
  const backend = getActiveStorageBackend()

  if (backend === 'supabase') {
    return new SupabaseRepository<Program>('programs')
  }

  return new LocalStorageRepository<Program>('programs')
}

export function createWorkoutSessionRepository(): IDataRepository<WorkoutSession> {
  const backend = getActiveStorageBackend()

  if (backend === 'supabase') {
    return new SupabaseRepository<WorkoutSession>('workout_sessions')
  }

  return new LocalStorageRepository<WorkoutSession>('workout-sessions')
}

// Re-export types for convenience
export type { IDataRepository } from './types'
