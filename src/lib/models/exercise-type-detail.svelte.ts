import { logger } from '$lib/logger';
import {
  createMutation,
  createQuery,
  useQueryClient,
  type CreateMutationResult,
  type CreateQueryResult
} from '@tanstack/svelte-query';
import { SERVICES_KEY, type Services } from '$lib/context';
import { getContext } from 'svelte';
import { Keys } from '$lib/query-keys';
import type { ExerciseType, Gym } from '$lib/types/views';
import { ExerciseType as ExerciseTypeCommand } from '$lib/types/commands';
import { Exercise as ExerciseCommand } from '$lib/types/commands';

export class ExerciseTypeDetailModel {
  private services = getContext<Services>(SERVICES_KEY);
  private queryClient = useQueryClient();
  private exerciseTypeId: string;

  exerciseTypeQuery: CreateQueryResult<ExerciseType.Detail>;
  gymsQuery: CreateQueryResult<Gym.Compact[]>;

  updateMutation: CreateMutationResult<void, Error, ExerciseTypeCommand.Update>;
  deleteMutation: CreateMutationResult<void, Error>;
  createExerciseMutation: CreateMutationResult<string, Error, ExerciseCommand.Create>;

  constructor(exerciseTypeId: string) {
    this.exerciseTypeId = exerciseTypeId;

    this.exerciseTypeQuery = createQuery(() => ({
      queryKey: Keys.exerciseType(this.exerciseTypeId),
      queryFn: async () => {
        logger.info('Loading exercise type data', { exerciseTypeId: this.exerciseTypeId });
        const result = await this.services.exerciseTypeViewService.getExerciseTypeDetailById(
          this.exerciseTypeId
        );
        logger.info('Exercise type data loaded', { result });
        return result;
      }
    }));

    this.gymsQuery = createQuery(() => ({
      queryKey: Keys.gyms,
      queryFn: async () => {
        logger.info('Loading gyms');
        const result = await this.services.gymViewService.listGyms();
        logger.info('Gyms loaded', { result });
        return result;
      }
    }));

    this.updateMutation = createMutation(() => ({
      mutationFn: async (exerciseType: ExerciseTypeCommand.Update) => {
        logger.info('Updating exercise type', {
          exerciseTypeId: this.exerciseTypeId,
          exerciseType
        });
        await this.services.exerciseTypeCommandService.updateExerciseType(
          this.exerciseTypeId,
          exerciseType
        );
        logger.info('Exercise type updated', { exerciseTypeId: this.exerciseTypeId });
      },
      onMutate: async (exerciseType: ExerciseTypeCommand.Update) => {
        await this.queryClient.cancelQueries({ queryKey: Keys.exerciseType(this.exerciseTypeId) });

        const previousExerciseType = this.queryClient.getQueryData<ExerciseType.Detail>(
          Keys.exerciseType(this.exerciseTypeId)
        );

        if (!previousExerciseType) {
          return;
        }

        const newExerciseType = {
          ...previousExerciseType,
          name: exerciseType.name,
          targetRepRange: exerciseType.targetRepRange,
          targetRepsInReserve: exerciseType.targetRepsInReserve
        };
        this.queryClient.setQueryData<ExerciseType.Detail>(
          Keys.exerciseType(this.exerciseTypeId),
          newExerciseType
        );

        return { previousExerciseType };
      },
      onError: (error, _, context) => {
        logger.error('Failed to update exercise type', {
          exerciseTypeId: this.exerciseTypeId,
          error
        });
        if (context?.previousExerciseType) {
          this.queryClient.setQueryData<ExerciseType.Detail>(
            Keys.exerciseType(this.exerciseTypeId),
            context.previousExerciseType
          );
        }
      },
      onSettled: () => {
        return this.queryClient.invalidateQueries({
          queryKey: Keys.exerciseType(this.exerciseTypeId)
        });
      }
    }));

    this.deleteMutation = createMutation(() => ({
      mutationFn: async () => {
        logger.info('Deleting exercise type', { exerciseTypeId: this.exerciseTypeId });
        await this.services.exerciseTypeCommandService.deleteExerciseType(this.exerciseTypeId);
        logger.info('Exercise type deleted', { exerciseTypeId: this.exerciseTypeId });
      },
      onSuccess: () => {
        return this.queryClient.invalidateQueries({
          queryKey: Keys.exerciseType(this.exerciseTypeId)
        });
      }
    }));

    this.createExerciseMutation = createMutation(() => ({
      mutationFn: async (exercise: ExerciseCommand.Create) => {
        logger.info('Creating exercise', { exercise });
        const exerciseId = await this.services.exerciseCommandService.createExercise(exercise);
        logger.info('Exercise created', { exerciseId });
        return exerciseId;
      },
      onSuccess: () => {
        return this.queryClient.invalidateQueries({
          queryKey: Keys.exerciseType(this.exerciseTypeId)
        });
      }
    }));
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
    return this.updateMutation.isPending;
  }

  get isExerciseTypeDeleting() {
    return this.deleteMutation.isPending;
  }

  get isActionInProgress() {
    const isLoading = this.isLoading;
    const isExerciseCreating = this.isExerciseCreating;
    const isExerciseTypeSaving = this.isExerciseTypeSaving;
    const isExerciseTypeDeleting = this.isExerciseTypeDeleting;

    return isLoading || isExerciseCreating || isExerciseTypeSaving || isExerciseTypeDeleting;
  }

  get errorMessage() {
    const exerciseTypeError = this.exerciseTypeQuery.error;
    const gymsError = this.gymsQuery.error;
    const updateError = this.updateMutation.error;
    const deleteError = this.deleteMutation.error;
    const createExerciseError = this.createExerciseMutation.error;

    return (
      exerciseTypeError?.message ||
      gymsError?.message ||
      updateError?.message ||
      deleteError?.message ||
      createExerciseError?.message ||
      null
    );
  }

  updateExerciseType(exerciseType: ExerciseTypeCommand.Update) {
    return this.updateMutation.mutateAsync(exerciseType);
  }

  deleteExerciseType() {
    return this.deleteMutation.mutateAsync(undefined);
  }

  createExercise(exercise: ExerciseCommand.Create) {
    return this.createExerciseMutation.mutateAsync(exercise);
  }
}
