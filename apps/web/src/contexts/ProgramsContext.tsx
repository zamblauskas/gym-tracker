import { createContext, useContext, useMemo, ReactNode, useCallback } from 'react'
import { Program, CreateProgramInput } from '@/types/program'
import { usePersistedState } from '@/hooks/usePersistedState'
import { createProgramRepository } from '@/lib/repositories'
import {
  createProgram,
  updateEntity,
  updateInArray,
  removeFromArray,
  addToArray,
} from '@/lib/entityFactory'

interface ProgramsContextValue {
  // Data
  programs: Program[]
  isLoading: boolean

  // Program handlers
  handleCreateProgram: (input: CreateProgramInput) => Program
  handleEditProgram: (id: string, name: string) => boolean
  handleAddRoutineToProgram: (programId: string, routineId: string) => void
  handleRemoveRoutineFromProgram: (programId: string, routineId: string) => void
  handleDeleteProgram: (programId: string) => void
  handleUpdateProgramRoutines: (updater: (routineIds: string[]) => string[]) => void
}

const ProgramsContext = createContext<ProgramsContextValue | undefined>(undefined)

interface ProgramsProviderProps {
  children: ReactNode
}

export function ProgramsProvider({ children }: ProgramsProviderProps) {
  const programRepo = useMemo(() => createProgramRepository(), [])
  const [programs, setPrograms, isLoading] = usePersistedState<Program>(programRepo)

  const handleCreateProgram = useCallback((input: CreateProgramInput) => {
    const newProgram = createProgram(input)
    setPrograms(addToArray(programs, newProgram))
    return newProgram
  }, [programs, setPrograms])

  const handleEditProgram = useCallback((id: string, name: string) => {
    const existingProgram = programs.find(p => p.id === id)
    if (!existingProgram) return false

    setPrograms(
      updateInArray(programs, id, (p) => updateEntity({ ...p, name }))
    )
    return true
  }, [programs, setPrograms])

  const handleAddRoutineToProgram = useCallback((programId: string, routineId: string) => {
    setPrograms(
      updateInArray(programs, programId, (p) =>
        updateEntity({
          ...p,
          routineIds: addToArray(p.routineIds, routineId),
        })
      )
    )
  }, [programs, setPrograms])

  const handleRemoveRoutineFromProgram = useCallback((programId: string, routineId: string) => {
    setPrograms(
      updateInArray(programs, programId, (p) =>
        updateEntity({
          ...p,
          routineIds: p.routineIds.filter(id => id !== routineId),
        })
      )
    )
  }, [programs, setPrograms])

  const handleDeleteProgram = useCallback((programId: string) => {
    setPrograms(removeFromArray(programs, programId))
  }, [programs, setPrograms])

  const handleUpdateProgramRoutines = useCallback((
    updater: (routineIds: string[]) => string[]
  ) => {
    setPrograms(
      programs.map(program =>
        updateEntity({
          ...program,
          routineIds: updater(program.routineIds),
        })
      )
    )
  }, [programs, setPrograms])

  const contextValue = useMemo<ProgramsContextValue>(
    () => ({
      programs,
      isLoading,
      handleCreateProgram,
      handleEditProgram,
      handleAddRoutineToProgram,
      handleRemoveRoutineFromProgram,
      handleDeleteProgram,
      handleUpdateProgramRoutines,
    }),
    [
      programs,
      isLoading,
      handleCreateProgram,
      handleEditProgram,
      handleAddRoutineToProgram,
      handleRemoveRoutineFromProgram,
      handleDeleteProgram,
      handleUpdateProgramRoutines,
    ]
  )

  return <ProgramsContext.Provider value={contextValue}>{children}</ProgramsContext.Provider>
}

export function usePrograms(): ProgramsContextValue {
  const context = useContext(ProgramsContext)
  if (!context) {
    throw new Error('usePrograms must be used within ProgramsProvider')
  }
  return context
}
