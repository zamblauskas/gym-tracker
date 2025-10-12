export type ExerciseTypeId = string;

export interface ExerciseType {
  id: ExerciseTypeId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface CreateExerciseTypeInput {
  name: string;
}

export interface UpdateExerciseTypeInput {
  name?: string;
}
