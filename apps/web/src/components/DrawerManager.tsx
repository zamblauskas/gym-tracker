import { useSearchParams, useLocation, useNavigate } from 'react-router-dom'
import { Drawer } from 'vaul'
import CreateExerciseType from '@/pages/CreateExerciseType'
import EditExerciseType from '@/pages/EditExerciseType'
import CreateExercise from '@/pages/CreateExercise'
import CreateRoutine from '@/pages/CreateRoutine'
import EditRoutine from '@/pages/EditRoutine'
import CreateProgram from '@/pages/CreateProgram'
import EditProgram from '@/pages/EditProgram'
import { SetLoggerDrawerContent } from '@/components/workout/SetLoggerDrawer'
import { ExerciseSelectionDrawerContent } from '@/components/workout/ExerciseSelectionDrawer'
import { useWorkoutDrawer } from '@/contexts/WorkoutDrawerContext'
import { ExerciseType } from '@/types/exerciseType'
import { CreateExerciseInput, Exercise } from '@/types/exercise'
import { Routine, CreateRoutineInput } from '@/types/routine'
import { Program, CreateProgramInput } from '@/types/program'
import { DRAWER_HEIGHT_CLASS, DRAWER_MODE } from '@/lib/constants'

export interface DrawerManagerProps {
  exerciseTypes: ExerciseType[]
  routines: Routine[]
  programs: Program[]
  exercises: Exercise[]
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
  exercises,
  onCreateExerciseType,
  onEditExerciseType,
  onCreateExercise,
  onCreateRoutine,
  onEditRoutine,
  onCreateProgram,
  onEditProgram,
}: DrawerManagerProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { onAddSet, onSelectExercise } = useWorkoutDrawer()

  // Detect drawer state from query params
  const drawerMode = searchParams.get('drawer')
  const entityId = searchParams.get('id')
  const exerciseTypeId = searchParams.get('exerciseTypeId')
  const exerciseId = searchParams.get('exerciseId')

  // All drawers are now handled by DrawerManager
  const isDrawerOpen = !!drawerMode

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
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className={`bg-[hsl(var(--color-background))] flex flex-col rounded-t-[10px] ${DRAWER_HEIGHT_CLASS} mt-24 fixed bottom-0 left-0 right-0`}>
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

            {drawerMode === DRAWER_MODE.SET_LOGGER && exerciseId && onAddSet && (() => {
              const exercise = exercises.find(ex => ex.id === exerciseId)
              return exercise ? (
                <>
                  <Drawer.Title className="sr-only">Add Set</Drawer.Title>
                  <Drawer.Description className="sr-only">
                    Log a new set for {exercise.name}
                  </Drawer.Description>
                  <SetLoggerDrawerContent
                    exercise={exercise}
                    onAddSet={onAddSet}
                    onCancel={closeDrawer}
                  />
                </>
              ) : null
            })()}

            {drawerMode === DRAWER_MODE.EXERCISE_SELECTION && exerciseTypeId && onSelectExercise && (() => {
              const exerciseType = exerciseTypes.find(et => et.id === exerciseTypeId)
              const availableExercises = exercises.filter(ex => ex.exerciseTypeId === exerciseTypeId)
              return exerciseType ? (
                <>
                  <Drawer.Title className="sr-only">Select Exercise</Drawer.Title>
                  <Drawer.Description className="sr-only">
                    Choose an exercise for {exerciseType.name}
                  </Drawer.Description>
                  <ExerciseSelectionDrawerContent
                    exerciseType={exerciseType}
                    availableExercises={availableExercises}
                    onSelectExercise={onSelectExercise}
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
