import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/supabase/types';
import type { ProgramInsert, ProgramUpdate } from '$lib/supabase/client';
import type { Program } from '$lib/types/commands';

export class ProgramCommandService {
  constructor(private client: SupabaseClient<Database>) {}

  async createProgram(input: Program.Create): Promise<string> {
    const programInsert: ProgramInsert = {
      name: input.name
    };

    const { data, error } = await this.client
      .from('programs')
      .insert(programInsert as Database['public']['Tables']['programs']['Insert'])
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to create program: ${error.message}`);
    }

    return data.id;
  }

  async updateProgram(programId: string, input: Program.Update): Promise<void> {
    const programUpdate: ProgramUpdate = {
      name: input.name
    };

    const { error } = await this.client
      .from('programs')
      .update(programUpdate)
      .eq('id', programId)
      .is('deleted_at', null);

    if (error) {
      throw new Error(`Failed to update program: ${error.message}`);
    }
  }

  async deleteProgram(programId: string): Promise<void> {
    const { error } = await this.client
      .from('programs')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', programId)
      .is('deleted_at', null);

    if (error) {
      throw new Error(`Failed to delete program: ${error.message}`);
    }
  }
}
