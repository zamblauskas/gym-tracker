import type { Database } from '$lib/supabase/types';
import type { SupabaseClient } from '@supabase/supabase-js';
import * as Program from '$lib/types/views/program';

export class ProgramViewService {
  constructor(private client: SupabaseClient<Database>) {}

  async listPrograms(): Promise<Program.Compact[]> {
    const { data, error } = await this.client
      .from('programs')
      .select('id,name,routines(count)')
      .is('deleted_at', null)
      .is('routines.deleted_at', null)
      .order('name');

    if (error) {
      throw new Error(`Failed to load programs: ${error.message}`);
    }

    return data.map((program) => ({
      id: program.id,
      name: program.name,
      routineCount: program.routines[0]?.count ?? 0
    }));
  }

  async getProgramDetailById(programId: string): Promise<Program.Detail> {
    const { data, error } = await this.client
      .from('programs')
      .select('id,name,routines(id,name,position)')
      .eq('id', programId)
      .is('routines.deleted_at', null)
      .order('position', { referencedTable: 'routines', ascending: true })
      .single();

    if (error) {
      throw new Error(`Failed to load program: ${error.message}`);
    }

    return data;
  }
}
