import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
    ExerciseType,
    ExerciseTypeId,
    CreateExerciseTypeInput,
    UpdateExerciseTypeInput,
} from '../../types/workout/exerciseType';
import { ExerciseTypeRepository } from './types';

interface ExerciseTypeRow {
    id: string;
    user_id: string;
    name: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export class SupabaseExerciseTypeRepository implements ExerciseTypeRepository {
    private client: SupabaseClient;

    constructor(supabaseUrl: string, supabaseAnonKey: string) {
        this.client = createClient(supabaseUrl, supabaseAnonKey);
    }

    private rowToEntity(row: ExerciseTypeRow): ExerciseType {
        return {
            id: row.id,
            name: row.name,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
            deletedAt: row.deleted_at ? new Date(row.deleted_at) : undefined,
        };
    }

    async findById(id: ExerciseTypeId): Promise<ExerciseType | null> {
        const { data, error } = await this.client
            .from('exercise_types')
            .select('*')
            .eq('id', id)
            .is('deleted_at', null)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // No rows returned
                return null;
            }
            throw new Error(`Failed to fetch exercise type: ${error.message}`);
        }

        return this.rowToEntity(data as ExerciseTypeRow);
    }

    async findAll(): Promise<ExerciseType[]> {
        const { data, error } = await this.client
            .from('exercise_types')
            .select('*')
            .is('deleted_at', null);

        if (error) {
            throw new Error(`Failed to fetch exercise types: ${error.message}`);
        }

        return (data as ExerciseTypeRow[]).map(this.rowToEntity);
    }

    async create(input: CreateExerciseTypeInput): Promise<ExerciseType> {
        const { data: { user } } = await this.client.auth.getUser();

        if (!user) {
            throw new Error('User must be authenticated to create exercise type');
        }

        const { data, error } = await this.client
            .from('exercise_types')
            .insert({
                user_id: user.id,
                name: input.name,
            })
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to create exercise type: ${error.message}`);
        }

        return this.rowToEntity(data as ExerciseTypeRow);
    }

    async update(
        id: ExerciseTypeId,
        input: UpdateExerciseTypeInput
    ): Promise<ExerciseType | null> {
        const updateData: Partial<Record<string, unknown>> = {};
        if (input.name !== undefined) {
            updateData.name = input.name;
        }

        if (Object.keys(updateData).length === 0) {
            return this.findById(id);
        }

        const { data, error } = await this.client
            .from('exercise_types')
            .update(updateData)
            .eq('id', id)
            .is('deleted_at', null)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // No rows updated (not found or soft-deleted)
                return null;
            }
            throw new Error(`Failed to update exercise type: ${error.message}`);
        }

        return this.rowToEntity(data as ExerciseTypeRow);
    }

    async delete(id: ExerciseTypeId): Promise<boolean> {
        const { data, error } = await this.client
            .from('exercise_types')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id)
            .is('deleted_at', null)
            .select('id')
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // No rows updated (not found or already deleted)
                return false;
            }
            throw new Error(`Failed to delete exercise type: ${error.message}`);
        }

        return !!data;
    }
}