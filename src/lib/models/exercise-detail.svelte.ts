import { logger } from '$lib/logger';
import {
  createMutation,
  createQuery,
  useQueryClient,
  type CreateMutationResult,
  type CreateQueryResult
} from '@tanstack/svelte-query';
import { Exercise as ExerciseCommand } from '$lib/types/commands';
import { SERVICES_KEY } from '$lib/context';
import { getContext } from 'svelte';
import type { Services } from '$lib/context';
import type { Exercise, Gym, Workout } from '$lib/types/views';
import { Keys } from '$lib/query-keys';

export class ExerciseDetailModel {
  private services = getContext<Services>(SERVICES_KEY);
  private queryClient = useQueryClient();

  private exerciseId: string;

  exerciseQuery: CreateQueryResult<Exercise.Detail>;
  gymsQuery: CreateQueryResult<Gym.Compact[]>;
  historyQuery: CreateQueryResult<Workout.ExerciseHistory[]>;
  updateMutation: CreateMutationResult<void, Error, ExerciseCommand.Update>;
  deleteMutation: CreateMutationResult<void, Error>;

  constructor(exerciseId: string) {
    this.exerciseId = exerciseId;

    this.exerciseQuery = createQuery(() => ({
      queryKey: Keys.exercise(this.exerciseId),
      queryFn: async () => {
        logger.info('Fetching exercise detail', { exerciseId: this.exerciseId });
        const result = await this.services.exerciseViewService.getExerciseDetailById(
          this.exerciseId
        );
        logger.info('Fetched exercise detail', { exerciseId: this.exerciseId, result });
        return result;
      }
    }));

    this.gymsQuery = createQuery(() => ({
      queryKey: Keys.gyms,
      queryFn: async () => {
        logger.info('Fetching gyms');
        const result = await this.services.gymViewService.listGyms();
        logger.info('Fetched gyms', { result });
        return result;
      }
    }));

    this.historyQuery = createQuery(() => ({
      queryKey: Keys.exerciseHistory(this.exerciseId),
      queryFn: async () => {
        logger.info('Fetching exercise history', { exerciseId: this.exerciseId });
        const result = await this.services.workoutViewService.getExerciseHistory(this.exerciseId);
        logger.info('Fetched exercise history', { exerciseId: this.exerciseId, result });
        return result;
      }
    }));

    this.updateMutation = createMutation(() => ({
      mutationFn: async (exercise: ExerciseCommand.Update) => {
        logger.info('Updating exercise', { exerciseId: this.exerciseId, exercise });
        await this.services.exerciseCommandService.updateExercise(this.exerciseId, exercise);
        logger.info('Updated exercise', { exerciseId: this.exerciseId });
      },
      onMutate: async (exercise: ExerciseCommand.Update) => {
        await this.queryClient.cancelQueries({ queryKey: Keys.exercise(this.exerciseId) });

        const previousExercise = this.queryClient.getQueryData<Exercise.Detail>(
          Keys.exercise(this.exerciseId)
        );

        if (!previousExercise) {
          logger.warn('No previous exercise found', { exerciseId: this.exerciseId });
          return { previousExercise };
        }

        const newExercise = {
          ...previousExercise,
          name: exercise.name,
          machineBrand: exercise.machineBrand,
          notes: exercise.notes,
          targetRepRange: exercise.targetRepRange,
          targetRepsInReserve: exercise.targetRepsInReserve,
          gyms: this.gyms.filter((gym) => exercise.gymIds.includes(gym.id))
        };

        this.queryClient.setQueryData<Exercise.Detail>(Keys.exercise(this.exerciseId), newExercise);

        return { previousExercise };
      },
      onError: (error, _, context) => {
        logger.error('Failed to update exercise', { exerciseId: this.exerciseId, error });
        if (context?.previousExercise) {
          this.queryClient.setQueryData<Exercise.Detail>(
            Keys.exercise(this.exerciseId),
            context.previousExercise
          );
        }
      },
      onSettled: () => {
        return this.queryClient.invalidateQueries({ queryKey: Keys.exercise(this.exerciseId) });
      }
    }));

    this.deleteMutation = createMutation(() => ({
      mutationFn: async () => {
        logger.info('Deleting exercise', { exerciseId: this.exerciseId });
        await this.services.exerciseCommandService.deleteExercise(this.exerciseId);
        logger.info('Deleted exercise', { exerciseId: this.exerciseId });
      },
      onSuccess: () => {
        return this.queryClient.invalidateQueries({ queryKey: Keys.exercise(this.exerciseId) });
      }
    }));
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

  get isActionInProgress() {
    const exerciseIsLoading = this.exerciseQuery.isLoading;
    const gymsIsLoading = this.gymsQuery.isLoading;
    const historyIsLoading = this.historyQuery.isLoading;
    const updateMutationIsPending = this.updateMutation.isPending;
    const deleteMutationIsPending = this.deleteMutation.isPending;

    return (
      exerciseIsLoading ||
      gymsIsLoading ||
      historyIsLoading ||
      updateMutationIsPending ||
      deleteMutationIsPending
    );
  }

  get isSavingExercise() {
    return this.updateMutation.isPending;
  }

  get isDeletingExercise() {
    return this.deleteMutation.isPending;
  }

  get errorMessage() {
    const exerciseError = this.exerciseQuery.error;
    const gymsError = this.gymsQuery.error;
    const historyError = this.historyQuery.error;
    const updateMutationError = this.updateMutation.error;
    const deleteMutationError = this.deleteMutation.error;

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
    return this.updateMutation.mutateAsync(exercise);
  }

  delete() {
    return this.deleteMutation.mutateAsync({});
  }
}
