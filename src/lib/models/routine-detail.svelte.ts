import { type CreateMutationResult, type CreateQueryResult } from '@tanstack/svelte-query';
import { getContext } from 'svelte';
import { SERVICES_KEY, type Services } from '$lib/context';
import type * as Routine from '$lib/types/views/routine';
import type * as ExerciseType from '$lib/types/views/exercise-type';
import { Keys } from '$lib/query-keys';
import { fetchQuery, updateMutation, deleteMutation, createMutation } from '$lib/utils/query';
import type { Routine as RoutineCommand } from '$lib/types/commands';

export class RoutineDetailModel {
  private services = getContext<Services>(SERVICES_KEY);

  routineQuery: CreateQueryResult<Routine.Detail>;
  exerciseTypesQuery: CreateQueryResult<ExerciseType.Compact[]>;
  updateRoutineMutation: CreateMutationResult<void, Error, RoutineCommand.Update>;
  deleteRoutineMutation: CreateMutationResult<void, Error>;
  startWorkoutMutation: CreateMutationResult<string, Error, void>;

  constructor(private routineId: string) {
    this.routineQuery = fetchQuery({
      key: () => Keys.routineDetail(this.routineId),
      fn: () => this.services.routineViewService.getRoutineDetailById(this.routineId)
    });

    this.exerciseTypesQuery = fetchQuery({
      key: () => Keys.exerciseTypeList,
      fn: () => this.services.exerciseTypeViewService.listExerciseTypes()
    });

    this.updateRoutineMutation = updateMutation<RoutineCommand.Update, Routine.Detail>({
      key: () => Keys.routineDetail(this.routineId),
      fn: (data) => this.services.routineCommandService.updateRoutine(this.routineId, data),
      invalidateKeys: () => [
        Keys.programDetail(this.routine?.program.id ?? ''),
        Keys.routineDetail(this.routineId),
        Keys.workoutHistory
      ]
    });

    this.deleteRoutineMutation = deleteMutation({
      fn: () => this.services.routineCommandService.deleteRoutine(this.routineId),
      invalidateKeys: () => [
        Keys.programDetail(this.routine?.program.id ?? ''),
        Keys.routineDetail(this.routineId),
        Keys.programList
      ]
    });

    this.startWorkoutMutation = createMutation<void>({
      fn: () => this.services.workoutCommandService.startWorkoutForRoutine(this.routineId)
    });
  }

  get routine() {
    return this.routineQuery.data;
  }

  get allExerciseTypes() {
    return this.exerciseTypesQuery.data ?? [];
  }

  get exerciseTypes() {
    if (!this.routine) return [];
    return this.routine.exerciseTypeIds
      .map((id) => this.allExerciseTypes.find((et) => et.id === id))
      .filter((et) => et !== undefined);
  }

  get isLoading() {
    const routineIsLoading = this.routineQuery.isLoading;
    const exerciseTypesIsLoading = this.exerciseTypesQuery.isLoading;
    return routineIsLoading || exerciseTypesIsLoading;
  }

  get isActionInProgress() {
    const isLoading = this.isLoading;
    const updateRoutineMutationIsPending = this.updateRoutineMutation.isPending;
    const deleteRoutineMutationIsPending = this.deleteRoutineMutation.isPending;
    const startWorkoutMutationIsPending = this.startWorkoutMutation.isPending;
    return (
      isLoading ||
      updateRoutineMutationIsPending ||
      deleteRoutineMutationIsPending ||
      startWorkoutMutationIsPending
    );
  }

  get isSaving() {
    return this.updateRoutineMutation.isPending;
  }

  get isDeleting() {
    return this.deleteRoutineMutation.isPending;
  }

  get isStartingWorkout() {
    return this.startWorkoutMutation.isPending;
  }

  get errorMessage() {
    const routineError = this.routineQuery.error?.message;
    const exerciseTypesError = this.exerciseTypesQuery.error?.message;
    const updateRoutineMutationError = this.updateRoutineMutation.error?.message;
    const deleteRoutineMutationError = this.deleteRoutineMutation.error?.message;
    const startWorkoutMutationError = this.startWorkoutMutation.error?.message;
    return (
      routineError ||
      exerciseTypesError ||
      updateRoutineMutationError ||
      deleteRoutineMutationError ||
      startWorkoutMutationError ||
      null
    );
  }

  updateRoutine(routine: RoutineCommand.Update) {
    return this.updateRoutineMutation.mutateAsync(routine);
  }

  deleteRoutine() {
    return this.deleteRoutineMutation.mutateAsync(undefined);
  }

  startWorkout() {
    return this.startWorkoutMutation.mutateAsync();
  }
}
