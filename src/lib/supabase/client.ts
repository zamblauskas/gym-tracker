import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

let supabaseClient: SupabaseClient<Database> | undefined;

export function getSupabaseClient(): SupabaseClient<Database> {
  if (supabaseClient) return supabaseClient;

  supabaseClient = createClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
  return supabaseClient;
}

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type ExerciseInsert = Optional<
  Database['public']['Tables']['exercises']['Insert'],
  'user_id' | 'created_at' | 'updated_at' | 'deleted_at'
>;

export type ExerciseUpdate = Optional<
  Database['public']['Tables']['exercises']['Update'],
  'user_id' | 'created_at' | 'updated_at' | 'deleted_at'
>;

export type ExerciseTypeInsert = Optional<
  Database['public']['Tables']['exercise_types']['Insert'],
  'user_id' | 'created_at' | 'updated_at' | 'deleted_at'
>;

export type ExerciseTypeUpdate = Optional<
  Database['public']['Tables']['exercise_types']['Update'],
  'user_id' | 'created_at' | 'updated_at' | 'deleted_at'
>;

export type ProgramInsert = Optional<
  Database['public']['Tables']['programs']['Insert'],
  'user_id' | 'created_at' | 'updated_at' | 'deleted_at'
>;

export type ProgramUpdate = Optional<
  Database['public']['Tables']['programs']['Update'],
  'user_id' | 'created_at' | 'updated_at' | 'deleted_at'
>;

export type RoutineInsert = Optional<
  Database['public']['Tables']['routines']['Insert'],
  'user_id' | 'created_at' | 'updated_at' | 'deleted_at'
>;

export type RoutineUpdate = Optional<
  Database['public']['Tables']['routines']['Update'],
  'user_id' | 'created_at' | 'updated_at' | 'deleted_at'
>;

export type RoutineExerciseTypeInsert = Optional<
  Database['public']['Tables']['routine_exercise_types']['Insert'],
  'user_id' | 'created_at' | 'updated_at'
>;

export type WorkoutInsert = Optional<
  Database['public']['Tables']['workouts']['Insert'],
  'user_id' | 'created_at' | 'updated_at' | 'deleted_at'
>;

export type WorkoutUpdate = Optional<
  Database['public']['Tables']['workouts']['Update'],
  'user_id' | 'created_at' | 'updated_at' | 'deleted_at'
>;

export type WorkoutExerciseInsert = Optional<
  Database['public']['Tables']['workout_exercises']['Insert'],
  'user_id' | 'created_at' | 'updated_at' | 'deleted_at'
>;

export type WorkoutExerciseUpdate = Optional<
  Database['public']['Tables']['workout_exercises']['Update'],
  'user_id' | 'created_at' | 'updated_at' | 'deleted_at'
>;

export type WorkoutSetInsert = Optional<
  Database['public']['Tables']['workout_sets']['Insert'],
  'user_id' | 'created_at' | 'updated_at' | 'deleted_at'
>;

export type WorkoutSetUpdate = Optional<
  Database['public']['Tables']['workout_sets']['Update'],
  'user_id' | 'created_at' | 'updated_at' | 'deleted_at'
>;

export type GymInsert = Optional<
  Database['public']['Tables']['gyms']['Insert'],
  'user_id' | 'created_at' | 'updated_at' | 'deleted_at'
>;

export type GymUpdate = Optional<
  Database['public']['Tables']['gyms']['Update'],
  'user_id' | 'created_at' | 'updated_at' | 'deleted_at'
>;

export type ExerciseGymInsert = Optional<
  Database['public']['Tables']['exercise_gyms']['Insert'],
  'user_id' | 'created_at'
>;
