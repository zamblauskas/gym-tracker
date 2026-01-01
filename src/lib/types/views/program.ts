export interface Compact {
  id: string;
  name: string;
  routineCount: number;
}

export interface RoutineDetail {
  id: string;
  name: string;
  position: string;
}

export interface Detail {
  id: string;
  name: string;
  routines: RoutineDetail[];
}
