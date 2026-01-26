import { SERVICES_KEY, type Services } from '$lib/context';
import { Keys } from '$lib/query-keys';
import {
  Exercise as ExerciseCommand,
  ExerciseType as ExerciseTypeCommand
} from '$lib/types/commands';
import type { ExerciseType, Gym } from '$lib/types/views';
import { createMutation, deleteMutation, fetchQuery, updateMutation } from '$lib/utils/query';
import { type CreateMutationResult, type CreateQueryResult } from '@tanstack/svelte-query';
import { getContext } from 'svelte';

export class ExerciseTypeDetailModel {
  private services = getContext<Services>(SERVICES_KEY);
  private exerciseTypeId: string;

  exerciseTypeQuery: CreateQueryResult<ExerciseType.Detail>;
  gymsQuery: CreateQueryResult<Gym.Compact[]>;

  updateExerciseTypeMutation: CreateMutationResult<void, Error, ExerciseTypeCommand.Update>;
  deleteExerciseTypeMutation: CreateMutationResult<void, Error>;
  createExerciseMutation: CreateMutationResult<string, Error, ExerciseCommand.Create>;

  constructor(exerciseTypeId: string) {
    this.exerciseTypeId = exerciseTypeId;

    this.exerciseTypeQuery = fetchQuery({
      key: () => Keys.exerciseTypeDetail(this.exerciseTypeId),
      fn: () => this.services.exerciseTypeViewService.getExerciseTypeDetailById(this.exerciseTypeId)
    });

    this.gymsQuery = fetchQuery({
      key: () => Keys.gymList,
      fn: () => this.services.gymViewService.listGyms()
    });

    this.updateExerciseTypeMutation = updateMutation({
      key: () => Keys.exerciseTypeDetail(this.exerciseTypeId),
      fn: (data: ExerciseTypeCommand.Update) =>
        this.services.exerciseTypeCommandService.updateExerciseType(this.exerciseTypeId, data),
      invalidateKeys: () => [
        Keys.exerciseTypeList,
        Keys.exerciseTypeDetail(this.exerciseTypeId),
        Keys.workoutHistory
      ],
      merge: (previousData, update): ExerciseType.Detail => {
        return {
          ...previousData,
          name: update.name,
          targetRepRange: update.targetRepRange,
          targetRepsInReserve: update.targetRepsInReserve
        };
      }
    });

    this.deleteExerciseTypeMutation = deleteMutation({
      fn: () => this.services.exerciseTypeCommandService.deleteExerciseType(this.exerciseTypeId),
      invalidateKeys: () => [Keys.exerciseTypeList, Keys.exerciseTypeDetail(this.exerciseTypeId)]
    });

    this.createExerciseMutation = createMutation({
      fn: (data: ExerciseCommand.Create) =>
        this.services.exerciseCommandService.createExercise(data),
      invalidateKeys: () => [Keys.exerciseTypeList, Keys.exerciseTypeDetail(this.exerciseTypeId)]
    });
  }

  get exerciseType() {
    return this.exerciseTypeQuery.data ?? null;
  }

  get gyms() {
    return this.gymsQuery.data ?? [];
  }

  get isLoading() {
    const exerciseTypeIsLoading = this.exerciseTypeQuery.isLoading;
    const gymsIsLoading = this.gymsQuery.isLoading;

    return exerciseTypeIsLoading || gymsIsLoading;
  }

  get isExerciseCreating() {
    return this.createExerciseMutation.isPending;
  }

  get isExerciseTypeSaving() {
    return this.updateExerciseTypeMutation.isPending;
  }

  get isExerciseTypeDeleting() {
    return this.deleteExerciseTypeMutation.isPending;
  }

  get isActionInProgress() {
    const isLoading = this.isLoading;
    const isExerciseCreating = this.isExerciseCreating;
    const isExerciseTypeSaving = this.isExerciseTypeSaving;
    const isExerciseTypeDeleting = this.isExerciseTypeDeleting;

    return isLoading || isExerciseCreating || isExerciseTypeSaving || isExerciseTypeDeleting;
  }

  get errorMessage() {
    const exerciseTypeError = this.exerciseTypeQuery.error?.message;
    const gymsError = this.gymsQuery.error?.message;
    const updateError = this.updateExerciseTypeMutation.error?.message;
    const deleteError = this.deleteExerciseTypeMutation.error?.message;
    const createExerciseError = this.createExerciseMutation.error?.message;

    return (
      exerciseTypeError || gymsError || updateError || deleteError || createExerciseError || null
    );
  }

  updateExerciseType(exerciseType: ExerciseTypeCommand.Update) {
    return this.updateExerciseTypeMutation.mutateAsync(exerciseType);
  }

  deleteExerciseType() {
    return this.deleteExerciseTypeMutation.mutateAsync(undefined);
  }

  createExercise(exercise: ExerciseCommand.Create) {
    return this.createExerciseMutation.mutateAsync(exercise);
  }
}
