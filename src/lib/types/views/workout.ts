import type { Range } from '$lib/types/range';

export enum Status {
  InProgress = 'in_progress',
  Completed = 'completed',
  Cancelled = 'cancelled'
}

export interface SetDetail {
  id: string;
  weight: number;
  reps: number;
  repsInReserve: number | null;
}

export interface ExerciseHistory {
  workoutExerciseId: string;
  workoutDate: Date;
  sets: SetDetail[];
  notes: string | null;
}

export interface ExerciseDetail {
  id: string;
  exerciseType: {
    id: string;
    name: string;
  };
  exercise: {
    id: string;
    name: string;
    machineBrand: string | null;
    targetRepRange: Range<number>;
    targetRepsInReserve: number | null;
  } | null;
  sets: SetDetail[];
  notes: string | null;
}

export interface Detail {
  id: string;
  routine: {
    name: string;
    program: {
      name: string;
    };
  };
  exercises: ExerciseDetail[];
  status: Status;
  exerciseCount: number;
  completedExerciseCount: number;
}

export interface Compact {
  id: string;
  routine: {
    name: string;
    program: {
      name: string;
    };
  };
  status: Status;
  exerciseCount: number;
  completedExerciseCount: number;
  createdAt: Date;
}
