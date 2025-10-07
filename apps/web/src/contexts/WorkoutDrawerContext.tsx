import { createContext, useContext, useState, ReactNode } from 'react'
import { Exercise } from '@/types/exercise'

interface WorkoutDrawerContextType {
  onAddSet: ((weight: number, reps: number, rir?: number) => void) | null
  onSelectExercise: ((exercise: Exercise) => void) | null
  setWorkoutDrawerHandlers: (handlers: {
    onAddSet: (weight: number, reps: number, rir?: number) => void
    onSelectExercise: (exercise: Exercise) => void
  } | null) => void
}

const WorkoutDrawerContext = createContext<WorkoutDrawerContextType | undefined>(undefined)

export function WorkoutDrawerProvider({ children }: { children: ReactNode }) {
  const [handlers, setHandlers] = useState<{
    onAddSet: (weight: number, reps: number, rir?: number) => void
    onSelectExercise: (exercise: Exercise) => void
  } | null>(null)

  const setWorkoutDrawerHandlers = (newHandlers: typeof handlers) => {
    setHandlers(newHandlers)
  }

  return (
    <WorkoutDrawerContext.Provider
      value={{
        onAddSet: handlers?.onAddSet ?? null,
        onSelectExercise: handlers?.onSelectExercise ?? null,
        setWorkoutDrawerHandlers,
      }}
    >
      {children}
    </WorkoutDrawerContext.Provider>
  )
}

export function useWorkoutDrawer() {
  const context = useContext(WorkoutDrawerContext)
  if (!context) {
    throw new Error('useWorkoutDrawer must be used within WorkoutDrawerProvider')
  }
  return context
}
