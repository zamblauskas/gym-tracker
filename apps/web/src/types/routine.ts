export interface Routine {
  id: string;
  name: string;
  exerciseTypeIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoutineInput {
  name: string;
  exerciseTypeIds: string[];
}

export interface UpdateRoutineInput {
  name?: string;
  exerciseTypeIds?: string[];
}
