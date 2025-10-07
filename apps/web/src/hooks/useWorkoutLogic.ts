import { useMemo, useCallback } from 'react'
import { WorkoutSession } from '@/types/workoutSession'
import { Program } from '@/types/program'
import { Routine } from '@/types/routine'

export interface NextWorkoutInfo {
  routine: Routine
  program: Program | null
}

export interface UseWorkoutLogicProps {
  programs: Program[]
  routines: Routine[]
  workoutSessions: WorkoutSession[]
  setWorkoutSessions: (sessions: WorkoutSession[]) => void
}

export function useWorkoutLogic({
  programs,
  routines,
  workoutSessions,
  setWorkoutSessions,
}: UseWorkoutLogicProps) {
  // Derive active session from persisted workoutSessions array
  const activeSession = useMemo(() => {
    return workoutSessions.find(s => s.status === 'in-progress') || null
  }, [workoutSessions])

  // Calculate next workout info (memoized to prevent re-renders)
  const nextWorkoutInfo = useMemo((): NextWorkoutInfo | null => {
    // Find the most recent program with routines
    const activeProgram = programs
      .filter(p => p.routineIds.length > 0)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]

    if (!activeProgram) return null

    // Get the program's routines
    const programRoutines = routines.filter(r => activeProgram.routineIds.includes(r.id))
    if (programRoutines.length === 0) return null

    // Find last completed session for this program
    const lastSession = workoutSessions
      .filter(s => s.programId === activeProgram.id && (s.status === 'completed' || s.status === 'skipped'))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]

    if (!lastSession) {
      // No sessions yet, return first routine
      const firstRoutine = programRoutines[0]
      if (!firstRoutine) return null
      return { routine: firstRoutine, program: activeProgram }
    }

    // Find index of last routine in the cycle
    const lastRoutineIndex = activeProgram.routineIds.indexOf(lastSession.routineId)

    // Get next routine in cycle (wrap around if at end)
    const nextRoutineId = activeProgram.routineIds[(lastRoutineIndex + 1) % activeProgram.routineIds.length]
    const nextRoutine = programRoutines.find(r => r.id === nextRoutineId)

    if (!nextRoutine) {
      const firstRoutine = programRoutines[0]
      if (!firstRoutine) return null
      return { routine: firstRoutine, program: activeProgram }
    }

    return { routine: nextRoutine, program: activeProgram }
  }, [programs, routines, workoutSessions])

  const handleStartWorkout = useCallback(() => {
    if (!nextWorkoutInfo) return null

    const newSession: WorkoutSession = {
      id: crypto.randomUUID(),
      programId: nextWorkoutInfo.program?.id,
      routineId: nextWorkoutInfo.routine.id,
      exerciseLogs: [],
      status: 'in-progress',
      startTime: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Persist immediately to repository
    setWorkoutSessions([...workoutSessions, newSession])
    return newSession
  }, [nextWorkoutInfo, workoutSessions, setWorkoutSessions])

  const handleSkipWorkout = useCallback(() => {
    if (!nextWorkoutInfo) return

    const now = new Date()
    const skippedSession: WorkoutSession = {
      id: crypto.randomUUID(),
      programId: nextWorkoutInfo.program?.id,
      routineId: nextWorkoutInfo.routine.id,
      exerciseLogs: [],
      status: 'skipped',
      startTime: now,
      endTime: now,
      duration: 0,
      totalVolume: 0,
      createdAt: now,
      updatedAt: now,
    }

    setWorkoutSessions([...workoutSessions, skippedSession])
  }, [nextWorkoutInfo, workoutSessions, setWorkoutSessions])

  const handleUpdateWorkoutSession = useCallback((session: WorkoutSession) => {
    // Update the session in the persisted array
    setWorkoutSessions(
      workoutSessions.map(s => s.id === session.id ? session : s)
    )
  }, [workoutSessions, setWorkoutSessions])

  const handleFinishWorkout = useCallback((finishedSession: WorkoutSession) => {
    // Update the in-progress session to completed
    setWorkoutSessions(
      workoutSessions.map(s => s.id === finishedSession.id ? finishedSession : s)
    )
    return finishedSession
  }, [workoutSessions, setWorkoutSessions])

  const handleCancelWorkout = useCallback(() => {
    if (!activeSession) return

    // Delete the in-progress session from repository
    setWorkoutSessions(workoutSessions.filter(s => s.id !== activeSession.id))
  }, [activeSession, workoutSessions, setWorkoutSessions])

  return {
    activeSession,
    nextWorkoutInfo,
    handleStartWorkout,
    handleSkipWorkout,
    handleUpdateWorkoutSession,
    handleFinishWorkout,
    handleCancelWorkout,
  }
}
