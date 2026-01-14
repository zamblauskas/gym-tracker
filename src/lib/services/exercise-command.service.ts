import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/supabase/types';
import type { ExerciseInsert, ExerciseUpdate, ExerciseGymInsert } from '$lib/supabase/client';
import type { Exercise } from '$lib/types/commands';

export class ExerciseCommandService {
  constructor(private client: SupabaseClient<Database>) {}

  async createExercise(input: Exercise.Create): Promise<string> {
    const exerciseInsert: ExerciseInsert = {
      exercise_type_id: input.exerciseTypeId,
      name: input.name,
      machine_brand: input.machineBrand,
      notes: input.notes,
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

    if (input.gymIds.length > 0) {
      await this.updateExerciseGyms(data.id, input.gymIds);
    }

    return data.id;
  }

  async updateExercise(exerciseId: string, input: Exercise.Update): Promise<void> {
    await Promise.all([
      this.updateExerciseData(exerciseId, input),
      this.updateExerciseGyms(exerciseId, input.gymIds)
    ]);
  }

  private async updateExerciseData(exerciseId: string, input: Exercise.Update): Promise<void> {
    const exerciseUpdate: ExerciseUpdate = {
      name: input.name,
      machine_brand: input.machineBrand,
      notes: input.notes,
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

  private async updateExerciseGyms(exerciseId: string, gymIds: string[]): Promise<void> {
    await this.deleteExerciseGyms(exerciseId);

    if (gymIds.length === 0) return;

    const rows: ExerciseGymInsert[] = gymIds.map((gymId) => ({
      exercise_id: exerciseId,
      gym_id: gymId
    }));

    const { error } = await this.client
      .from('exercise_gyms')
      .insert(rows as Database['public']['Tables']['exercise_gyms']['Insert'][]);

    if (error) {
      throw new Error(`Failed to update exercise gyms: ${error.message}`);
    }
  }

  private async deleteExerciseGyms(exerciseId: string): Promise<void> {
    const { error } = await this.client
      .from('exercise_gyms')
      .delete()
      .eq('exercise_id', exerciseId);

    if (error) {
      throw new Error(`Failed to delete exercise gyms: ${error.message}`);
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
