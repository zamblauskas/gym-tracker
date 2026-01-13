import type { WorkoutHistoryViewService } from '$lib/services/workout-history-view.service';
import * as Workout from '$lib/types/views/workout';
import { logger } from '$lib/logger';

export class WorkoutHistoryListModel {
  historyItems = $state<Workout.HistoryItem[]>([]);
  isLoading = $state(true);
  errorMessage = $state('');

  constructor(private viewSvc: WorkoutHistoryViewService) {}

  async loadData() {
    logger.info('Loading workout history');
    this.isLoading = true;
    this.errorMessage = '';
    try {
      this.historyItems = await this.viewSvc.getHistory();
      logger.info('Workout history loaded', { historyItems: $state.snapshot(this.historyItems) });
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to load workout history';
      logger.error('Failed to load workout history', { error });
    } finally {
      this.isLoading = false;
    }
  }
}
