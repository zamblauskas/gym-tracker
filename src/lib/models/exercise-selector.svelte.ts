import { logger } from '$lib/logger';
import type { ExerciseViewService } from '$lib/services/exercise-view.service';
import * as Exercise from '$lib/types/views/exercise';
import { SvelteMap } from 'svelte/reactivity';

export class ExerciseSelectorModel {
  exercises = $state<Exercise.Compact[]>([]);
  isLoading = $state(false);
  errorMessage = $state<string>('');

  private cache = new SvelteMap<string, Exercise.Compact[]>();

  constructor(private service: ExerciseViewService) {}

  async loadExercises(typeId: string): Promise<boolean> {
    logger.info('Loading exercises', { typeId });

    this.errorMessage = '';

    if (this.cache.has(typeId)) {
      this.exercises = this.cache.get(typeId)!;
      logger.info('Exercises loaded from cache', {
        typeId,
        exercises: $state.snapshot(this.exercises)
      });
      return true;
    }

    this.isLoading = true;
    this.exercises = [];

    try {
      const exercises = await this.service.getExercisesByType(typeId);
      this.cache.set(typeId, exercises);
      this.exercises = exercises;
      logger.info('Exercises loaded', { typeId, exercises: $state.snapshot(this.exercises) });
      return true;
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to load exercises';
      logger.error('Failed to load exercises', { typeId, error });
      return false;
    } finally {
      this.isLoading = false;
    }
  }
}
