import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient } from '$lib/supabase/client';
import { ExerciseCommandService } from '$lib/services/exercise-command.service';
import { ExerciseViewService } from '$lib/services/exercise-view.service';
import { ExerciseTypeCommandService } from '$lib/services/exercise-type-command.service';
import { ExerciseTypeViewService } from '$lib/services/exercise-type-view.service';
import { RoutineCommandService } from '$lib/services/routine-command.service';
import { RoutineViewService } from '$lib/services/routine-view.service';
import { WorkoutCommandService } from '$lib/services/workout-command.service';
import { WorkoutViewService } from '$lib/services/workout-view.service';
import { GymCommandService } from '$lib/services/gym-command.service';

export class TestContext {
  public exerciseCommandService: ExerciseCommandService;
  public exerciseViewService: ExerciseViewService;
  public exerciseTypeCommandService: ExerciseTypeCommandService;
  public exerciseTypeViewService: ExerciseTypeViewService;
  public routineCommandService: RoutineCommandService;
  public routineViewService: RoutineViewService;
  public workoutCommandService: WorkoutCommandService;
  public workoutViewService: WorkoutViewService;
  public gymCommandService: GymCommandService;

  private constructor(supabase: SupabaseClient) {
    this.exerciseCommandService = new ExerciseCommandService(supabase);
    this.exerciseViewService = new ExerciseViewService(supabase);
    this.exerciseTypeCommandService = new ExerciseTypeCommandService(supabase);
    this.exerciseTypeViewService = new ExerciseTypeViewService(supabase);
    this.routineCommandService = new RoutineCommandService(supabase);
    this.routineViewService = new RoutineViewService(supabase);
    this.workoutCommandService = new WorkoutCommandService(supabase);
    this.workoutViewService = new WorkoutViewService(supabase);
    this.gymCommandService = new GymCommandService(supabase);
  }

  static async create(): Promise<TestContext> {
    const supabase = getSupabaseClient();
    const context = new TestContext(supabase);
    const { error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'test'
    });

    if (error) {
      throw new Error('Failed to sign in to Supabase');
    }

    return context;
  }
}
