import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/supabase/types';
import * as Exercise from '$lib/types/views/exercise';

export class ExerciseViewService {
  constructor(private client: SupabaseClient<Database>) {}

  async getExerciseDetailById(exerciseId: string): Promise<Exercise.Detail> {
    const { data, error } = await this.client
      .from('exercises')
      .select(
        `id,
        name,
        machine_brand,
        target_rep_range_min,
        target_rep_range_max,
        target_reps_in_reserve,
        exercise_types!inner(id,name),
        gyms(id, name)`
      )
      .eq('id', exerciseId)
      .is('deleted_at', null)
      .is('exercise_types.deleted_at', null)
      .is('gyms.deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Exercise not found');
      }
      throw new Error(`Failed to load exercise: ${error.message}`);
    }

    const exercise: Exercise.Detail = {
      id: data.id,
      name: data.name,
      exerciseType: {
        id: data.exercise_types.id,
        name: data.exercise_types.name
      },
      machineBrand: data.machine_brand,
      targetRepRange: {
        min: data.target_rep_range_min,
        max: data.target_rep_range_max
      },
      targetRepsInReserve: data.target_reps_in_reserve,
      gyms: data.gyms
    };

    return exercise;
  }

  async getExercisesByType(exerciseTypeId: string): Promise<Exercise.Compact[]> {
    const { data, error } = await this.client
      .from('exercises')
      .select('id,name,machine_brand')
      .eq('exercise_type_id', exerciseTypeId)
      .is('deleted_at', null);

    if (error) {
      throw new Error(`Failed to load exercises: ${error.message}`);
    }

    return data.map((row) => {
      const exercise: Exercise.Compact = {
        id: row.id,
        name: row.name,
        machineBrand: row.machine_brand
      };

      return exercise;
    });
  }
}
