import { useSearchParams, useLocation, useNavigate } from 'react-router-dom'
import { Drawer } from 'vaul'
import CreateExerciseType from '@/pages/CreateExerciseType'
import EditExerciseType from '@/pages/EditExerciseType'
import CreateExercise from '@/pages/CreateExercise'
import CreateRoutine from '@/pages/CreateRoutine'
import EditRoutine from '@/pages/EditRoutine'
import CreateProgram from '@/pages/CreateProgram'
import EditProgram from '@/pages/EditProgram'
import { DrawerErrorState } from '@/components/ui/DrawerErrorState'
import { ExerciseType } from '@/types/exerciseType'
import { CreateExerciseInput } from '@/types/exercise'
import { Routine, CreateRoutineInput } from '@/types/routine'
import { Program, CreateProgramInput } from '@/types/program'
import { DRAWER_HEIGHT_CLASS, DRAWER_MODE, Z_INDEX } from '@/lib/constants'

export interface DrawerManagerProps {
  exerciseTypes: ExerciseType[]
  routines: Routine[]
  programs: Program[]
  onCreateExerciseType: (name: string) => void
  onEditExerciseType: (id: string, name: string) => void
  onCreateExercise: (input: CreateExerciseInput) => void
  onCreateRoutine: (input: CreateRoutineInput) => void
  onEditRoutine: (id: string, name: string) => void
  onCreateProgram: (input: CreateProgramInput) => void
  onEditProgram: (id: string, name: string) => void
  onAddExerciseTypeToRoutine: (routineId: string, exerciseTypeId: string) => void
}

export function DrawerManager({
  exerciseTypes,
  routines,
  programs,
  onCreateExerciseType,
  onEditExerciseType,
  onCreateExercise,
  onCreateRoutine,
  onEditRoutine,
  onCreateProgram,
  onEditProgram,
  onAddExerciseTypeToRoutine,
}: DrawerManagerProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  // Detect drawer state from query params
  const drawerMode = searchParams.get('drawer')
  const entityId = searchParams.get('id')
  const exerciseTypeId = searchParams.get('exerciseTypeId')
  const routineId = searchParams.get('routineId')

  // Only handle drawers that DrawerManager is responsible for
  // This prevents DrawerManager from opening when ActiveWorkout's in-page drawers are triggered
  // (SET_LOGGER and EXERCISE_SELECTION are handled by ActiveWorkout's local Drawer.Root)
  const managedDrawerModes = [
    DRAWER_MODE.CREATE_EXERCISE_TYPE,
    DRAWER_MODE.EDIT_EXERCISE_TYPE,
    DRAWER_MODE.CREATE_EXERCISE,
    DRAWER_MODE.CREATE_ROUTINE,
    DRAWER_MODE.EDIT_ROUTINE,
    DRAWER_MODE.CREATE_PROGRAM,
    DRAWER_MODE.EDIT_PROGRAM,
    DRAWER_MODE.ADD_EXERCISE_TYPE_TO_ROUTINE,
  ]
  const isDrawerOpen = !!drawerMode && managedDrawerModes.includes(drawerMode as any)

  /**
   * Close drawer using replace: true to prevent back button from reopening
   * This ensures good back button UX
   */
  const closeDrawer = () => {
    navigate(location.pathname, { replace: true })
  }

  // Get current entity for drawer based on query params
  const getCurrentExerciseType = () => {
    if (!entityId) return null
    return exerciseTypes.find(et => et.id === entityId)
  }

  const getCurrentRoutine = () => {
    if (!entityId) return null
    return routines.find(r => r.id === entityId)
  }

  const getCurrentProgram = () => {
    if (!entityId) return null
    return programs.find(p => p.id === entityId)
  }

  return (
    <Drawer.Root open={isDrawerOpen} onOpenChange={(open) => !open && closeDrawer()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[var(--z-drawer-overlay)]" style={{ '--z-drawer-overlay': Z_INDEX.DRAWER_OVERLAY } as React.CSSProperties} />
        <Drawer.Content className={`bg-[hsl(var(--color-background))] flex flex-col rounded-t-[10px] ${DRAWER_HEIGHT_CLASS} mt-24 fixed bottom-0 left-0 right-0 z-[var(--z-drawer-content)]`} style={{ '--z-drawer-content': Z_INDEX.DRAWER_CONTENT } as React.CSSProperties}>
          <div className="p-4 bg-[hsl(var(--color-background))] rounded-t-[10px] flex-1 overflow-y-auto">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[hsl(var(--color-muted))] mb-8" />

            {drawerMode === DRAWER_MODE.CREATE_EXERCISE_TYPE && (
              <>
                <Drawer.Title className="sr-only">Create Exercise Type</Drawer.Title>
                <Drawer.Description className="sr-only">
                  Add a new exercise type to your workout library
                </Drawer.Description>
                <CreateExerciseType
                  onSave={onCreateExerciseType}
                  onCancel={closeDrawer}
                />
              </>
            )}

            {drawerMode === DRAWER_MODE.CREATE_EXERCISE && exerciseTypeId && (
              <>
                <Drawer.Title className="sr-only">Create Exercise</Drawer.Title>
                <Drawer.Description className="sr-only">
                  Add a new exercise
                </Drawer.Description>
                <CreateExercise
                  exerciseTypeId={exerciseTypeId}
                  onSave={onCreateExercise}
                  onCancel={closeDrawer}
                />
              </>
            )}

            {drawerMode === DRAWER_MODE.EDIT_EXERCISE_TYPE && (() => {
              const exerciseType = getCurrentExerciseType()

              return (
                <>
                  <Drawer.Title className="sr-only">Edit Exercise Type</Drawer.Title>
                  <Drawer.Description className="sr-only">
                    Update exercise type details
                  </Drawer.Description>

                  {exerciseType ? (
                    <EditExerciseType
                      exerciseType={exerciseType}
                      onSave={onEditExerciseType}
                      onCancel={closeDrawer}
                    />
                  ) : (
                    <DrawerErrorState
                      message="The exercise type could not be found. It may have been deleted."
                      onClose={closeDrawer}
                    />
                  )}
                </>
              )
            })()}

            {drawerMode === DRAWER_MODE.CREATE_ROUTINE && (
              <>
                <Drawer.Title className="sr-only">Create Routine</Drawer.Title>
                <Drawer.Description className="sr-only">
                  Add a new routine to your workout program
                </Drawer.Description>
                <CreateRoutine
                  exerciseTypes={exerciseTypes}
                  onSave={onCreateRoutine}
                  onCancel={closeDrawer}
                />
              </>
            )}

            {drawerMode === DRAWER_MODE.EDIT_ROUTINE && (() => {
              const routine = getCurrentRoutine()

              return (
                <>
                  <Drawer.Title className="sr-only">Edit Routine</Drawer.Title>
                  <Drawer.Description className="sr-only">
                    Update routine details
                  </Drawer.Description>

                  {routine ? (
                    <EditRoutine
                      routine={routine}
                      onSave={onEditRoutine}
                      onCancel={closeDrawer}
                    />
                  ) : (
                    <DrawerErrorState
                      message="The routine could not be found. It may have been deleted."
                      onClose={closeDrawer}
                    />
                  )}
                </>
              )
            })()}

            {drawerMode === DRAWER_MODE.CREATE_PROGRAM && (
              <>
                <Drawer.Title className="sr-only">Create Program</Drawer.Title>
                <Drawer.Description className="sr-only">
                  Add a new program to organize your routines
                </Drawer.Description>
                <CreateProgram
                  routines={routines}
                  onSave={onCreateProgram}
                  onCancel={closeDrawer}
                />
              </>
            )}

            {drawerMode === DRAWER_MODE.EDIT_PROGRAM && (() => {
              const program = getCurrentProgram()

              return (
                <>
                  <Drawer.Title className="sr-only">Edit Program</Drawer.Title>
                  <Drawer.Description className="sr-only">
                    Update program details
                  </Drawer.Description>

                  {program ? (
                    <EditProgram
                      program={program}
                      onSave={onEditProgram}
                      onCancel={closeDrawer}
                    />
                  ) : (
                    <DrawerErrorState
                      message="The program could not be found. It may have been deleted."
                      onClose={closeDrawer}
                    />
                  )}
                </>
              )
            })()}

            {drawerMode === DRAWER_MODE.ADD_EXERCISE_TYPE_TO_ROUTINE && routineId && (() => {
              const routine = routines.find(r => r.id === routineId)
              if (!routine) return null
              const availableExerciseTypes = exerciseTypes.filter(et => !routine.exerciseTypeIds.includes(et.id))

              const handleAdd = (exerciseTypeId: string) => {
                onAddExerciseTypeToRoutine(routineId, exerciseTypeId)
                closeDrawer()
              }

              return (
                <>
                  <Drawer.Title className="text-2xl font-bold mb-6">
                    Add Exercise Type
                  </Drawer.Title>
                  <Drawer.Description className="sr-only">
                    Select an exercise type to add to this routine
                  </Drawer.Description>

                  {availableExerciseTypes.length === 0 ? (
                    <p className="text-[hsl(var(--color-muted-foreground))] text-center py-8">
                      All exercise types have been added to this routine.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {availableExerciseTypes.map((exerciseType) => (
                        <button
                          key={exerciseType.id}
                          onClick={() => handleAdd(exerciseType.id)}
                          className="w-full text-left"
                        >
                          <div className="p-4 rounded-lg border border-[hsl(var(--color-border))] hover:shadow-md transition-shadow cursor-pointer hover:bg-[hsl(var(--color-accent))]">
                            <h3 className="text-lg font-medium">
                              {exerciseType.name}
                            </h3>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )
            })()}

            {/* Workout drawers (SET_LOGGER, EXERCISE_SELECTION) are handled in ActiveWorkout component */}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
