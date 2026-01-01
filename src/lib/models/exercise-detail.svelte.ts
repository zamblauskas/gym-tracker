import type { ExerciseViewService } from '$lib/services/exercise-view.service';
import type { ExerciseCommandService } from '$lib/services/exercise-command.service';
import * as Exercise from '$lib/types/views/exercise';
import type { Range } from '$lib/types/range';
import { logger } from '$lib/logger';

export class ExerciseDetailModel {
  exercise = $state<Exercise.Detail | null>(null);
  isLoading = $state(true);
  isSaving = $state(false);
  isDeleting = $state(false);
  isActionInProgress = $derived(this.isLoading || this.isSaving || this.isDeleting);
  errorMessage = $state('');

  constructor(
    private exerciseId: string,
    private viewService: ExerciseViewService,
    private commandService: ExerciseCommandService
  ) {}

  async loadData() {
    logger.info('Loading exercise data', { exerciseId: this.exerciseId });

    this.isLoading = true;
    this.errorMessage = '';
    try {
      this.exercise = await this.viewService.getExerciseDetailById(this.exerciseId);
      logger.info('Exercise data loaded', { exercise: $state.snapshot(this.exercise) });
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to load exercise';
      logger.error('Failed to load exercise', { exerciseId: this.exerciseId, error });
    } finally {
      this.isLoading = false;
    }
  }

  async updateExercise(
    name: string,
    machineBrand: string | null,
    targetRepRange: Range<number>,
    targetRepsInReserve: number | null
  ): Promise<boolean> {
    logger.info('Updating exercise', {
      exerciseId: this.exerciseId,
      name,
      machineBrand,
      targetRepRange,
      targetRepsInReserve
    });

    this.isSaving = true;
    this.errorMessage = '';
    try {
      await this.commandService.updateExercise(this.exerciseId, {
        name,
        machineBrand,
        targetRepRange,
        targetRepsInReserve
      });
      logger.info('Exercise updated', { exerciseId: this.exerciseId });
      await this.loadData();
      return true;
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to update exercise';
      logger.error('Failed to update exercise', { exerciseId: this.exerciseId, error });
      return false;
    } finally {
      this.isSaving = false;
    }
  }

  async deleteExercise(): Promise<boolean> {
    logger.info('Deleting exercise', { exerciseId: this.exerciseId });

    this.isDeleting = true;
    this.errorMessage = '';
    try {
      await this.commandService.deleteExercise(this.exerciseId);
      logger.info('Exercise deleted', { exerciseId: this.exerciseId });
      return true;
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to delete exercise';
      logger.error('Failed to delete exercise', { exerciseId: this.exerciseId, error });
      return false;
    } finally {
      this.isDeleting = false;
    }
  }
}
