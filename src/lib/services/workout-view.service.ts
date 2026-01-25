import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/supabase/types';
import * as Workout from '$lib/types/views/workout';

export class WorkoutViewService {
  constructor(private client: SupabaseClient<Database>) {}

  async getWorkoutDetail(workoutId: string, index: number): Promise<Workout.Detail> {
    const exerciseCount = await this.getWorkoutExerciseCount(workoutId);

    const { data: workout, error } = await this.client
      .from('workouts')
      .select(
        `
        id,
        status,
        routines!inner (
          name,
          programs!inner (
            name
          )
        ),
        workout_exercises (
          id,
          exercise_type_id,
          notes,
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
            notes,
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
      .eq('workout_exercises.index', index)
      .is('deleted_at', null)
      .is('routines.deleted_at', null)
      .is('routines.programs.deleted_at', null)
      .is('workout_exercises.deleted_at', null)
      .is('workout_exercises.exercises.gyms.deleted_at', null)
      .is('workout_exercises.workout_sets.deleted_at', null)
      .order('index', { referencedTable: 'workout_exercises', ascending: true })
      .order('created_at', { referencedTable: 'workout_exercises.workout_sets', ascending: true })
      .single();

    if (error) {
      throw new Error(`Failed to load workout: ${error.message}`);
    }

    const exercise = workout.workout_exercises[0];

    if (!exercise) {
      throw new Error('Exercise not found');
    }

    const sets: Workout.SetDetail[] = exercise.workout_sets.map((ws) => ({
      id: ws.id,
      weight: ws.weight,
      reps: ws.reps,
      repsInReserve: ws.reps_in_reserve
    }));

    const detail: Workout.ExerciseDetail = {
      id: exercise.id,
      exerciseType: {
        id: exercise.exercise_type_id,

        name: exercise.exercise_types.name,
        targetRepRange: {
          min: exercise.exercise_types.target_rep_range_min,
          max: exercise.exercise_types.target_rep_range_max
        },
        targetRepsInReserve: exercise.exercise_types.target_reps_in_reserve
      },
      sets,
      exercise: exercise.exercises
        ? {
            id: exercise.exercises.id,
            name: exercise.exercises.name,
            machineBrand: exercise.exercises.machine_brand,
            notes: exercise.exercises.notes,
            targetRepRange: {
              min: exercise.exercises.target_rep_range_min,
              max: exercise.exercises.target_rep_range_max
            },
            targetRepsInReserve: exercise.exercises.target_reps_in_reserve,
            gyms: exercise.exercises.gyms
          }
        : null,
      notes: exercise.notes
    };

    return {
      id: workout.id,
      routine: {
        name: workout.routines.name,
        program: {
          name: workout.routines.programs.name
        }
      },
      exercise: detail,
      exerciseCount,
      status: this.mapStatus(workout.status)
    };
  }

  async getInProgressWorkouts(): Promise<Workout.Compact[]> {
    const { data: workouts, error } = await this.client
      .from('workouts')
      .select(
        `
                id,
                status,
                started_at,
                routines!inner (
                    name,
                    programs!inner (
                        name
                    )
                ),
                workout_exercises (
                    id,
                    workout_sets (id)
                )
        `
      )
      .eq('status', 'in_progress')
      .is('deleted_at', null)
      .is('routines.deleted_at', null)
      .is('routines.programs.deleted_at', null)
      .is('workout_exercises.deleted_at', null)
      .is('workout_exercises.workout_sets.deleted_at', null)
      .order('started_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to load in-progress workouts: ${error.message}`);
    }

    return workouts.map((workout) => {
      const exerciseCount = workout.workout_exercises.length;

      const completedExerciseCount = workout.workout_exercises.filter(
        (exercise) => exercise.workout_sets.length > 0
      ).length;

      return {
        id: workout.id,
        routine: {
          name: workout.routines.name,
          program: {
            name: workout.routines.programs.name
          }
        },
        status: this.mapStatus(workout.status),
        exerciseCount,
        completedExerciseCount,
        createdAt: new Date(workout.started_at)
      };
    });
  }

  async getExerciseHistory(
    exerciseId: string,
    excludeWorkoutId?: string,
    limit: number = 5
  ): Promise<Workout.ExerciseHistory[]> {
    let query = this.client
      .from('workout_exercises')
      .select(
        `
        id,
        notes,
        exercises (
          name
        ),
        workouts!inner (
          id,
          completed_at,
          status
        ),
        workout_sets (
          id,
          weight,
          reps,
          reps_in_reserve
        )
      `
      )
      .eq('exercise_id', exerciseId);

    if (excludeWorkoutId) {
      query = query.neq('workout_id', excludeWorkoutId);
    }

    const { data, error } = await query
      .eq('workouts.status', 'completed')
      .is('deleted_at', null)
      .is('workouts.deleted_at', null)
      .is('workout_sets.deleted_at', null)
      .order('workouts(completed_at)', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to load exercise history: ${error.message}`);
    }

    return data.map((log) => {
      return {
        workoutExerciseId: log.id,
        workoutDate: new Date(log.workouts.completed_at ?? ''),
        sets: log.workout_sets.map((s) => ({
          id: s.id,
          weight: s.weight,
          reps: s.reps,
          repsInReserve: s.reps_in_reserve
        })),
        notes: log.notes
      };
    });
  }

  async getWorkoutExerciseCount(workoutId: string): Promise<number> {
    const { data, error } = await this.client
      .from('workout_exercises')
      .select('id', { count: 'exact' })
      .eq('workout_id', workoutId)
      .is('deleted_at', null);

    if (error) {
      throw new Error(`Failed to load exercise count: ${error.message}`);
    }

    return data.length;
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
