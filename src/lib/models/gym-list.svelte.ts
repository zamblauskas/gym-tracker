import type { Services } from '$lib/context';
import { SERVICES_KEY } from '$lib/context';
import { Keys } from '$lib/query-keys';
import { Gym as GymCommand } from '$lib/types/commands';
import type { Gym } from '$lib/types/views';
import { createMutation, fetchQuery } from '$lib/utils/query';
import { type CreateMutationResult, type CreateQueryResult } from '@tanstack/svelte-query';
import { getContext } from 'svelte';

export class GymListModel {
  private services = getContext<Services>(SERVICES_KEY);

  gymsQuery: CreateQueryResult<Gym.Compact[]>;
  createGymMutation: CreateMutationResult<string, Error, GymCommand.Create>;

  constructor() {
    this.gymsQuery = fetchQuery({
      key: () => Keys.gymList,
      fn: () => this.services.gymViewService.listGyms()
    });

    this.createGymMutation = createMutation<GymCommand.Create>({
      fn: (data: GymCommand.Create) => this.services.gymCommandService.createGym(data),
      invalidateKeys: () => [Keys.gymList]
    });
  }

  get gyms() {
    return this.gymsQuery.data ?? [];
  }

  get isLoading() {
    return this.gymsQuery.isLoading;
  }

  get isActionInProgress() {
    const isLoading = this.isLoading;
    const createMutationIsPending = this.createGymMutation.isPending;

    return isLoading || createMutationIsPending;
  }

  get isGymCreating() {
    return this.createGymMutation.isPending;
  }

  get errorMessage() {
    const gymsError = this.gymsQuery.error?.message;
    const createMutationError = this.createGymMutation.error?.message;

    return gymsError || createMutationError || null;
  }

  create(gym: GymCommand.Create) {
    return this.createGymMutation.mutateAsync(gym);
  }
}
