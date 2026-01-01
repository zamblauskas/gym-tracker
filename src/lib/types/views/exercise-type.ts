import type { Range } from '$lib/types/range';

export interface Compact {
  id: string;
  name: string;
  exerciseCount: number;
}

export interface ExerciseDetail {
  id: string;
  name: string;
  machineBrand: string | null;
  targetRepRange: Range<number>;
  targetRepsInReserve: number | null;
}

export interface Detail {
  id: string;
  name: string;
  exercises: ExerciseDetail[];
}
