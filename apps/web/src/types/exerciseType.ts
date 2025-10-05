export interface ExerciseType {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateExerciseTypeInput {
  name: string;
}

export interface UpdateExerciseTypeInput {
  name?: string;
}
