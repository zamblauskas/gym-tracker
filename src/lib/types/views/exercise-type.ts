import type { Range } from '$lib/types/range';

export interface Compact {
  id: string;
  name: string;
  exerciseCount: number;
  targetRepRange: Range<number>;
  targetRepsInReserve: number | null;
}

export interface ExerciseDetail {
  id: string;
  name: string;
  machineBrand: string | null;
  targetRepRange: Range<number>;
  targetRepsInReserve: number | null;
  gyms: {
    id: string;
    name: string;
  }[];
}

export interface Detail {
  id: string;
  name: string;
  targetRepRange: Range<number>;
  targetRepsInReserve: number | null;
  exercises: ExerciseDetail[];
}
