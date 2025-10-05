export interface Exercise {
  id: string;
  name: string;
  machineBrand?: string;
  targetRepRange: string;
  targetRepsInReserve?: number;
  exerciseTypeId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateExerciseInput {
  name: string;
  machineBrand?: string;
  targetRepRange: string;
  targetRepsInReserve?: number;
  exerciseTypeId: string;
}

export interface UpdateExerciseInput {
  name?: string;
  machineBrand?: string;
  targetRepRange?: string;
  targetRepsInReserve?: number;
  exerciseTypeId?: string;
}
