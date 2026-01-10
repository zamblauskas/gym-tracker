import type { Range } from '$lib/types/range';

export interface Create {
  name: string;
  targetRepRange: Range<number>;
  targetRepsInReserve: number | null;
}

export interface Update {
  name: string;
  targetRepRange: Range<number>;
  targetRepsInReserve: number | null;
}
