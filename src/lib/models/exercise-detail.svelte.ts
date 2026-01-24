import { type CreateMutationResult, type CreateQueryResult } from '@tanstack/svelte-query';
import { Exercise as ExerciseCommand } from '$lib/types/commands';
import { SERVICES_KEY } from '$lib/context';
import { getContext } from 'svelte';
import type { Services } from '$lib/context';
import type { Exercise, Gym, Workout } from '$lib/types/views';
import { Keys } from '$lib/query-keys';
import { updateMutation, deleteMutation, fetchQuery } from '$lib/utils/query';

export class ExerciseDetailModel {
  private services = getContext<Services>(SERVICES_KEY);

  private exerciseId: string;

  exerciseQuery: CreateQueryResult<Exercise.Detail>;
  gymsQuery: CreateQueryResult<Gym.Compact[]>;
  historyQuery: CreateQueryResult<Workout.ExerciseHistory[]>;
  updateExerciseMutation: CreateMutationResult<void, Error, ExerciseCommand.Update>;
  deleteExerciseMutation: CreateMutationResult<void, Error>;

  constructor(exerciseId: string) {
    this.exerciseId = exerciseId;

    this.exerciseQuery = fetchQuery({
      key: Keys.exerciseDetail(this.exerciseId),
      fn: () => this.services.exerciseViewService.getExerciseDetailById(this.exerciseId)
    });

    this.gymsQuery = fetchQuery({
      key: Keys.gyms,
      fn: () => this.services.gymViewService.listGyms()
    });

    this.historyQuery = fetchQuery({
      key: Keys.exerciseHistory(this.exerciseId),
      fn: () => this.services.workoutViewService.getExerciseHistory(this.exerciseId)
    });

    this.updateExerciseMutation = updateMutation<ExerciseCommand.Update, Exercise.Detail>({
      key: Keys.exerciseDetail(this.exerciseId),
      fn: (data: ExerciseCommand.Update) =>
        this.services.exerciseCommandService.updateExercise(this.exerciseId, data),
      invalidateKeys: [
        Keys.exerciseTypeDetail(this.exercise?.exerciseType.id ?? ''),
        Keys.exerciseDetail(this.exerciseId)
      ],
      merge: (previousData, update) => {
        const gyms = (this.gymsQuery.data ?? []).filter((g) => update.gymIds.includes(g.id));

        return {
          ...previousData,
          ...update,
          gyms
        };
      }
    });

    this.deleteExerciseMutation = deleteMutation({
      fn: () => this.services.exerciseCommandService.deleteExercise(this.exerciseId),
      invalidateKeys: [
        Keys.exerciseTypeDetail(this.exercise?.exerciseType.id ?? ''),
        Keys.exerciseDetail(this.exerciseId),
        Keys.exerciseTypes
      ]
    });
  }

  get exercise() {
    return this.exerciseQuery.data;
  }

  get gyms() {
    return this.gymsQuery.data ?? [];
  }

  get history() {
    return this.historyQuery.data ?? [];
  }

  get isLoading() {
    const exerciseIsLoading = this.exerciseQuery.isLoading;
    const gymsIsLoading = this.gymsQuery.isLoading;
    const historyIsLoading = this.historyQuery.isLoading;
    return exerciseIsLoading || gymsIsLoading || historyIsLoading;
  }

  get isRefetching() {
    const exerciseIsRefetching = this.exerciseQuery.isRefetching;
    const gymsIsRefetching = this.gymsQuery.isRefetching;
    const historyIsRefetching = this.historyQuery.isRefetching;
    return exerciseIsRefetching || gymsIsRefetching || historyIsRefetching;
  }

  get isActionInProgress() {
    const isLoading = this.isLoading;
    const updateMutationIsPending = this.updateExerciseMutation.isPending;
    const deleteMutationIsPending = this.deleteExerciseMutation.isPending;

    return isLoading || updateMutationIsPending || deleteMutationIsPending;
  }

  get isExerciseSaving() {
    return this.updateExerciseMutation.isPending;
  }

  get isExerciseDeleting() {
    return this.deleteExerciseMutation.isPending;
  }

  get errorMessage() {
    const exerciseError = this.exerciseQuery.error;
    const gymsError = this.gymsQuery.error;
    const historyError = this.historyQuery.error;
    const updateMutationError = this.updateExerciseMutation.error;
    const deleteMutationError = this.deleteExerciseMutation.error;

    return (
      exerciseError?.message ||
      gymsError?.message ||
      historyError?.message ||
      updateMutationError?.message ||
      deleteMutationError?.message ||
      null
    );
  }

  update(exercise: ExerciseCommand.Update) {
    return this.updateExerciseMutation.mutateAsync(exercise);
  }

  delete() {
    return this.deleteExerciseMutation.mutateAsync({});
  }
}
