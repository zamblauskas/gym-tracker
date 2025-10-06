/**
 * Entity factory utilities for creating domain entities with standard fields
 * Reduces duplication and ensures consistency in entity creation
 */

import { ExerciseType } from '@/types/exerciseType'
import { Exercise, CreateExerciseInput } from '@/types/exercise'
import { Routine, CreateRoutineInput } from '@/types/routine'
import { Program, CreateProgramInput } from '@/types/program'

/**
 * Base entity fields that all entities should have
 */
interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Generate a new UUID
 */
function generateId(): string {
  return crypto.randomUUID()
}

/**
 * Get current timestamp
 */
function getCurrentTimestamp(): Date {
  return new Date()
}

/**
 * Create base entity fields
 */
function createBaseEntity(): BaseEntity {
  const now = getCurrentTimestamp()
  return {
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  }
}

/**
 * Update entity with new updatedAt timestamp
 */
export function updateEntity<T extends { updatedAt: Date }>(entity: T): T {
  return {
    ...entity,
    updatedAt: getCurrentTimestamp(),
  }
}

/**
 * Create a new ExerciseType
 */
export function createExerciseType(name: string): ExerciseType {
  return {
    ...createBaseEntity(),
    name,
  }
}

/**
 * Create a new Exercise
 */
export function createExercise(input: CreateExerciseInput): Exercise {
  return {
    ...createBaseEntity(),
    ...input,
  }
}

/**
 * Create a new Routine
 */
export function createRoutine(input: CreateRoutineInput): Routine {
  return {
    ...createBaseEntity(),
    ...input,
  }
}

/**
 * Create a new Program
 */
export function createProgram(input: CreateProgramInput): Program {
  return {
    ...createBaseEntity(),
    ...input,
  }
}

/**
 * Generic array update helper - replaces item with matching id
 */
export function updateInArray<T extends { id: string }>(
  array: T[],
  id: string,
  updater: (item: T) => T
): T[] {
  return array.map(item => (item.id === id ? updater(item) : item))
}

/**
 * Generic array remove helper - removes item with matching id
 */
export function removeFromArray<T extends { id: string }>(array: T[], id: string): T[] {
  return array.filter(item => item.id !== id)
}

/**
 * Generic array add helper - adds item to end of array
 */
export function addToArray<T>(array: T[], item: T): T[] {
  return [...array, item]
}
