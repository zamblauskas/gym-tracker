import { SetLog } from './setLog';

export interface ExerciseLog {
    id: string;
    exerciseId: string;
    exerciseTypeId: string;
    sets: SetLog[];
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}