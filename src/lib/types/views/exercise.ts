import type { Range } from '$lib/types/range';

export interface Detail {
  id: string;
  name: string;
  machineBrand: string | null;
  targetRepRange: Range<number>;
  targetRepsInReserve: number | null;
  gyms: {
    id: string;
    name: string;
  }[];
  exerciseType: {
    id: string;
    name: string;
  };
}

export interface Compact {
  id: string;
  name: string;
  machineBrand: string | null;
}
