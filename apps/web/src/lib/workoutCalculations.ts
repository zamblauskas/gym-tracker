import { WorkoutSession } from '@/types/workoutSession'

/**
 * Calculate total volume lifted in a workout session
 * @param session - The workout session
 * @returns Total volume in kg (weight × reps)
 */
export function calculateTotalVolume(session: WorkoutSession): number {
  return session.exerciseLogs.reduce((total, log) => {
    return total + log.sets.reduce((setTotal, set) => {
      return setTotal + (set.weight * set.reps)
    }, 0)
  }, 0)
}

/**
 * Calculate workout duration in minutes
 * @param startTime - Workout start time
 * @param endTime - Workout end time
 * @returns Duration in minutes
 */
export function calculateDuration(startTime: Date, endTime: Date): number {
  return Math.round((endTime.getTime() - startTime.getTime()) / 60000)
}

/**
 * Finish a workout session with calculated metrics
 * @param session - The active workout session
 * @returns Updated session with endTime, duration, and totalVolume
 */
export function finishWorkoutSession(session: WorkoutSession): WorkoutSession {
  const endTime = new Date()
  const duration = calculateDuration(session.startTime, endTime)
  const totalVolume = calculateTotalVolume(session)

  return {
    ...session,
    endTime,
    duration,
    totalVolume,
    updatedAt: new Date()
  }
}
