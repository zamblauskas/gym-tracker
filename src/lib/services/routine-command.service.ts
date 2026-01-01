import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/supabase/types';
import type { RoutineInsert, RoutineUpdate, RoutineExerciseTypeInsert } from '$lib/supabase/client';
import type { Routine } from '$lib/types/commands';

export class RoutineCommandService {
  constructor(private client: SupabaseClient<Database>) {}

  async createRoutine(input: Routine.Create): Promise<string> {
    const maxPosition = await this.getMaxRoutinePosition(input.programId);
    const position = String(Number(maxPosition) + 1);

    const routineInsert: RoutineInsert = {
      program_id: input.programId,
      name: input.name,
      position
    };

    const { data, error } = await this.client
      .from('routines')
      .insert(routineInsert as Database['public']['Tables']['routines']['Insert'])
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to create routine: ${error.message}`);
    }

    return data.id;
  }

  private async getMaxRoutinePosition(programId: string): Promise<string> {
    const { data, error } = await this.client
      .from('routines')
      .select('position')
      .eq('program_id', programId)
      .is('deleted_at', null)
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to find max routine position: ${error.message}`);
    }

    return data?.position ?? '0';
  }

  async updateRoutinePositions(input: Routine.UpdatePositions): Promise<void> {
    if (input.orderedRoutineIds.length === 0) return;

    const updates = input.orderedRoutineIds.map((routineId, idx) => {
      const routineUpdate: RoutineUpdate = {
        position: String(idx)
      };
      return this.client
        .from('routines')
        .update(routineUpdate)
        .eq('id', routineId)
        .eq('program_id', input.programId)
        .is('deleted_at', null);
    });

    const results = await Promise.all(updates);
    const firstError = results.find((r) => r.error)?.error;
    if (firstError) {
      throw new Error(`Failed to reorder routines: ${firstError.message}`);
    }
  }

  async updateRoutine(routineId: string, input: Routine.Update): Promise<void> {
    await Promise.all([
      this.updateRoutineData(routineId, input.name),
      this.updateExerciseTypePositions(routineId, input.exerciseTypeIds)
    ]);
  }

  private async updateRoutineData(routineId: string, name: string): Promise<void> {
    const routineUpdate: RoutineUpdate = {
      name
    };

    const { error } = await this.client
      .from('routines')
      .update(routineUpdate)
      .eq('id', routineId)
      .is('deleted_at', null);

    if (error) {
      throw new Error(`Failed to update routine: ${error.message}`);
    }
  }

  private async updateExerciseTypePositions(
    routineId: string,
    exerciseTypeIds: string[]
  ): Promise<void> {
    await this.deleteExerciseTypesForRoutine(routineId);

    if (exerciseTypeIds.length > 0) {
      const rows: RoutineExerciseTypeInsert[] = exerciseTypeIds.map((id, idx) => ({
        routine_id: routineId,
        exercise_type_id: id,
        position: String(idx)
      }));

      const { error } = await this.client
        .from('routine_exercise_types')
        .insert(rows as Database['public']['Tables']['routine_exercise_types']['Insert'][]);

      if (error) {
        throw new Error(`Failed to update routine exercise types: ${error.message}`);
      }
    }
  }

  private async deleteExerciseTypesForRoutine(routineId: string): Promise<void> {
    const { error } = await this.client
      .from('routine_exercise_types')
      .delete()
      .eq('routine_id', routineId);

    if (error) {
      throw new Error(`Failed to delete routine exercise types: ${error.message}`);
    }
  }

  async deleteRoutine(routineId: string): Promise<void> {
    const { error } = await this.client
      .from('routines')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', routineId)
      .is('deleted_at', null);

    if (error) {
      throw new Error(`Failed to delete routine: ${error.message}`);
    }
  }
}
