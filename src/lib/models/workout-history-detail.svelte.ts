import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import type { WorkoutHistoryCommandService } from '$lib/services/workout-history-command.service';
import type { WorkoutHistoryViewService } from '$lib/services/workout-history-view.service';
import type { HistoryDetail } from '$lib/types/views/workout';
import { logger } from '$lib/logger';

export class WorkoutHistoryDetailModel {
  workout = $state<HistoryDetail | null>(null);
  isLoading = $state(true);
  isDeleting = $state(false);
  isActionInProgress = $derived(this.isLoading || this.isDeleting);
  errorMessage = $state('');

  constructor(
    private workoutId: string,
    private viewService: WorkoutHistoryViewService,
    private commandService: WorkoutHistoryCommandService
  ) {}

  async loadData() {
    logger.info('Loading workout history', { workoutId: this.workoutId });

    this.isLoading = true;
    this.errorMessage = '';

    try {
      this.workout = await this.viewService.getHistoryDetail(this.workoutId);
      logger.info('Workout history loaded', {
        workout: $state.snapshot(this.workout)
      });
    } catch (e) {
      this.errorMessage = e instanceof Error ? e.message : 'Failed to load workout history';
      logger.error('Failed to load workout history', { workoutId: this.workoutId, error: e });
    } finally {
      this.isLoading = false;
    }
  }

  async delete() {
    if (!this.workout) return;

    logger.info('Deleting workout', { workoutId: this.workoutId });

    this.isDeleting = true;
    this.errorMessage = '';

    try {
      await this.commandService.deleteWorkout(this.workout.id);
      logger.info('Workout deleted', { workoutId: this.workoutId });
      await goto(resolve('/workout-history'));
    } catch (e) {
      this.errorMessage = e instanceof Error ? e.message : 'Failed to delete workout';
      logger.error('Failed to delete workout', { workoutId: this.workoutId, error: e });
    } finally {
      this.isDeleting = false;
    }
  }
}
