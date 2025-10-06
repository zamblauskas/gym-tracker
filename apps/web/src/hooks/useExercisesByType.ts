import { useMemo } from 'react'
import { Exercise } from '@/types/exercise'

/**
 * Custom hook for filtering and aggregating exercises by type
 * Provides common exercise filtering operations to avoid duplication
 */
export function useExercisesByType(exercises: Exercise[], exerciseTypeId: string) {
  return useMemo(() => {
    const filtered = exercises.filter(ex => ex.exerciseTypeId === exerciseTypeId)

    return {
      exercises: filtered,
      count: filtered.length,
      names: filtered.map(ex => ex.name),
      firstThreeNames: filtered.slice(0, 3).map(ex => ex.name),
      hasMore: filtered.length > 3,
    }
  }, [exercises, exerciseTypeId])
}
