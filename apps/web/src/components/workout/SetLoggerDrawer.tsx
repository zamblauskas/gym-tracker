import { useState } from 'react'
import { Drawer } from 'vaul'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Exercise } from '@/types/exercise'

interface SetLoggerDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  exercise: Exercise
  onAddSet: (weight: number, reps: number, rir?: number) => void
}

export function SetLoggerDrawer({ open, onOpenChange, exercise, onAddSet }: SetLoggerDrawerProps) {
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [rir, setRir] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (weight && reps) {
      onAddSet(
        parseFloat(weight),
        parseInt(reps),
        rir ? parseInt(rir) : undefined
      )
      setWeight('')
      setReps('')
      setRir('')
      onOpenChange(false)
    }
  }

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="bg-[hsl(var(--color-background))] flex flex-col rounded-t-[10px] h-[70%] mt-24 fixed bottom-0 left-0 right-0">
          <div className="p-4 bg-[hsl(var(--color-background))] rounded-t-[10px] flex-1 overflow-y-auto">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[hsl(var(--color-muted))] mb-8" />
            <Drawer.Title className="text-2xl font-bold mb-2">
              Add Set
            </Drawer.Title>
            <Drawer.Description className="text-[hsl(var(--color-muted-foreground))] mb-6">
              {exercise.name}
              {exercise.targetRepRange && ` • Target: ${exercise.targetRepRange} reps`}
              {exercise.targetRepsInReserve !== undefined && ` @ ${exercise.targetRepsInReserve} RIR`}
            </Drawer.Description>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g., 20"
                  required
                  autoFocus
                  className="h-12 text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reps">Reps</Label>
                <Input
                  id="reps"
                  type="number"
                  min="1"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  placeholder="e.g., 12"
                  required
                  className="h-12 text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rir">RIR (Optional)</Label>
                <Input
                  id="rir"
                  type="number"
                  min="0"
                  max="10"
                  value={rir}
                  onChange={(e) => setRir(e.target.value)}
                  placeholder="e.g., 2"
                  className="h-12 text-lg"
                />
                <p className="text-xs text-[hsl(var(--color-muted-foreground))]">
                  Reps in reserve (0-10)
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1 h-12" size="lg">
                  Save Set
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 h-12"
                  size="lg"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
