import { ExerciseType, ExerciseTypeId, CreateExerciseTypeInput, UpdateExerciseTypeInput } from '../../types/workout/exerciseType';

export interface ExerciseTypeRepository {
    findById(id: ExerciseTypeId): Promise<ExerciseType | null>;
    findAll(): Promise<ExerciseType[]>;
    create(data: CreateExerciseTypeInput): Promise<ExerciseType>;
    update(id: ExerciseTypeId, data: UpdateExerciseTypeInput): Promise<ExerciseType | null>;
    delete(id: ExerciseTypeId): Promise<boolean>;
}