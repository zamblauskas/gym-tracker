import { WorkoutSession, ExerciseLog } from '@/types/workoutSession'

export interface PreviousExerciseData {
  log: ExerciseLog
  sessionDate: Date
}

/**
 * Find the last time a specific exercise was performed
 * @param exerciseId - The exercise to search for
 * @param previousSessions - All previous workout sessions
 * @param currentSessionId - Current session ID to exclude from search
 * @returns Previous exercise log and session date, or null if not found
 */
export function getPreviousExerciseLog(
  exerciseId: string,
  previousSessions: WorkoutSession[],
  currentSessionId: string
): PreviousExerciseData | null {
  // Exclude current session and sort by date (newest first)
  const allPreviousSessions = previousSessions
    .filter(s => s.id !== currentSessionId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  for (const prevSession of allPreviousSessions) {
    const log = prevSession.exerciseLogs.find(log => log.exerciseId === exerciseId)
    if (log && log.sets.length > 0) {
      return { log, sessionDate: prevSession.createdAt }
    }
  }

  return null
}

/**
 * Format a date for display
 * @param date - Date to format
 * @returns Formatted date string (e.g., "Jan 15")
 */
export function formatSessionDate(date: Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
