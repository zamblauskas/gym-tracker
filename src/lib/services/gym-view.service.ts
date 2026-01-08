import type { Database } from '$lib/supabase/types';
import type { SupabaseClient } from '@supabase/supabase-js';
import * as Gym from '$lib/types/views/gym';

export class GymViewService {
  constructor(private client: SupabaseClient<Database>) {}

  async listGyms(): Promise<Gym.Compact[]> {
    const { data, error } = await this.client
      .from('gyms')
      .select('id,name')
      .is('deleted_at', null)
      .order('name');

    if (error) {
      throw new Error(`Failed to load gyms: ${error.message}`);
    }

    return data.map((gym) => ({
      id: gym.id,
      name: gym.name
    }));
  }

  async getGymById(gymId: string): Promise<Gym.Detail> {
    const { data, error } = await this.client
      .from('gyms')
      .select('id,name')
      .eq('id', gymId)
      .single();

    if (error) {
      throw new Error(`Failed to load gym: ${error.message}`);
    }

    return {
      id: data.id,
      name: data.name
    };
  }
}
