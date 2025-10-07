import { useState, useMemo, useCallback } from 'react'
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
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null)

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
      .filter(s => s.programId === activeProgram.id && s.endTime)
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
      startTime: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setActiveSession(newSession)
    return newSession
  }, [nextWorkoutInfo])

  const handleSkipWorkout = useCallback(() => {
    if (!nextWorkoutInfo) return

    const now = new Date()
    const skippedSession: WorkoutSession = {
      id: crypto.randomUUID(),
      programId: nextWorkoutInfo.program?.id,
      routineId: nextWorkoutInfo.routine.id,
      exerciseLogs: [],
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
    setActiveSession(session)
  }, [])

  const handleFinishWorkout = useCallback((finishedSession: WorkoutSession) => {
    setWorkoutSessions([...workoutSessions, finishedSession])
    setActiveSession(null)
    return finishedSession
  }, [workoutSessions, setWorkoutSessions])

  const handleCancelWorkout = useCallback(() => {
    setActiveSession(null)
  }, [])

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
