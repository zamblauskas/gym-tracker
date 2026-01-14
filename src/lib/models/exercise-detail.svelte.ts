import type { ExerciseViewService } from '$lib/services/exercise-view.service';
import type { ExerciseCommandService } from '$lib/services/exercise-command.service';
import type { GymViewService } from '$lib/services/gym-view.service';
import type { WorkoutViewService } from '$lib/services/workout-view.service';
import type { Exercise, Gym, Workout } from '$lib/types/views';
import type { Range } from '$lib/types/range';
import { logger } from '$lib/logger';

export class ExerciseDetailModel {
  exercise = $state<Exercise.Detail | null>(null);
  allGyms = $state<Gym.Compact[]>([]);
  history = $state<Workout.ExerciseHistory[]>([]);
  isLoading = $state(true);
  isSaving = $state(false);
  isDeleting = $state(false);
  isActionInProgress = $derived(this.isLoading || this.isSaving || this.isDeleting);
  errorMessage = $state('');

  constructor(
    private exerciseId: string,
    private exerciseViewSvc: ExerciseViewService,
    private exerciseCommandSvc: ExerciseCommandService,
    private gymViewSvc: GymViewService,
    private workoutViewSvc: WorkoutViewService
  ) {}

  async loadData() {
    logger.info('Loading exercise data', { exerciseId: this.exerciseId });

    this.isLoading = true;
    this.errorMessage = '';
    try {
      const [exercise, allGyms, history] = await Promise.all([
        this.exerciseViewSvc.getExerciseDetailById(this.exerciseId),
        this.gymViewSvc.listGyms(),
        this.workoutViewSvc.getExerciseHistory(this.exerciseId)
      ]);
      this.exercise = exercise;
      this.allGyms = allGyms;
      this.history = history;
      logger.info('Exercise data loaded', {
        exercise: $state.snapshot(this.exercise),
        allGyms: $state.snapshot(this.allGyms),
        historyCount: $state.snapshot(this.history)
      });
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
    notes: string | null,
    targetRepRange: Range<number>,
    targetRepsInReserve: number | null,
    gymIds: string[]
  ): Promise<boolean> {
    logger.info('Updating exercise', {
      exerciseId: this.exerciseId,
      name,
      machineBrand,
      targetRepRange,
      targetRepsInReserve,
      gymIds
    });

    this.isSaving = true;
    this.errorMessage = '';
    try {
      await this.exerciseCommandSvc.updateExercise(this.exerciseId, {
        name,
        machineBrand,
        notes,
        targetRepRange,
        targetRepsInReserve,
        gymIds
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
      await this.exerciseCommandSvc.deleteExercise(this.exerciseId);
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
