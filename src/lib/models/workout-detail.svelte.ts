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
  currentExercise = $derived(this.currentExerciseLog?.exercise);

  isLoading = $state(true);
  isSelecting = $state(false);
  isAddingSet = $state(false);
  isUpdatingSet = $state(false);
  isDeletingSet = $state(false);
  isSavingNotes = $state(false);
  isCompleting = $state(false);
  isCancelling = $state(false);
  isActionInProgress = $derived(
    this.isLoading ||
      this.isSelecting ||
      this.isAddingSet ||
      this.isUpdatingSet ||
      this.isDeletingSet ||
      this.isSavingNotes ||
      this.isCompleting ||
      this.isCancelling
  );
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

    this.isSelecting = true;
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
    } finally {
      this.isSelecting = false;
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

    this.isAddingSet = true;
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
    } finally {
      this.isAddingSet = false;
    }
  }

  async updateSet(setId: string, reps: number, weight: number, repsInReserve: number | null) {
    if (!this.currentExerciseLog) return;
    logger.info('Updating set', { setId, reps, weight, repsInReserve });

    this.isUpdatingSet = true;
    try {
      await this.commandService.updateSet(setId, { reps, weight, repsInReserve });
      logger.info('Set updated', { setId });
      await this.loadData();
    } catch (error) {
      this.errorMessage = 'Failed to update set';
      logger.error('Failed to update set', { setId, reps, weight, repsInReserve, error });
    } finally {
      this.isUpdatingSet = false;
    }
  }

  async deleteSet(setId: string) {
    if (!this.currentExerciseLog) return;
    logger.info('Deleting set', { setId });

    this.isDeletingSet = true;
    try {
      await this.commandService.deleteSet(setId);
      logger.info('Set deleted', { setId });
      await this.loadData();
    } catch (error) {
      this.errorMessage = 'Failed to delete set';
      logger.error('Failed to delete set', { setId, error });
    } finally {
      this.isDeletingSet = false;
    }
  }

  async updateNotes() {
    if (!this.currentExerciseLog) return;
    logger.info('Updating notes', {
      workoutExerciseId: this.currentExerciseLog.id,
      notes: this.currentExerciseLog.notes
    });

    this.isSavingNotes = true;
    try {
      await this.commandService.updateNotes({
        exerciseLogId: this.currentExerciseLog.id,
        notes: this.currentExerciseLog.notes ?? ''
      });
      logger.info('Notes updated', { workoutExerciseId: this.currentExerciseLog.id });
    } catch (error) {
      this.errorMessage = 'Failed to update notes';
      logger.error('Failed to update notes', {
        workoutExerciseId: this.currentExerciseLog.id,
        notes: this.currentExerciseLog.notes,
        error
      });
    } finally {
      this.isSavingNotes = false;
    }
  }

  async completeWorkout() {
    if (!this.view) return;
    logger.info('Completing workout', { workoutId: this.view.id });

    this.isCompleting = true;
    try {
      await this.commandService.completeWorkout(this.view.id);
      logger.info('Workout completed', { workoutId: this.view.id });
      await goto(resolve('/'));
    } catch (error) {
      this.errorMessage = 'Failed to complete workout';
      logger.error('Failed to complete workout', { workoutId: this.view.id, error });
    } finally {
      this.isCompleting = false;
    }
  }

  async cancelWorkout() {
    if (!this.view) return;
    logger.info('Cancelling workout', { workoutId: this.view.id });

    this.isCancelling = true;
    try {
      await this.commandService.cancelWorkout(this.view.id);
      logger.info('Workout cancelled', { workoutId: this.view.id });
      await goto(resolve('/'));
    } catch (error) {
      this.errorMessage = 'Failed to cancel workout';
      logger.error('Failed to cancel workout', { workoutId: this.view.id, error });
    } finally {
      this.isCancelling = false;
    }
  }
}
