import { type CreateMutationResult, type CreateQueryResult } from '@tanstack/svelte-query';
import { Gym as GymCommand } from '$lib/types/commands';
import { SERVICES_KEY } from '$lib/context';
import { getContext } from 'svelte';
import type { Services } from '$lib/context';
import type { Gym } from '$lib/types/views';
import { Keys } from '$lib/query-keys';
import { updateMutation, deleteMutation, fetchQuery } from '$lib/utils/query';

export class GymDetailModel {
  private services = getContext<Services>(SERVICES_KEY);

  private gymId: string;

  gymQuery: CreateQueryResult<Gym.Detail>;
  updateGymMutation: CreateMutationResult<void, Error, GymCommand.Update>;
  deleteGymMutation: CreateMutationResult<void, Error>;

  constructor(gymId: string) {
    this.gymId = gymId;

    this.gymQuery = fetchQuery({
      key: () => Keys.gymDetail(this.gymId),
      fn: () => this.services.gymViewService.getGymById(this.gymId)
    });

    this.updateGymMutation = updateMutation<GymCommand.Update, Gym.Detail>({
      key: () => Keys.gymDetail(this.gymId),
      fn: (data: GymCommand.Update) => this.services.gymCommandService.updateGym(this.gymId, data),
      invalidateKeys: () => [
        Keys.gymList,
        Keys.gymDetail(this.gymId),
        Keys.exercises,
        Keys.exerciseTypes
      ],
      merge: (previousData, update): Gym.Detail => {
        return {
          ...previousData,
          name: update.name
        };
      }
    });

    this.deleteGymMutation = deleteMutation({
      fn: () => this.services.gymCommandService.deleteGym(this.gymId),
      invalidateKeys: () => [
        Keys.gymList,
        Keys.gymDetail(this.gymId),
        Keys.exercises,
        Keys.exerciseTypes
      ]
    });
  }

  get gym() {
    return this.gymQuery.data;
  }

  get isLoading() {
    return this.gymQuery.isLoading;
  }

  get isActionInProgress() {
    const isLoading = this.isLoading;
    const updateMutationIsPending = this.updateGymMutation.isPending;
    const deleteMutationIsPending = this.deleteGymMutation.isPending;

    return isLoading || updateMutationIsPending || deleteMutationIsPending;
  }

  get isGymSaving() {
    return this.updateGymMutation.isPending;
  }

  get isGymDeleting() {
    return this.deleteGymMutation.isPending;
  }

  get errorMessage() {
    const gymError = this.gymQuery.error?.message;
    const updateMutationError = this.updateGymMutation.error?.message;
    const deleteMutationError = this.deleteGymMutation.error?.message;

    return gymError || updateMutationError || deleteMutationError || null;
  }

  update(gym: GymCommand.Update) {
    return this.updateGymMutation.mutateAsync(gym);
  }

  delete() {
    return this.deleteGymMutation.mutateAsync({});
  }
}
