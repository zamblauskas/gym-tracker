import type { ExerciseTypeViewService } from '$lib/services/exercise-type-view.service';
import type { ExerciseTypeCommandService } from '$lib/services/exercise-type-command.service';
import type { ExerciseCommandService } from '$lib/services/exercise-command.service';
import type { GymViewService } from '$lib/services/gym-view.service';
import * as ExerciseType from '$lib/types/views/exercise-type';
import type { Gym } from '$lib/types/views';
import type { Range } from '$lib/types/range';
import { logger } from '$lib/logger';

export class ExerciseTypeDetailModel {
  exerciseType = $state<ExerciseType.Detail | null>(null);
  allGyms = $state<Gym.Compact[]>([]);
  isLoading = $state(true);
  isCreating = $state(false);
  isSaving = $state(false);
  isDeleting = $state(false);
  isActionInProgress = $derived(
    this.isLoading || this.isCreating || this.isSaving || this.isDeleting
  );
  errorMessage = $state('');

  constructor(
    private exerciseTypeId: string,
    private exerciseTypeViewService: ExerciseTypeViewService,
    private exerciseTypeCommandService: ExerciseTypeCommandService,
    private exerciseCommandService: ExerciseCommandService,
    private gymViewService: GymViewService
  ) {}

  async loadData() {
    logger.info('Loading exercise type data', { exerciseTypeId: this.exerciseTypeId });

    this.isLoading = true;
    this.errorMessage = '';
    try {
      const [exerciseType, allGyms] = await Promise.all([
        this.exerciseTypeViewService.getExerciseTypeDetailById(this.exerciseTypeId),
        this.gymViewService.listGyms()
      ]);
      this.exerciseType = exerciseType;
      this.allGyms = allGyms;
      logger.info('Exercise type data loaded', {
        exerciseType: $state.snapshot(this.exerciseType),
        allGyms: $state.snapshot(this.allGyms)
      });
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to load exercise type';
      logger.error('Failed to load exercise type', { exerciseTypeId: this.exerciseTypeId, error });
    } finally {
      this.isLoading = false;
    }
  }

  async updateExerciseType(
    name: string,
    targetRepRange: Range<number>,
    targetRepsInReserve: number | null
  ): Promise<boolean> {
    logger.info('Updating exercise type', {
      exerciseTypeId: this.exerciseTypeId,
      name,
      targetRepRange,
      targetRepsInReserve
    });

    this.isSaving = true;
    this.errorMessage = '';
    try {
      await this.exerciseTypeCommandService.updateExerciseType(this.exerciseTypeId, {
        name,
        targetRepRange,
        targetRepsInReserve
      });
      logger.info('Exercise type updated', { exerciseTypeId: this.exerciseTypeId });
      await this.loadData();
      return true;
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to update exercise type';
      logger.error('Failed to update exercise type', {
        exerciseTypeId: this.exerciseTypeId,
        name,
        error
      });
      return false;
    } finally {
      this.isSaving = false;
    }
  }

  async deleteExerciseType(): Promise<boolean> {
    logger.info('Deleting exercise type', { exerciseTypeId: this.exerciseTypeId });

    this.isDeleting = true;
    this.errorMessage = '';
    try {
      await this.exerciseTypeCommandService.deleteExerciseType(this.exerciseTypeId);
      logger.info('Exercise type deleted', { exerciseTypeId: this.exerciseTypeId });
      return true;
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to delete exercise type';
      logger.error('Failed to delete exercise type', {
        exerciseTypeId: this.exerciseTypeId,
        error
      });
      return false;
    } finally {
      this.isDeleting = false;
    }
  }

  async createExercise(
    name: string,
    machineBrand: string | null,
    notes: string | null,
    targetRepRange: Range<number>,
    targetRepsInReserve: number | null,
    gymIds: string[]
  ): Promise<boolean> {
    logger.info('Creating exercise', {
      exerciseTypeId: this.exerciseTypeId,
      name,
      machineBrand,
      targetRepRange,
      targetRepsInReserve,
      gymIds
    });

    this.isCreating = true;
    this.errorMessage = '';
    try {
      const exerciseId = await this.exerciseCommandService.createExercise({
        exerciseTypeId: this.exerciseTypeId,
        name,
        machineBrand,
        notes,
        targetRepRange,
        targetRepsInReserve,
        gymIds
      });
      logger.info('Exercise created', { exerciseId });
      await this.loadData();
      return true;
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to create exercise';
      logger.error('Failed to create exercise', { exerciseTypeId: this.exerciseTypeId, error });
      return false;
    } finally {
      this.isCreating = false;
    }
  }
}
