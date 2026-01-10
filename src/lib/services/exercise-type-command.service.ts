import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/supabase/types';
import type { ExerciseTypeInsert, ExerciseTypeUpdate } from '$lib/supabase/client';
import type { ExerciseType } from '$lib/types/commands';

export class ExerciseTypeCommandService {
  constructor(private client: SupabaseClient<Database>) {}

  async createExerciseType(input: ExerciseType.Create): Promise<string> {
    const exerciseTypeInsert: ExerciseTypeInsert = {
      name: input.name,
      target_rep_range_min: input.targetRepRange.min,
      target_rep_range_max: input.targetRepRange.max,
      target_reps_in_reserve: input.targetRepsInReserve
    };

    const { data, error } = await this.client
      .from('exercise_types')
      .insert(exerciseTypeInsert as Database['public']['Tables']['exercise_types']['Insert'])
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to create exercise type: ${error.message}`);
    }

    return data.id;
  }

  async updateExerciseType(exerciseTypeId: string, input: ExerciseType.Update): Promise<void> {
    const exerciseTypeUpdate: ExerciseTypeUpdate = {
      name: input.name,
      target_rep_range_min: input.targetRepRange.min,
      target_rep_range_max: input.targetRepRange.max,
      target_reps_in_reserve: input.targetRepsInReserve
    };

    const { error } = await this.client
      .from('exercise_types')
      .update(exerciseTypeUpdate)
      .eq('id', exerciseTypeId)
      .is('deleted_at', null);

    if (error) {
      throw new Error(`Failed to update exercise type: ${error.message}`);
    }
  }

  async deleteExerciseType(id: string): Promise<void> {
    const { error } = await this.client
      .from('exercise_types')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null);

    if (error) {
      throw new Error(`Failed to delete exercise type: ${error.message}`);
    }
  }
}
