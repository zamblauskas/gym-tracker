import type { Database } from '$lib/supabase/types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  WorkoutExerciseInsert,
  WorkoutInsert,
  WorkoutSetInsert,
  WorkoutSetUpdate,
  WorkoutUpdate
} from '$lib/supabase/client';
import type { Workout } from '$lib/types/commands';

export class WorkoutCommandService {
  constructor(private client: SupabaseClient<Database>) {}

  async startWorkoutForRoutine(routineId: string): Promise<string> {
    const workoutId = await this.createWorkout(routineId);

    const exerciseTypeIds = await this.getRoutineExerciseTypeIds(routineId);
    await this.createWorkoutExercises(workoutId, exerciseTypeIds);

    return workoutId;
  }

  private async createWorkout(routineId: string): Promise<string> {
    const workoutInsert: WorkoutInsert = {
      routine_id: routineId,
      status: 'in_progress'
    };

    const { data, error } = await this.client
      .from('workouts')
      .insert(workoutInsert as Database['public']['Tables']['workouts']['Insert'])
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to create workout: ${error.message}`);
    }

    return data.id;
  }

  private async getRoutineExerciseTypeIds(routineId: string): Promise<string[]> {
    const { data, error } = await this.client
      .from('routine_exercise_types')
      .select('exercise_type_id')
      .eq('routine_id', routineId);

    if (error) {
      throw new Error(`Failed to get routine exercise types: ${error.message}`);
    }

    return data.map((item) => item.exercise_type_id);
  }

  private async createWorkoutExercises(workoutId: string, exerciseTypeIds: string[]) {
    const workoutExerciseInserts = exerciseTypeIds.map((exerciseTypeId, index) => {
      const workoutExerciseInsert: WorkoutExerciseInsert = {
        workout_id: workoutId,
        exercise_type_id: exerciseTypeId,
        index
      };

      return workoutExerciseInsert as Database['public']['Tables']['workout_exercises']['Insert'];
    });

    const { error } = await this.client.from('workout_exercises').insert(workoutExerciseInserts);

    if (error) {
      throw new Error(`Failed to create workout exercises: ${error.message}`);
    }
  }

  async selectExercise(input: Workout.SelectExercise): Promise<void> {
    const { error } = await this.client
      .from('workout_exercises')
      .update({ exercise_id: input.exerciseId })
      .eq('id', input.exerciseLogId);

    if (error) {
      throw new Error(`Failed to select exercise: ${error.message}`);
    }
  }

  async addSet(input: Workout.AddSet): Promise<void> {
    const setInsert: WorkoutSetInsert = {
      workout_exercise_id: input.exerciseLogId,
      reps: input.reps,
      weight: input.weight,
      reps_in_reserve: input.repsInReserve
    };

    const { error } = await this.client
      .from('workout_sets')
      .insert(setInsert as Database['public']['Tables']['workout_sets']['Insert']);

    if (error) {
      throw new Error(`Failed to add set: ${error.message}`);
    }
  }

  async updateSet(setId: string, input: Workout.UpdateSet): Promise<void> {
    const setUpdate: WorkoutSetUpdate = {
      reps: input.reps,
      weight: input.weight,
      reps_in_reserve: input.repsInReserve
    };

    const { error } = await this.client
      .from('workout_sets')
      .update(setUpdate)
      .eq('id', setId)
      // TODO: do we need to check for deleted_at?
      .is('deleted_at', null);

    if (error) {
      throw new Error(`Failed to update set: ${error.message}`);
    }
  }

  async deleteSet(setId: string) {
    const { error } = await this.client
      .from('workout_sets')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', setId)
      .is('deleted_at', null);

    if (error) {
      throw new Error(`Failed to delete set: ${error.message}`);
    }
  }

  async updateNotes(input: Workout.UpdateNotes) {
    const { error } = await this.client
      .from('workout_exercises')
      .update({ notes: input.notes })
      .eq('id', input.exerciseLogId)
      .is('deleted_at', null);

    if (error) {
      throw new Error(`Failed to update notes: ${error.message}`);
    }
  }

  async completeWorkout(workoutId: string) {
    const workoutUpdate: WorkoutUpdate = {
      status: 'completed',
      completed_at: new Date().toISOString()
    };

    const { error } = await this.client
      .from('workouts')
      .update(workoutUpdate)
      .eq('id', workoutId)
      .is('deleted_at', null);

    if (error) {
      throw new Error(`Failed to complete workout: ${error.message}`);
    }
  }

  async cancelWorkout(workoutId: string) {
    const workoutUpdate: WorkoutUpdate = {
      status: 'cancelled'
    };

    const { error } = await this.client
      .from('workouts')
      .update(workoutUpdate)
      .eq('id', workoutId)
      .is('deleted_at', null);

    if (error) {
      throw new Error(`Failed to cancel workout: ${error.message}`);
    }
  }
}
