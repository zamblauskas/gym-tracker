export interface SelectExercise {
  exerciseLogId: string;
  exerciseId: string;
}

export interface AddSet {
  exerciseLogId: string;
  reps: number;
  weight: number;
  repsInReserve: number | null;
}

export interface UpdateSet {
  reps: number;
  weight: number;
  repsInReserve: number | null;
}

export interface UpdateNotes {
  exerciseLogId: string;
  notes: string;
}
