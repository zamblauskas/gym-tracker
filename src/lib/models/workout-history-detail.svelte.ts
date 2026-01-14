import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import type { WorkoutHistoryCommandService } from '$lib/services/workout-history-command.service';
import type { WorkoutHistoryViewService } from '$lib/services/workout-history-view.service';
import type { HistoryDetail } from '$lib/types/views/workout';
import { logger } from '$lib/logger';

export class WorkoutHistoryDetailModel {
  workout = $state<HistoryDetail | null>(null);
  loading = $state(true);
  isDeleting = $state(false);
  isActionInProgress = $derived(this.loading || this.isDeleting);
  error = $state<string | null>(null);

  constructor(
    private viewService: WorkoutHistoryViewService,
    private commandService: WorkoutHistoryCommandService
  ) {}

  async load(id: string) {
    this.loading = true;
    this.error = null;

    try {
      this.workout = await this.viewService.getHistoryDetail(id);
      logger.info('Workout history loaded', { id });
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Failed to load workout history';
      logger.error('Failed to load workout history', { error: e });
    } finally {
      this.loading = false;
    }
  }

  async delete() {
    if (!this.workout) return;

    this.isDeleting = true;
    this.error = null;

    try {
      await this.commandService.deleteWorkout(this.workout.id);
      logger.info('Workout deleted', { id: this.workout.id });
      await goto(resolve('/workout-history'));
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Failed to delete workout';
      logger.error('Failed to delete workout', { error: e });
    } finally {
      this.isDeleting = false;
    }
  }
}
