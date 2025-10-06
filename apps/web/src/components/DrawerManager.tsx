import { useNavigate, useSearchParams } from 'react-router-dom'
import { Drawer } from 'vaul'
import CreateExerciseType from '@/pages/CreateExerciseType'
import EditExerciseType from '@/pages/EditExerciseType'
import CreateExercise from '@/pages/CreateExercise'
import CreateRoutine from '@/pages/CreateRoutine'
import EditRoutine from '@/pages/EditRoutine'
import CreateProgram from '@/pages/CreateProgram'
import EditProgram from '@/pages/EditProgram'
import { ExerciseType } from '@/types/exerciseType'
import { CreateExerciseInput } from '@/types/exercise'
import { Routine, CreateRoutineInput } from '@/types/routine'
import { Program, CreateProgramInput } from '@/types/program'
import { DRAWER_HEIGHT_CLASS } from '@/lib/constants'

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
}: DrawerManagerProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Detect drawer state from query params
  const drawerMode = searchParams.get('drawer')
  const entityId = searchParams.get('id')
  const exerciseTypeId = searchParams.get('exerciseTypeId')

  const isDrawerOpen = !!drawerMode

  const closeDrawer = () => {
    navigate(-1)
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
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className={`bg-[hsl(var(--color-background))] flex flex-col rounded-t-[10px] ${DRAWER_HEIGHT_CLASS} mt-24 fixed bottom-0 left-0 right-0`}>
          <div className="p-4 bg-[hsl(var(--color-background))] rounded-t-[10px] flex-1 overflow-y-auto">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[hsl(var(--color-muted))] mb-8" />

            {drawerMode === 'createExerciseType' && (
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

            {drawerMode === 'createExercise' && exerciseTypeId && (
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

            {drawerMode === 'editExerciseType' && (() => {
              const exerciseType = getCurrentExerciseType()
              return exerciseType ? (
                <>
                  <Drawer.Title className="sr-only">Edit Exercise Type</Drawer.Title>
                  <Drawer.Description className="sr-only">
                    Update exercise type details
                  </Drawer.Description>
                  <EditExerciseType
                    exerciseType={exerciseType}
                    onSave={onEditExerciseType}
                    onCancel={closeDrawer}
                  />
                </>
              ) : null
            })()}

            {drawerMode === 'createRoutine' && (
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

            {drawerMode === 'editRoutine' && (() => {
              const routine = getCurrentRoutine()
              return routine ? (
                <>
                  <Drawer.Title className="sr-only">Edit Routine</Drawer.Title>
                  <Drawer.Description className="sr-only">
                    Update routine details
                  </Drawer.Description>
                  <EditRoutine
                    routine={routine}
                    onSave={onEditRoutine}
                    onCancel={closeDrawer}
                  />
                </>
              ) : null
            })()}

            {drawerMode === 'createProgram' && (
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

            {drawerMode === 'editProgram' && (() => {
              const program = getCurrentProgram()
              return program ? (
                <>
                  <Drawer.Title className="sr-only">Edit Program</Drawer.Title>
                  <Drawer.Description className="sr-only">
                    Update program details
                  </Drawer.Description>
                  <EditProgram
                    program={program}
                    onSave={onEditProgram}
                    onCancel={closeDrawer}
                  />
                </>
              ) : null
            })()}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
