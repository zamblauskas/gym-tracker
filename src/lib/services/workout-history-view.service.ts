import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/supabase/types';
import * as Workout from '$lib/types/views/workout';

export class WorkoutHistoryViewService {
  constructor(private client: SupabaseClient<Database>) {}

  // TODO: Pagination or infinite scroll
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

  async getHistoryDetail(workoutId: string): Promise<Workout.HistoryDetail> {
    const { data: workout, error } = await this.client
      .from('workouts')
      .select(
        `
        id,
        status,
        started_at,
        completed_at,
        routines!inner (
          id,
          name,
          programs!inner (
            id,
            name
          )
        ),
        workout_exercises (
          id,
          exercise_type_id,
          notes,
          index,
          exercise_types!inner (
            id,
            name,
            target_rep_range_min,
            target_rep_range_max,
            target_reps_in_reserve
          ),
          exercises (
            id,
            name,
            machine_brand,
            target_rep_range_min,
            target_rep_range_max,
            target_reps_in_reserve,
            gyms(id,name)
          ),
          workout_sets (
            id,
            weight,
            reps,
            reps_in_reserve,
            created_at
          )
        )
      `
      )
      .eq('id', workoutId)
      .is('deleted_at', null)
      .is('workout_exercises.deleted_at', null)
      .is('workout_exercises.exercises.gyms.deleted_at', null)
      .is('workout_exercises.workout_sets.deleted_at', null)
      .order('index', { referencedTable: 'workout_exercises', ascending: true })
      .order('created_at', { referencedTable: 'workout_exercises.workout_sets', ascending: true })
      .single();

    if (error) {
      throw new Error(`Failed to load workout history detail: ${error.message}`);
    }

    const exercises: Workout.HistoryExerciseDetail[] = workout.workout_exercises.map((we) => {
      return {
        id: we.id,
        exerciseType: {
          id: we.exercise_type_id,
          name: we.exercise_types.name,
          targetRepRange: {
            min: we.exercise_types.target_rep_range_min,
            max: we.exercise_types.target_rep_range_max
          },
          targetRepsInReserve: we.exercise_types.target_reps_in_reserve
        },
        exercise: we.exercises
          ? {
              id: we.exercises.id,
              name: we.exercises.name,
              machineBrand: we.exercises.machine_brand,
              targetRepRange: {
                min: we.exercises.target_rep_range_min,
                max: we.exercises.target_rep_range_max
              },
              targetRepsInReserve: we.exercises.target_reps_in_reserve,
              gyms: we.exercises.gyms
            }
          : null,
        sets: we.workout_sets.map((ws) => ({
          id: ws.id,
          weight: ws.weight,
          reps: ws.reps,
          repsInReserve: ws.reps_in_reserve
        })),
        notes: we.notes
      };
    });

    return {
      id: workout.id,
      status: this.mapStatus(workout.status),
      startedAt: new Date(workout.started_at),
      completedAt: workout.completed_at ? new Date(workout.completed_at) : null,
      routine: {
        id: workout.routines.id,
        name: workout.routines.name,
        program: {
          id: workout.routines.programs.id,
          name: workout.routines.programs.name
        }
      },
      exercises
    };
  }

  private mapStatus(status: string): Workout.Status {
    switch (status) {
      case 'in_progress':
        return Workout.Status.InProgress;
      case 'completed':
        return Workout.Status.Completed;
      case 'cancelled':
        return Workout.Status.Cancelled;
      default:
        return Workout.Status.InProgress;
    }
  }
}
