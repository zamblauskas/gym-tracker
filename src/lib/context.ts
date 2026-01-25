import type { ExerciseCommandService } from './services/exercise-command.service';
import type { ExerciseTypeCommandService } from './services/exercise-type-command.service';
import type { ExerciseTypeViewService } from './services/exercise-type-view.service';
import type { ExerciseViewService } from './services/exercise-view.service';

import type { GymCommandService } from './services/gym-command.service';
import type { GymViewService } from './services/gym-view.service';
import type { ProgramCommandService } from './services/program-command.service';
import type { ProgramViewService } from './services/program-view.service';
import type { RoutineCommandService } from './services/routine-command.service';
import type { RoutineViewService } from './services/routine-view.service';
import type { WorkoutCommandService } from './services/workout-command.service';
import type { WorkoutViewService } from './services/workout-view.service';
import type { WorkoutHistoryViewService } from './services/workout-history-view.service';
import type { WorkoutHistoryCommandService } from './services/workout-history-command.service';

export const AUTH_KEY = Symbol('auth');
export const PAGE_CHROME_KEY = Symbol('pageChrome');
export const TIMER_KEY = Symbol('timer');
export const SERVICES_KEY = Symbol('services');

export interface Services {
  exerciseTypeViewService: ExerciseTypeViewService;
  exerciseTypeCommandService: ExerciseTypeCommandService;
  exerciseViewService: ExerciseViewService;
  exerciseCommandService: ExerciseCommandService;
  gymViewService: GymViewService;
  gymCommandService: GymCommandService;
  programViewService: ProgramViewService;
  programCommandService: ProgramCommandService;
  routineViewService: RoutineViewService;
  routineCommandService: RoutineCommandService;
  workoutViewService: WorkoutViewService;
  workoutCommandService: WorkoutCommandService;
  workoutHistoryViewService: WorkoutHistoryViewService;
  workoutHistoryCommandService: WorkoutHistoryCommandService;
}
