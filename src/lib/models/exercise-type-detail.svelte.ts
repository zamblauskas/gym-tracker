import type { ExerciseTypeViewService } from '$lib/services/exercise-type-view.service';
import type { ExerciseTypeCommandService } from '$lib/services/exercise-type-command.service';
import type { ExerciseCommandService } from '$lib/services/exercise-command.service';
import * as ExerciseType from '$lib/types/views/exercise-type';
import type { Range } from '$lib/types/range';
import { logger } from '$lib/logger';

export class ExerciseTypeDetailModel {
  exerciseType = $state<ExerciseType.Detail | null>(null);
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
    private exerciseCommandService: ExerciseCommandService
  ) {}

  async loadData() {
    logger.info('Loading exercise type data', { exerciseTypeId: this.exerciseTypeId });

    this.isLoading = true;
    this.errorMessage = '';
    try {
      this.exerciseType = await this.exerciseTypeViewService.getExerciseTypeDetailById(
        this.exerciseTypeId
      );
      logger.info('Exercise type data loaded', {
        exerciseType: $state.snapshot(this.exerciseType)
      });
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to load exercise type';
      logger.error('Failed to load exercise type', { exerciseTypeId: this.exerciseTypeId, error });
    } finally {
      this.isLoading = false;
    }
  }

  async updateExerciseType(name: string): Promise<boolean> {
    logger.info('Updating exercise type', { exerciseTypeId: this.exerciseTypeId, name });

    this.isSaving = true;
    this.errorMessage = '';
    try {
      await this.exerciseTypeCommandService.updateExerciseType(this.exerciseTypeId, { name });
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
    targetRepRange: Range<number>,
    targetRepsInReserve: number | null
  ): Promise<boolean> {
    logger.info('Creating exercise', {
      exerciseTypeId: this.exerciseTypeId,
      name,
      machineBrand,
      targetRepRange,
      targetRepsInReserve
    });

    this.isCreating = true;
    this.errorMessage = '';
    try {
      const exerciseId = await this.exerciseCommandService.createExercise({
        exerciseTypeId: this.exerciseTypeId,
        name,
        machineBrand,
        targetRepRange,
        targetRepsInReserve
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
