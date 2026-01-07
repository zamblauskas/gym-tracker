import type { Range } from '$lib/types/range';

export interface Create {
  exerciseTypeId: string;
  name: string;
  machineBrand: string | null;
  targetRepRange: Range<number>;
  targetRepsInReserve: number | null;
  gymIds: string[];
}

export interface Update {
  name: string;
  machineBrand: string | null;
  targetRepRange: Range<number>;
  targetRepsInReserve: number | null;
  gymIds: string[];
}
