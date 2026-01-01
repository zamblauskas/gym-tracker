import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/supabase/types';
import type { ExerciseInsert, ExerciseUpdate } from '$lib/supabase/client';
import type { Exercise } from '$lib/types/commands';

export class ExerciseCommandService {
  constructor(private client: SupabaseClient<Database>) {}

  async createExercise(input: Exercise.Create): Promise<string> {
    const exerciseInsert: ExerciseInsert = {
      exercise_type_id: input.exerciseTypeId,
      name: input.name,
      machine_brand: input.machineBrand,
      target_rep_range_min: input.targetRepRange.min,
      target_rep_range_max: input.targetRepRange.max,
      target_reps_in_reserve: input.targetRepsInReserve
    };

    const { data, error } = await this.client
      .from('exercises')
      .insert(exerciseInsert as Database['public']['Tables']['exercises']['Insert'])
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to create exercise: ${error.message}`);
    }

    return data.id;
  }

  async updateExercise(exerciseId: string, input: Exercise.Update): Promise<void> {
    const exerciseUpdate: ExerciseUpdate = {
      name: input.name,
      machine_brand: input.machineBrand,
      target_rep_range_min: input.targetRepRange.min,
      target_rep_range_max: input.targetRepRange.max,
      target_reps_in_reserve: input.targetRepsInReserve
    };

    const { error } = await this.client
      .from('exercises')
      .update(exerciseUpdate)
      .eq('id', exerciseId)
      .is('deleted_at', null);

    if (error) {
      throw new Error(`Failed to update exercise: ${error.message}`);
    }
  }

  async deleteExercise(exerciseId: string): Promise<void> {
    const { error } = await this.client
      .from('exercises')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', exerciseId)
      .is('deleted_at', null);

    if (error) {
      throw new Error(`Failed to delete exercise: ${error.message}`);
    }
  }
}
