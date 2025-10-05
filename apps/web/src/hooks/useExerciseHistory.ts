import { useMemo } from 'react'
import { WorkoutSession } from '@/types/workoutSession'
import { Exercise } from '@/types/exercise'
import { getPreviousExerciseLog, PreviousExerciseData } from '@/lib/exerciseHistory'

interface UseExerciseHistoryProps {
  selectedExercise: Exercise | null
  previousSessions: WorkoutSession[]
  currentSessionId: string
}

/**
 * Hook to get previous exercise history
 * @param selectedExercise - Currently selected exercise
 * @param previousSessions - All previous workout sessions
 * @param currentSessionId - Current session ID
 * @returns Previous exercise data or null
 */
export function useExerciseHistory({
  selectedExercise,
  previousSessions,
  currentSessionId
}: UseExerciseHistoryProps): PreviousExerciseData | null {
  return useMemo(() => {
    if (!selectedExercise) return null

    return getPreviousExerciseLog(
      selectedExercise.id,
      previousSessions,
      currentSessionId
    )
  }, [selectedExercise, previousSessions, currentSessionId])
}
