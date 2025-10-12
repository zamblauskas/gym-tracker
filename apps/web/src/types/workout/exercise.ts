import { Range } from '../range';

export type ExerciseId = string;

export interface Exercise {
  id: ExerciseId;
  name: string;
  machineBrand?: string;
  targetRepRange: Range<number>;
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
