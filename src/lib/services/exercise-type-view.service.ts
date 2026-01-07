import type { Database } from '$lib/supabase/types';
import type { SupabaseClient } from '@supabase/supabase-js';
import * as ExerciseType from '$lib/types/views/exercise-type';

export class ExerciseTypeViewService {
  constructor(private client: SupabaseClient<Database>) {}

  async listExerciseTypes(): Promise<ExerciseType.Compact[]> {
    const { data, error } = await this.client
      .from('exercise_types')
      .select('id,name,exercises(count)')
      .is('deleted_at', null)
      .order('name');

    if (error) {
      throw new Error(`Failed to load exercise types: ${error.message}`);
    }

    return data.map((row) => ({
      id: row.id,
      name: row.name,
      exerciseCount: row.exercises?.[0]?.count ?? 0
    }));
  }

  async getExerciseTypeDetailById(id: string): Promise<ExerciseType.Detail> {
    const { data, error } = await this.client
      .from('exercise_types')
      .select(
        `id,
        name,
        exercises(
          id,
          name,
          machine_brand,
          target_rep_range_min,
          target_rep_range_max,
          target_reps_in_reserve,
          gyms(id,name)
        )`
      )
      .eq('id', id)
      .is('deleted_at', null)
      .is('exercises.deleted_at', null)
      .is('exercises.gyms.deleted_at', null)
      .order('name', { referencedTable: 'exercises' })
      .single();

    if (error) {
      throw new Error(`Failed to load exercise type detail: ${error.message}`);
    }

    return {
      id: data.id,
      name: data.name,
      exercises: data.exercises.map((ex) => {
        const exercise: ExerciseType.ExerciseDetail = {
          id: ex.id,
          name: ex.name,
          machineBrand: ex.machine_brand,
          targetRepRange: { min: ex.target_rep_range_min, max: ex.target_rep_range_max },
          targetRepsInReserve: ex.target_reps_in_reserve,
          gyms: ex.gyms
        };

        return exercise;
      })
    };
  }
}
