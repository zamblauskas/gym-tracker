export interface Create {
  programId: string;
  name: string;
}

export interface Update {
  name: string;
  exerciseTypeIds: string[];
}

export interface UpdatePositions {
  programId: string;
  orderedRoutineIds: string[];
}
