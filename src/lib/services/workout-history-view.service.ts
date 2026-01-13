import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/supabase/types';
import * as Workout from '$lib/types/views/workout';

export class WorkoutHistoryViewService {
  constructor(private client: SupabaseClient<Database>) {}

  async getHistory(limit: number = 20): Promise<Workout.HistoryItem[]> {
    const { data, error } = await this.client
      .from('workouts')
      .select(
        `
        id,
        completed_at,
        routines!inner (
          name,
          programs!inner (
            name
          )
        )
      `
      )
      .eq('status', 'completed')
      .is('deleted_at', null)
      .order('completed_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to load workout history: ${error.message}`);
    }

    return data.map((workout) => {
      if (workout.completed_at === null) {
        throw new Error(`Workout ${workout.id} is completed without a completed_at date`);
      }

      return {
        id: workout.id,
        routine: {
          name: workout.routines.name,
          program: {
            name: workout.routines.programs.name
          }
        },
        completedAt: new Date(workout.completed_at)
      };
    });
  }
}
