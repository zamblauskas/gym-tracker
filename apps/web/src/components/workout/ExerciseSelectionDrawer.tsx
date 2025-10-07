import { Drawer } from 'vaul'
import { Card } from '@/components/ui/card'
import { Exercise } from '@/types/exercise'
import { ExerciseType } from '@/types/exerciseType'

interface ExerciseSelectionDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  exerciseType: ExerciseType
  availableExercises: Exercise[]
  onSelectExercise: (exercise: Exercise) => void
}

/**
 * Content-only component for ExerciseSelection drawer
 * Designed to be rendered within DrawerManager's Drawer.Root wrapper
 */
export function ExerciseSelectionDrawerContent({
  exerciseType,
  availableExercises,
  onSelectExercise
}: {
  exerciseType: ExerciseType
  availableExercises: Exercise[]
  onSelectExercise: (exercise: Exercise) => void
}) {
  return (
    <>
      <Drawer.Title className="text-2xl font-bold mb-6">
        Select Exercise
      </Drawer.Title>
      <Drawer.Description className="sr-only">
        Choose an exercise for {exerciseType.name}
      </Drawer.Description>

      {availableExercises.length === 0 ? (
        <p className="text-[hsl(var(--color-muted-foreground))] text-center py-8">
          No exercises available. Create one first.
        </p>
      ) : (
        <div className="space-y-2">
          {availableExercises.map((exercise) => (
            <button
              key={exercise.id}
              onClick={() => onSelectExercise(exercise)}
              className="w-full text-left"
            >
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer hover:bg-[hsl(var(--color-accent))]">
                <h3 className="text-lg font-medium mb-1">
                  {exercise.name}
                </h3>
                <div className="flex gap-3 text-sm text-[hsl(var(--color-muted-foreground))]">
                  {exercise.machineBrand && <span>{exercise.machineBrand}</span>}
                  <span>Target: {exercise.targetRepRange} reps</span>
                  {exercise.targetRepsInReserve !== undefined && (
                    <span>{exercise.targetRepsInReserve} RIR</span>
                  )}
                </div>
              </Card>
            </button>
          ))}
        </div>
      )}
    </>
  )
}

/**
 * Standalone ExerciseSelection drawer with its own Drawer.Root wrapper
 * @deprecated Use ExerciseSelectionDrawerContent with DrawerManager instead
 * Kept for backward compatibility only
 */
export function ExerciseSelectionDrawer({
  open,
  onOpenChange,
  exerciseType,
  availableExercises,
  onSelectExercise
}: ExerciseSelectionDrawerProps) {
  const handleSelect = (exercise: Exercise) => {
    onSelectExercise(exercise)
    onOpenChange(false)
  }

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="bg-[hsl(var(--color-background))] flex flex-col rounded-t-[10px] h-[70%] mt-24 fixed bottom-0 left-0 right-0">
          <div className="p-4 bg-[hsl(var(--color-background))] rounded-t-[10px] flex-1 overflow-y-auto">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[hsl(var(--color-muted))] mb-8" />
            <ExerciseSelectionDrawerContent
              exerciseType={exerciseType}
              availableExercises={availableExercises}
              onSelectExercise={handleSelect}
            />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
