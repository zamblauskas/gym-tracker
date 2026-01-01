import type { ExerciseTypeViewService } from '$lib/services/exercise-type-view.service';
import type { ExerciseTypeCommandService } from '$lib/services/exercise-type-command.service';
import * as ExerciseType from '$lib/types/views/exercise-type';
import { logger } from '$lib/logger';

export class ExerciseTypeListModel {
  exerciseTypes = $state<ExerciseType.Compact[]>([]);
  isLoading = $state(true);
  isCreating = $state(false);
  isActionInProgress = $derived(this.isLoading || this.isCreating);
  errorMessage = $state('');

  constructor(
    private viewService: ExerciseTypeViewService,
    private commandService: ExerciseTypeCommandService
  ) {}

  async loadData() {
    logger.info('Loading exercise types');

    this.isLoading = true;
    this.errorMessage = '';
    try {
      this.exerciseTypes = await this.viewService.listExerciseTypes();
      logger.info('Exercise types loaded', { exerciseTypes: $state.snapshot(this.exerciseTypes) });
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to load exercise types';
      logger.error('Failed to load exercise types', { error });
    } finally {
      this.isLoading = false;
    }
  }

  async createExerciseType(name: string): Promise<boolean> {
    logger.info('Creating exercise type', { name });

    this.isCreating = true;
    this.errorMessage = '';
    try {
      const exerciseTypeId = await this.commandService.createExerciseType({ name });
      logger.info('Exercise type created', { exerciseTypeId });
      await this.loadData();
      return true;
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to create exercise type';
      logger.error('Failed to create exercise type', { name, error });
      return false;
    } finally {
      this.isCreating = false;
    }
  }
}
