import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { type CreateMutationResult, type CreateQueryResult } from '@tanstack/svelte-query';
import { getContext } from 'svelte';
import { SERVICES_KEY, type Services } from '$lib/context';
import * as Workout from '$lib/types/views/workout';
import { Workout as WorkoutCommand } from '$lib/types/commands';
import { Keys } from '$lib/query-keys';
import { fetchQuery, updateMutation } from '$lib/utils/query';

export class WorkoutDetailModel {
  private services = getContext<Services>(SERVICES_KEY);

  workoutQuery: CreateQueryResult<Workout.Detail>;
  historyQuery: CreateQueryResult<Workout.ExerciseHistory[]>;
  selectExerciseMutation: CreateMutationResult<void, Error, WorkoutCommand.SelectExercise>;
  addSetMutation: CreateMutationResult<void, Error, WorkoutCommand.AddSet>;
  updateSetMutation: CreateMutationResult<
    void,
    Error,
    { setId: string; data: WorkoutCommand.UpdateSet }
  >;
  deleteSetMutation: CreateMutationResult<void, Error, string>;
  updateNotesMutation: CreateMutationResult<
    void,
    Error,
    { data: WorkoutCommand.UpdateNotes; index: number }
  >;
  completeWorkoutMutation: CreateMutationResult<void, Error, void>;
  cancelWorkoutMutation: CreateMutationResult<void, Error, void>;

  constructor(
    private workoutId: () => string,
    private index: () => number
  ) {
    this.workoutQuery = fetchQuery({
      key: () => Keys.workoutDetail(this.workoutId(), this.index()),
      fn: () => this.services.workoutViewService.getWorkoutDetail(this.workoutId(), this.index())
    });

    this.historyQuery = fetchQuery({
      key: () =>
        Keys.workoutExerciseHistory(this.workoutId(), this.workout?.exercise.exercise?.id ?? ''),
      fn: () => {
        const exerciseId = this.workout?.exercise.exercise?.id;
        if (!exerciseId) {
          return Promise.resolve([]);
        }
        return this.services.workoutViewService.getExerciseHistory(exerciseId, this.workoutId(), 5);
      },
      enabled: () => !!this.workout?.exercise.exercise?.id
    });

    this.selectExerciseMutation = updateMutation<WorkoutCommand.SelectExercise, Workout.Detail>({
      key: () => Keys.workoutDetail(this.workoutId(), this.index()),
      fn: (data) => this.services.workoutCommandService.selectExercise(data),
      invalidateKeys: () => [
        Keys.workoutDetail(this.workoutId(), this.index()),
        Keys.workoutExerciseHistory(this.workoutId(), this.workout?.exercise.exercise?.id ?? '')
      ]
    });

    this.addSetMutation = updateMutation<WorkoutCommand.AddSet, Workout.Detail>({
      key: () => Keys.workoutDetail(this.workoutId(), this.index()),
      fn: (data) => this.services.workoutCommandService.addSet(data),
      invalidateKeys: () => [Keys.workoutDetail(this.workoutId(), this.index())]
    });

    this.updateSetMutation = updateMutation<
      { setId: string; data: WorkoutCommand.UpdateSet },
      Workout.Detail
    >({
      key: () => Keys.workoutDetail(this.workoutId(), this.index()),
      fn: ({ setId, data }) => this.services.workoutCommandService.updateSet(setId, data),
      invalidateKeys: () => [Keys.workoutDetail(this.workoutId(), this.index())]
    });

    this.deleteSetMutation = updateMutation<string, Workout.Detail>({
      key: () => Keys.workoutDetail(this.workoutId(), this.index()),
      fn: (setId) => this.services.workoutCommandService.deleteSet(setId),
      invalidateKeys: () => [Keys.workoutDetail(this.workoutId(), this.index())]
    });

    this.updateNotesMutation = updateMutation<
      { data: WorkoutCommand.UpdateNotes; index: number },
      Workout.Detail
    >({
      key: () => Keys.workoutDetail(this.workoutId(), this.index()),
      fn: ({ data }) => this.services.workoutCommandService.updateNotes(data),
      invalidateKeys: ({ index }) => [Keys.workoutDetail(this.workoutId(), index)],
      merge(previousData, update): Workout.Detail {
        return {
          ...previousData,
          exercise: {
            ...previousData.exercise,
            notes: update.data.notes
          }
        };
      }
    });

    this.completeWorkoutMutation = updateMutation<void, Workout.Detail>({
      key: () => Keys.workoutDetail(this.workoutId(), this.index()),
      fn: () => this.services.workoutCommandService.completeWorkout(this.workoutId()),
      invalidateKeys: () => [Keys.workoutHistory]
    });

    this.cancelWorkoutMutation = updateMutation<void, Workout.Detail>({
      key: () => Keys.workoutDetail(this.workoutId(), this.index()),
      fn: () => this.services.workoutCommandService.cancelWorkout(this.workoutId()),
      invalidateKeys: () => [Keys.workoutHistory]
    });
  }

  get workout() {
    return this.workoutQuery.data;
  }

  get history() {
    return this.historyQuery.data ?? [];
  }

  get isLoading() {
    const workoutIsLoading = this.workoutQuery.isLoading;
    const historyIsLoading = this.historyQuery.isLoading;
    return workoutIsLoading || historyIsLoading;
  }

  get isActionInProgress() {
    const isLoading = this.isLoading;
    const selectExerciseMutationIsPending = this.selectExerciseMutation.isPending;
    const addSetMutationIsPending = this.addSetMutation.isPending;
    const updateSetMutationIsPending = this.updateSetMutation.isPending;
    const deleteSetMutationIsPending = this.deleteSetMutation.isPending;
    const updateNotesMutationIsPending = this.updateNotesMutation.isPending;
    const completeWorkoutMutationIsPending = this.completeWorkoutMutation.isPending;
    const cancelWorkoutMutationIsPending = this.cancelWorkoutMutation.isPending;
    return (
      isLoading ||
      selectExerciseMutationIsPending ||
      addSetMutationIsPending ||
      updateSetMutationIsPending ||
      deleteSetMutationIsPending ||
      updateNotesMutationIsPending ||
      completeWorkoutMutationIsPending ||
      cancelWorkoutMutationIsPending
    );
  }

  get isSelecting() {
    return this.selectExerciseMutation.isPending;
  }

  get isAddingSet() {
    return this.addSetMutation.isPending;
  }

  get isUpdatingSet() {
    return this.updateSetMutation.isPending;
  }

  get isDeletingSet() {
    return this.deleteSetMutation.isPending;
  }

  get isCompleting() {
    return this.completeWorkoutMutation.isPending;
  }

  get isCancelling() {
    return this.cancelWorkoutMutation.isPending;
  }

  get errorMessage() {
    const workoutError = this.workoutQuery.error?.message;
    const historyError = this.historyQuery.error?.message;
    const selectExerciseMutationError = this.selectExerciseMutation.error?.message;
    const addSetMutationError = this.addSetMutation.error?.message;
    const updateSetMutationError = this.updateSetMutation.error?.message;
    const deleteSetMutationError = this.deleteSetMutation.error?.message;
    const updateNotesMutationError = this.updateNotesMutation.error?.message;
    const completeWorkoutMutationError = this.completeWorkoutMutation.error?.message;
    const cancelWorkoutMutationError = this.cancelWorkoutMutation.error?.message;
    return (
      workoutError ||
      historyError ||
      selectExerciseMutationError ||
      addSetMutationError ||
      updateSetMutationError ||
      deleteSetMutationError ||
      updateNotesMutationError ||
      completeWorkoutMutationError ||
      cancelWorkoutMutationError ||
      null
    );
  }

  selectExercise(exerciseId: string) {
    if (!this.workout?.exercise) return;
    return this.selectExerciseMutation.mutateAsync({
      exerciseLogId: this.workout.exercise.id,
      exerciseId
    });
  }

  addSet(reps: number, weight: number, repsInReserve: number | null) {
    if (!this.workout?.exercise) return;
    return this.addSetMutation.mutateAsync({
      exerciseLogId: this.workout.exercise.id,
      reps,
      weight,
      repsInReserve
    });
  }

  updateSet(setId: string, reps: number, weight: number, repsInReserve: number | null) {
    return this.updateSetMutation.mutateAsync({
      setId,
      data: { reps, weight, repsInReserve }
    });
  }

  deleteSet(setId: string) {
    return this.deleteSetMutation.mutateAsync(setId);
  }

  updateNotes(notes: string) {
    if (!this.workout?.exercise) return;
    return this.updateNotesMutation.mutateAsync({
      data: { exerciseLogId: this.workout.exercise.id, notes },
      index: this.index()
    });
  }

  async completeWorkout() {
    await this.completeWorkoutMutation.mutateAsync(undefined);
    await goto(resolve('/'));
  }

  async cancelWorkout() {
    await this.cancelWorkoutMutation.mutateAsync(undefined);
    await goto(resolve('/'));
  }
}
