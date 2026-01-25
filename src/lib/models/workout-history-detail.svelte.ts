import { type CreateMutationResult, type CreateQueryResult } from '@tanstack/svelte-query';
import { SERVICES_KEY, type Services } from '$lib/context';
import { getContext } from 'svelte';
import type { Workout } from '$lib/types/views';
import { Keys } from '$lib/query-keys';
import { fetchQuery, deleteMutation } from '$lib/utils/query';

export class WorkoutHistoryDetailModel {
  private services = getContext<Services>(SERVICES_KEY);

  workoutQuery: CreateQueryResult<Workout.HistoryDetail>;
  deleteWorkoutMutation: CreateMutationResult<void, Error>;

  constructor(private workoutId: string) {
    this.workoutQuery = fetchQuery({
      key: () => Keys.workoutHistoryDetail(this.workoutId),
      fn: () => this.services.workoutHistoryViewService.getHistoryDetail(this.workoutId)
    });

    this.deleteWorkoutMutation = deleteMutation({
      fn: () => this.services.workoutHistoryCommandService.deleteWorkout(this.workoutId),
      invalidateKeys: () => [Keys.workoutHistoryList, Keys.workoutHistoryDetail(this.workoutId)]
    });
  }

  get workout() {
    return this.workoutQuery.data;
  }

  get isLoading() {
    return this.workoutQuery.isLoading;
  }

  get isActionInProgress() {
    const isLoading = this.isLoading;
    const deleteWorkoutMutationIsPending = this.deleteWorkoutMutation.isPending;
    return isLoading || deleteWorkoutMutationIsPending;
  }

  get isDeleting() {
    return this.deleteWorkoutMutation.isPending;
  }

  get errorMessage() {
    const workoutError = this.workoutQuery.error?.message;
    const deleteWorkoutMutationError = this.deleteWorkoutMutation.error?.message;
    return workoutError || deleteWorkoutMutationError || null;
  }

  delete() {
    return this.deleteWorkoutMutation.mutateAsync(undefined);
  }
}
