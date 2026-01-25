import { type CreateQueryResult } from '@tanstack/svelte-query';
import { SERVICES_KEY } from '$lib/context';
import { getContext } from 'svelte';
import type { Services } from '$lib/context';
import type { Workout } from '$lib/types/views';
import { Keys } from '$lib/query-keys';
import { fetchQuery } from '$lib/utils/query';

export class WorkoutHistoryListModel {
  private services = getContext<Services>(SERVICES_KEY);

  historyQuery: CreateQueryResult<Workout.HistoryItem[]>;

  constructor() {
    this.historyQuery = fetchQuery({
      key: () => Keys.workoutHistoryList,
      fn: () => this.services.workoutHistoryViewService.getHistory()
    });
  }

  get historyItems() {
    return this.historyQuery.data ?? [];
  }

  get isLoading() {
    return this.historyQuery.isLoading;
  }

  get errorMessage() {
    const historyError = this.historyQuery.error?.message;

    return historyError || null;
  }
}
