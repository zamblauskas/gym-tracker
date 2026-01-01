import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { WorkoutViewService } from '$lib/services/workout-view.service';
import { WorkoutCommandService } from '$lib/services/workout-command.service';
import * as Workout from '$lib/types/views/workout';
import { logger } from '$lib/logger';

export class WorkoutDetailModel {
  view = $state<Workout.Detail | null>(null);
  exerciseHistory = $state<Workout.ExerciseHistory[]>([]);

  currentIndex = $state(0);
  currentExerciseLog = $derived(this.view?.exercises[this.currentIndex]);

  isLoading = $state(true);
  errorMessage = $state<string | null>(null);

  constructor(
    private viewService: WorkoutViewService,
    private commandService: WorkoutCommandService,
    private workoutId: string
  ) {}

  async loadData() {
    logger.info('Loading workout data', { workoutId: this.workoutId });

    this.isLoading = true;
    this.errorMessage = null;
    try {
      this.view = await this.viewService.getWorkoutDetail(this.workoutId);
      if (this.currentExerciseLog?.exercise?.id) {
        await this.loadExerciseHistory(this.currentExerciseLog.exercise.id);
      }
      logger.info('Workout data loaded', {
        view: $state.snapshot(this.view)
      });
    } catch (error) {
      this.errorMessage = 'Failed to load workout data';
      logger.error('Failed to load workout data', { workoutId: this.workoutId, error });
    } finally {
      this.isLoading = false;
    }
  }

  async selectExercise(exerciseId: string) {
    if (!this.currentExerciseLog) return;
    logger.info('Selecting exercise', {
      workoutExerciseId: this.currentExerciseLog.id,
      exerciseId
    });

    try {
      await this.commandService.selectExercise({
        exerciseLogId: this.currentExerciseLog.id,
        exerciseId
      });
      logger.info('Exercise selected', { workoutExerciseId: this.currentExerciseLog.id });
      await this.loadData();
    } catch (error) {
      this.errorMessage = 'Failed to select exercise';
      logger.error('Failed to select exercise', {
        workoutExerciseId: this.currentExerciseLog.id,
        exerciseId,
        error
      });
    }
  }

  async loadExerciseHistory(exerciseId: string) {
    logger.info('Loading exercise history', { exerciseId, workoutId: this.workoutId });

    try {
      this.exerciseHistory = await this.viewService.getExerciseHistory(
        exerciseId,
        this.workoutId,
        5
      );
      logger.info('Exercise history loaded', {
        exerciseHistory: $state.snapshot(this.exerciseHistory)
      });
    } catch (error) {
      this.exerciseHistory = [];
      logger.error('Failed to load exercise history', {
        exerciseId,
        workoutId: this.workoutId,
        error
      });
    }
  }

  async navigateTo(index: number) {
    if (!this.view) return;
    if (index < 0 || index >= this.view.exercises.length) return;
    this.currentIndex = index;
    if (this.currentExerciseLog?.exercise?.id) {
      await this.loadExerciseHistory(this.currentExerciseLog.exercise.id);
    } else {
      this.exerciseHistory = [];
    }
  }

  async addSet(reps: number, weight: number, repsInReserve: number | null) {
    if (!this.currentExerciseLog) return;
    logger.info('Adding set', {
      workoutExerciseId: this.currentExerciseLog.id,
      reps,
      weight,
      repsInReserve
    });

    try {
      await this.commandService.addSet({
        exerciseLogId: this.currentExerciseLog.id,
        reps,
        weight,
        repsInReserve
      });
      logger.info('Set added', { workoutExerciseId: this.currentExerciseLog.id });
      await this.loadData();
    } catch (error) {
      this.errorMessage = 'Failed to add set';
      logger.error('Failed to add set', {
        workoutExerciseId: this.currentExerciseLog.id,
        reps,
        weight,
        repsInReserve,
        error
      });
    }
  }

  async updateSet(setId: string, reps: number, weight: number, repsInReserve: number | null) {
    if (!this.currentExerciseLog) return;
    logger.info('Updating set', { setId, reps, weight, repsInReserve });

    try {
      await this.commandService.updateSet(setId, { reps, weight, repsInReserve });
      logger.info('Set updated', { setId });
      await this.loadData();
    } catch (error) {
      this.errorMessage = 'Failed to update set';
      logger.error('Failed to update set', { setId, reps, weight, repsInReserve, error });
    }
  }

  async deleteSet(setId: string) {
    if (!this.currentExerciseLog) return;
    logger.info('Deleting set', { setId });

    try {
      await this.commandService.deleteSet(setId);
      logger.info('Set deleted', { setId });
      await this.loadData();
    } catch (error) {
      this.errorMessage = 'Failed to delete set';
      logger.error('Failed to delete set', { setId, error });
    }
  }

  async updateNotes(notes: string) {
    if (!this.currentExerciseLog) return;
    logger.info('Updating notes', { workoutExerciseId: this.currentExerciseLog.id, notes });

    try {
      await this.commandService.updateNotes({
        exerciseLogId: this.currentExerciseLog.id,
        notes
      });
      logger.info('Notes updated', { workoutExerciseId: this.currentExerciseLog.id });
    } catch (error) {
      this.errorMessage = 'Failed to update notes';
      logger.error('Failed to update notes', {
        workoutExerciseId: this.currentExerciseLog.id,
        notes,
        error
      });
    }
  }

  async completeWorkout() {
    if (!this.view) return;
    logger.info('Completing workout', { workoutId: this.view.id });

    try {
      await this.commandService.completeWorkout(this.view.id);
      logger.info('Workout completed', { workoutId: this.view.id });
      await goto(resolve('/'));
    } catch (error) {
      this.errorMessage = 'Failed to complete workout';
      logger.error('Failed to complete workout', { workoutId: this.view.id, error });
    }
  }

  async cancelWorkout() {
    if (!this.view) return;
    logger.info('Cancelling workout', { workoutId: this.view.id });

    try {
      await this.commandService.cancelWorkout(this.view.id);
      logger.info('Workout cancelled', { workoutId: this.view.id });
      await goto(resolve('/'));
    } catch (error) {
      this.errorMessage = 'Failed to cancel workout';
      logger.error('Failed to cancel workout', { workoutId: this.view.id, error });
    }
  }
}
