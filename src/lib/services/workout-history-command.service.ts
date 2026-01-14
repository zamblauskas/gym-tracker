import type { Database } from '$lib/supabase/types';
import type { SupabaseClient } from '@supabase/supabase-js';

export class WorkoutHistoryCommandService {
  constructor(private client: SupabaseClient<Database>) {}

  async deleteWorkout(workoutId: string) {
    const { error } = await this.client
      .from('workouts')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', workoutId)
      .is('deleted_at', null);

    if (error) {
      throw new Error(`Failed to delete workout: ${error.message}`);
    }
  }
}
