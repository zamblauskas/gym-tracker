import type { Database } from '$lib/supabase/types';
import type { SupabaseClient } from '@supabase/supabase-js';
import * as Routine from '$lib/types/views/routine';

interface ProgramWithRoutines {
  id: string;
  name: string;
  routines: {
    id: string;
    name: string;
  }[];
}

export class RoutineViewService {
  constructor(private client: SupabaseClient<Database>) {}

  async getRoutineDetailById(routineId: string): Promise<Routine.Detail> {
    const { data, error } = await this.client
      .from('routines')
      .select('id,name,programs(id,name),routine_exercise_types(exercise_type_id)')
      .eq('id', routineId)
      .single();

    if (error) {
      throw new Error(`Failed to load routine: ${error.message}`);
    }

    return {
      id: data.id,
      name: data.name,
      program: {
        id: data.programs.id,
        name: data.programs.name
      },
      exerciseTypeIds: data.routine_exercise_types.map((ret) => ret.exercise_type_id)
    };
  }

  /**
   * Fetch next routine that should be done for each program.
   * For every program we check what was the last executed routine and return the next one.
   * If there is no last executed routine, we return the first routine.
   * If there is no next routine, we return the first routine.
   */
  async getNextRoutineByProgram(): Promise<Routine.Compact[]> {
    const programs = await this.getPrograms();

    const nextRoutines = await Promise.all(
      programs.map((program) => this.calculateNextRoutineForProgram(program))
    );

    return nextRoutines.filter((r) => r !== null);
  }

  private async calculateNextRoutineForProgram(
    program: ProgramWithRoutines
  ): Promise<Routine.Compact | null> {
    if (!program.routines || program.routines.length === 0) {
      return null;
    }

    const lastWorkout = await this.getLastWorkout(program.id);
    const nextRoutine = this.determineNextRoutine(program.routines, lastWorkout?.routines?.id);

    if (!nextRoutine) {
      return null;
    }

    return {
      id: nextRoutine.id,
      name: nextRoutine.name,
      program: {
        id: program.id,
        name: program.name
      }
    };
  }

  private determineNextRoutine(routines: { id: string; name: string }[], lastRoutineId?: string) {
    if (!lastRoutineId) {
      return routines[0];
    }

    const lastRoutineIndex = routines.findIndex((r) => r.id === lastRoutineId);

    if (lastRoutineIndex === -1) {
      return routines[0];
    }

    const nextIndex = (lastRoutineIndex + 1) % routines.length;
    return routines[nextIndex];
  }

  private async getPrograms(): Promise<ProgramWithRoutines[]> {
    const { data, error } = await this.client
      .from('programs')
      .select('id,name,routines(id,name)')
      .order('position', { referencedTable: 'routines', ascending: true })
      .is('deleted_at', null)
      .is('routines.deleted_at', null);

    if (error) {
      throw new Error(`Failed to load programs: ${error.message}`);
    }

    return data;
  }

  private async getLastWorkout(programId: string) {
    const { data, error } = await this.client
      .from('workouts')
      .select('id,routines!inner(id,program_id)')
      .eq('routines.program_id', programId)
      .eq('status', 'completed')
      .is('deleted_at', null)
      .is('routines.deleted_at', null)
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load last workout: ${error.message}`);
    }

    return data;
  }
}
