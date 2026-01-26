import { logger } from '$lib/logger';
import type { RoutineViewService } from '$lib/services/routine-view.service';
import type { WorkoutViewService } from '$lib/services/workout-view.service';
import * as Routine from '$lib/types/views/routine';
import * as Workout from '$lib/types/views/workout';

export class HomeModel {
  workouts = $state<Workout.Compact[]>([]);
  nextRoutines = $state<Routine.Compact[]>([]);
  isLoading = $state(true);
  errorMessage = $state('');

  constructor(
    private workoutViewService: WorkoutViewService,
    private routineViewService: RoutineViewService
  ) {}

  async loadData() {
    logger.info('Loading home data');

    this.isLoading = true;
    this.errorMessage = '';
    try {
      const [workouts, nextRoutines] = await Promise.all([
        this.workoutViewService.getInProgressWorkouts(),
        this.routineViewService.getNextRoutineByProgram()
      ]);

      this.workouts = workouts;
      this.nextRoutines = nextRoutines;

      logger.info('Home data loaded', {
        workouts: $state.snapshot(this.workouts),
        nextRoutines: $state.snapshot(this.nextRoutines)
      });
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to load workouts';
      logger.error('Failed to load home data', { error });
    } finally {
      this.isLoading = false;
    }
  }
}
