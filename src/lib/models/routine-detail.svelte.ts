import type { RoutineViewService } from '$lib/services/routine-view.service';
import type { RoutineCommandService } from '$lib/services/routine-command.service';
import type { WorkoutCommandService } from '$lib/services/workout-command.service';
import type { ExerciseTypeViewService } from '$lib/services/exercise-type-view.service';
import * as Routine from '$lib/types/views/routine';
import * as ExerciseType from '$lib/types/views/exercise-type';
import { logger } from '$lib/logger';

export class RoutineDetailModel {
  routine = $state<Routine.Detail | null>(null);
  exerciseTypes = $state<ExerciseType.Compact[]>([]);
  allExerciseTypes = $state<ExerciseType.Compact[]>([]);
  isLoading = $state(true);
  isSaving = $state(false);
  isDeleting = $state(false);
  isStartingWorkout = $state(false);
  isActionInProgress = $derived(
    this.isLoading || this.isSaving || this.isDeleting || this.isStartingWorkout
  );
  errorMessage = $state('');

  constructor(
    private routineViewSvc: RoutineViewService,
    private routineCommandSvc: RoutineCommandService,
    private workoutCommandSvc: WorkoutCommandService,
    private exerciseTypeViewSvc: ExerciseTypeViewService,
    private routineId: string
  ) {}

  async loadData() {
    logger.info('Loading routine data', { routineId: this.routineId });
    this.isLoading = true;
    this.errorMessage = '';
    try {
      const [routineDetail, allExerciseTypesData] = await Promise.all([
        this.routineViewSvc.getRoutineDetailById(this.routineId),
        this.exerciseTypeViewSvc.listExerciseTypes()
      ]);

      this.routine = routineDetail;
      this.allExerciseTypes = allExerciseTypesData;

      this.exerciseTypes = this.routine.exerciseTypeIds
        .map((id) => allExerciseTypesData.find((et) => et.id === id))
        .filter((et) => et !== undefined);

      logger.info('Routine data loaded', {
        routine: $state.snapshot(this.routine),
        exerciseTypes: $state.snapshot(this.exerciseTypes),
        allExerciseTypes: $state.snapshot(this.allExerciseTypes)
      });
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to load routine';
      logger.error('Failed to load routine', { routineId: this.routineId, error });
    } finally {
      this.isLoading = false;
    }
  }

  async updateRoutine(name: string, exerciseTypeIds: string[]): Promise<boolean> {
    logger.info('Updating routine', { routineId: this.routineId, name, exerciseTypeIds });

    this.isSaving = true;
    this.errorMessage = '';
    try {
      await this.routineCommandSvc.updateRoutine(this.routineId, { name, exerciseTypeIds });
      logger.info('Routine updated', { routineId: this.routineId });
      await this.loadData();
      return true;
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to update routine';
      logger.error('Failed to update routine', { routineId: this.routineId, error });
      return false;
    } finally {
      this.isSaving = false;
    }
  }

  async deleteRoutine(): Promise<boolean> {
    logger.info('Deleting routine', { routineId: this.routineId });

    this.isDeleting = true;
    this.errorMessage = '';
    try {
      await this.routineCommandSvc.deleteRoutine(this.routineId);
      logger.info('Routine deleted', { routineId: this.routineId });
      return true;
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to delete routine';
      logger.error('Failed to delete routine', { routineId: this.routineId, error });
      return false;
    } finally {
      this.isDeleting = false;
    }
  }

  async startWorkout(): Promise<string | null> {
    logger.info('Starting workout', { routineId: this.routineId });

    this.isStartingWorkout = true;
    this.errorMessage = '';
    try {
      const workoutId = await this.workoutCommandSvc.startWorkoutForRoutine(this.routineId);
      logger.info('Workout started', { workoutId });
      return workoutId;
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to start workout';
      logger.error('Failed to start workout', { routineId: this.routineId, error });
      return null;
    } finally {
      this.isStartingWorkout = false;
    }
  }
}
