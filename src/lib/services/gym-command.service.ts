import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/supabase/types';
import type { GymInsert, GymUpdate } from '$lib/supabase/client';
import type { Gym } from '$lib/types/commands';

export class GymCommandService {
  constructor(private client: SupabaseClient<Database>) {}

  async createGym(input: Gym.Create): Promise<string> {
    const gymInsert: GymInsert = {
      name: input.name
    };

    const { data, error } = await this.client
      .from('gyms')
      .insert(gymInsert as Database['public']['Tables']['gyms']['Insert'])
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to create gym: ${error.message}`);
    }

    return data.id;
  }

  async updateGym(gymId: string, input: Gym.Update): Promise<void> {
    const gymUpdate: GymUpdate = {
      name: input.name
    };

    const { error } = await this.client
      .from('gyms')
      .update(gymUpdate)
      .eq('id', gymId)
      .is('deleted_at', null);

    if (error) {
      throw new Error(`Failed to update gym: ${error.message}`);
    }
  }

  async deleteGym(gymId: string): Promise<void> {
    const { error } = await this.client
      .from('gyms')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', gymId)
      .is('deleted_at', null);

    if (error) {
      throw new Error(`Failed to delete gym: ${error.message}`);
    }
  }
}
