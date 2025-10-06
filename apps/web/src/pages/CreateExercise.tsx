import { CreateExerciseInput } from '@/types/exercise'
import { ExerciseForm } from '@/components/ExerciseForm'

interface CreateExerciseProps {
  exerciseTypeId: string
  onSave: (input: CreateExerciseInput) => void
  onCancel: () => void
}

export default function CreateExercise({ exerciseTypeId, onSave, onCancel }: CreateExerciseProps) {
  return (
    <ExerciseForm
      mode="create"
      exerciseTypeId={exerciseTypeId}
      onSubmit={onSave}
      onCancel={onCancel}
    />
  )
}
