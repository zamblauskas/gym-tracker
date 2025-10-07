import { createContext, useContext, useMemo, ReactNode, useEffect } from 'react'
import { WorkoutSession } from '@/types/workoutSession'
import { usePersistedState } from '@/hooks/usePersistedState'
import { createWorkoutSessionRepository } from '@/lib/repositories'
import { useWorkoutLogic, NextWorkoutInfo } from '@/hooks/useWorkoutLogic'
import { usePrograms } from './ProgramsContext'
import { useRoutines } from './RoutinesContext'
import { logger } from '@/lib/utils/logger'

interface WorkoutContextValue {
  // Data
  workoutSessions: WorkoutSession[]
  activeSession: WorkoutSession | null
  nextWorkoutInfo: NextWorkoutInfo | null
  isLoading: boolean

  // Workout handlers
  handleStartWorkout: () => WorkoutSession | null
  handleSkipWorkout: () => void
  handleUpdateWorkoutSession: (session: WorkoutSession) => void
  handleFinishWorkout: (session: WorkoutSession) => WorkoutSession
  handleCancelWorkout: () => void
}

const WorkoutContext = createContext<WorkoutContextValue | undefined>(undefined)

interface WorkoutProviderProps {
  children: ReactNode
}

export function WorkoutProvider({ children }: WorkoutProviderProps) {
  const { programs } = usePrograms()
  const { routines } = useRoutines()

  const workoutSessionRepo = useMemo(() => createWorkoutSessionRepository(), [])
  const [workoutSessions, setWorkoutSessions, isLoading] = usePersistedState<WorkoutSession>(workoutSessionRepo)

  // Data migration: Add status field to existing workout sessions
  useEffect(() => {
    if (isLoading || workoutSessions.length === 0) return

    const needsMigration = workoutSessions.some((session: any) => !session.status)
    if (!needsMigration) return

    logger.info('Migrating workout sessions to add status field', 'WorkoutContext')
    const migratedSessions = workoutSessions.map((session: any) => {
      if (session.status) return session

      // Determine status based on endTime presence
      const status = session.endTime
        ? (session.duration === 0 && session.totalVolume === 0 ? 'skipped' : 'completed')
        : 'in-progress'

      return {
        ...session,
        status,
      }
    })

    setWorkoutSessions(migratedSessions)
  }, [workoutSessions, setWorkoutSessions, isLoading])

  const workoutLogic = useWorkoutLogic({
    programs,
    routines,
    workoutSessions,
    setWorkoutSessions,
  })

  const contextValue = useMemo<WorkoutContextValue>(
    () => ({
      workoutSessions,
      activeSession: workoutLogic.activeSession,
      nextWorkoutInfo: workoutLogic.nextWorkoutInfo,
      isLoading,
      handleStartWorkout: workoutLogic.handleStartWorkout,
      handleSkipWorkout: workoutLogic.handleSkipWorkout,
      handleUpdateWorkoutSession: workoutLogic.handleUpdateWorkoutSession,
      handleFinishWorkout: workoutLogic.handleFinishWorkout,
      handleCancelWorkout: workoutLogic.handleCancelWorkout,
    }),
    [workoutSessions, workoutLogic, isLoading]
  )

  return <WorkoutContext.Provider value={contextValue}>{children}</WorkoutContext.Provider>
}

export function useWorkout(): WorkoutContextValue {
  const context = useContext(WorkoutContext)
  if (!context) {
    throw new Error('useWorkout must be used within WorkoutProvider')
  }
  return context
}
