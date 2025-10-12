import { ExerciseLog } from './exerciseLog';
import { ExerciseTypeId } from '../workout/exerciseType';

export type WorkoutSessionStatus = 'in-progress' | 'completed' | 'skipped';

export interface WorkoutSession {
    id: string;
    programId: string;
    routineId: string;
    exerciseLogs: Record<ExerciseTypeId, ExerciseLog[]>;
    status: WorkoutSessionStatus;
    endTime?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateWorkoutSessionInput {
    programId?: string;
    routineId: string;
}

export interface UpdateWorkoutSessionInput {
    exerciseLogs?: Record<ExerciseTypeId, ExerciseLog[]>;
    status?: WorkoutSessionStatus;
}