import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
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
import { DRAWER_ROUTES, DRAWER_HEIGHT_CLASS } from '@/lib/constants'

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
  const location = useLocation()
  const navigate = useNavigate()

  // Detect drawer state from URL
  const isDrawerOpen = useMemo(() => {
    const path = location.pathname
    return !!(
      path === DRAWER_ROUTES.CREATE_EXERCISE_TYPE ||
      path.match(DRAWER_ROUTES.EDIT_EXERCISE_TYPE) ||
      path.match(DRAWER_ROUTES.CREATE_EXERCISE) ||
      path === DRAWER_ROUTES.CREATE_ROUTINE ||
      path.match(DRAWER_ROUTES.EDIT_ROUTINE) ||
      path.match(DRAWER_ROUTES.EDIT_PROGRAM_ROUTINE) ||
      path === DRAWER_ROUTES.CREATE_PROGRAM ||
      path.match(DRAWER_ROUTES.EDIT_PROGRAM)
    )
  }, [location.pathname])

  const getDrawerMode = () => {
    const path = location.pathname
    if (path === DRAWER_ROUTES.CREATE_EXERCISE_TYPE) return 'exerciseType'
    if (path.match(DRAWER_ROUTES.EDIT_EXERCISE_TYPE)) return 'editExerciseType'
    if (path.match(DRAWER_ROUTES.CREATE_EXERCISE)) return 'exercise'
    if (path === DRAWER_ROUTES.CREATE_ROUTINE) return 'routine'
    if (path.match(DRAWER_ROUTES.EDIT_ROUTINE)) return 'editRoutine'
    if (path.match(DRAWER_ROUTES.EDIT_PROGRAM_ROUTINE)) return 'editRoutine'
    if (path === DRAWER_ROUTES.CREATE_PROGRAM) return 'program'
    if (path.match(DRAWER_ROUTES.EDIT_PROGRAM)) return 'editProgram'
    return null
  }

  // Get current entity for drawer based on URL
  const getCurrentExerciseType = () => {
    const pathParts = location.pathname.split('/')
    if (pathParts[1] === 'exercise-types' && pathParts[2] && pathParts[2] !== 'new') {
      return exerciseTypes.find(et => et.id === pathParts[2])
    }
    return null
  }

  const getCurrentRoutine = () => {
    const pathParts = location.pathname.split('/')
    if (pathParts[1] === 'routines' && pathParts[2] && pathParts[2] !== 'new') {
      return routines.find(r => r.id === pathParts[2])
    }
    if (pathParts[1] === 'programs' && pathParts[4] === 'routines' && pathParts[5]) {
      return routines.find(r => r.id === pathParts[5])
    }
    return null
  }

  const getCurrentProgram = () => {
    const pathParts = location.pathname.split('/')
    if (pathParts[1] === 'programs' && pathParts[2] && pathParts[2] !== 'new') {
      return programs.find(p => p.id === pathParts[2])
    }
    return null
  }

  return (
    <Drawer.Root open={isDrawerOpen} onOpenChange={(open) => !open && navigate(-1)}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className={`bg-[hsl(var(--color-background))] flex flex-col rounded-t-[10px] ${DRAWER_HEIGHT_CLASS} mt-24 fixed bottom-0 left-0 right-0`}>
          <div className="p-4 bg-[hsl(var(--color-background))] rounded-t-[10px] flex-1 overflow-y-auto">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[hsl(var(--color-muted))] mb-8" />

            {getDrawerMode() === 'exerciseType' && (
              <>
                <Drawer.Title className="sr-only">Create Exercise Type</Drawer.Title>
                <Drawer.Description className="sr-only">
                  Add a new exercise type to your workout library
                </Drawer.Description>
                <CreateExerciseType
                  onSave={onCreateExerciseType}
                  onCancel={() => navigate(-1)}
                />
              </>
            )}

            {getDrawerMode() === 'exercise' && (() => {
              const exerciseType = getCurrentExerciseType()
              return exerciseType ? (
                <>
                  <Drawer.Title className="sr-only">Create Exercise</Drawer.Title>
                  <Drawer.Description className="sr-only">
                    Add a new exercise to {exerciseType.name}
                  </Drawer.Description>
                  <CreateExercise
                    exerciseTypeId={exerciseType.id}
                    onSave={onCreateExercise}
                    onCancel={() => navigate(-1)}
                  />
                </>
              ) : null
            })()}

            {getDrawerMode() === 'editExerciseType' && (() => {
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
                    onCancel={() => navigate(-1)}
                  />
                </>
              ) : null
            })()}

            {getDrawerMode() === 'routine' && (
              <>
                <Drawer.Title className="sr-only">Create Routine</Drawer.Title>
                <Drawer.Description className="sr-only">
                  Add a new routine to your workout program
                </Drawer.Description>
                <CreateRoutine
                  exerciseTypes={exerciseTypes}
                  onSave={onCreateRoutine}
                  onCancel={() => navigate(-1)}
                />
              </>
            )}

            {getDrawerMode() === 'editRoutine' && (() => {
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
                    onCancel={() => navigate(-1)}
                  />
                </>
              ) : null
            })()}

            {getDrawerMode() === 'program' && (
              <>
                <Drawer.Title className="sr-only">Create Program</Drawer.Title>
                <Drawer.Description className="sr-only">
                  Add a new program to organize your routines
                </Drawer.Description>
                <CreateProgram
                  routines={routines}
                  onSave={onCreateProgram}
                  onCancel={() => navigate(-1)}
                />
              </>
            )}

            {getDrawerMode() === 'editProgram' && (() => {
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
                    onCancel={() => navigate(-1)}
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
