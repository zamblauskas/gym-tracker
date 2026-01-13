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
    targetRepRange: Range<number>;
    targetRepsInReserve: number | null;
  };
  exercise: {
    id: string;
    name: string;
    machineBrand: string | null;
    targetRepRange: Range<number>;
    targetRepsInReserve: number | null;
    gyms: {
      id: string;
      name: string;
    }[];
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
  exercise: ExerciseDetail;
  exerciseCount: number;
  status: Status;
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

export interface HistoryItem {
  id: string;
  routine: {
    name: string;
    program: {
      name: string;
    };
  };
  completedAt: Date;
}
