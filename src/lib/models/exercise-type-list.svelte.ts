import { type CreateMutationResult, type CreateQueryResult } from '@tanstack/svelte-query';
import * as ExerciseType from '$lib/types/views/exercise-type';
import { getContext } from 'svelte';
import type { Services } from '$lib/context';
import { SERVICES_KEY } from '$lib/context';
import { Keys } from '$lib/query-keys';
import { ExerciseType as ExerciseTypeCommand } from '$lib/types/commands';
import { createMutation, fetchQuery } from '$lib/utils/query';

export class ExerciseTypeListModel {
  private services = getContext<Services>(SERVICES_KEY);

  exerciseTypesQuery: CreateQueryResult<ExerciseType.Compact[]>;
  createExerciseTypeMutation: CreateMutationResult<string, Error, ExerciseTypeCommand.Create>;

  constructor() {
    this.exerciseTypesQuery = fetchQuery({
      key: () => Keys.exerciseTypeList,
      fn: () => this.services.exerciseTypeViewService.listExerciseTypes()
    });

    this.createExerciseTypeMutation = createMutation({
      fn: (data) => this.services.exerciseTypeCommandService.createExerciseType(data),
      invalidateKeys: () => [Keys.exerciseTypeList]
    });
  }

  get exerciseTypes() {
    return this.exerciseTypesQuery.data ?? [];
  }

  get isLoading() {
    return this.exerciseTypesQuery.isLoading;
  }

  get isFetching() {
    return this.exerciseTypesQuery.isFetching;
  }

  get isCreating() {
    return this.createExerciseTypeMutation.isPending;
  }

  get isActionInProgress() {
    const isLoading = this.isLoading;
    const isCreating = this.isCreating;
    return isLoading || isCreating;
  }

  get errorMessage() {
    const queryError = this.exerciseTypesQuery.error?.message;
    const mutationError = this.createExerciseTypeMutation.error?.message;
    return queryError || mutationError || null;
  }

  createExerciseType(exerciseType: ExerciseTypeCommand.Create) {
    return this.createExerciseTypeMutation.mutateAsync(exerciseType);
  }
}
