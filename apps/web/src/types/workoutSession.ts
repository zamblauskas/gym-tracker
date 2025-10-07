export interface SetLog {
  id: string;
  weight: number; // in kg
  reps: number;
  rir?: number; // Reps in Reserve (optional)
  createdAt: Date;
}

export interface ExerciseLog {
  id: string;
  exerciseId: string; // Reference to the Exercise
  exerciseTypeId: string; // Reference to the ExerciseType
  sets: SetLog[];
  notes?: string;
  createdAt: Date;
}

export interface WorkoutSession {
  id: string;
  programId?: string; // Reference to the Program (optional)
  routineId: string; // Reference to the Routine
  exerciseLogs: ExerciseLog[];
  exerciseSelections?: Record<number, string>; // Map of exercise type index -> selected exercise ID
  status: 'in-progress' | 'completed' | 'skipped'; // Workout session status
  startTime: Date;
  endTime?: Date; // Only set when status is 'completed' or 'skipped'
  duration?: number; // in minutes (only for completed/skipped)
  totalVolume?: number; // total kg lifted (only for completed/skipped)
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWorkoutSessionInput {
  programId?: string;
  routineId: string;
}

export interface UpdateWorkoutSessionInput {
  exerciseLogs?: ExerciseLog[];
  endTime?: Date;
  duration?: number;
  totalVolume?: number;
}
