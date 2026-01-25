export const Keys = {
  gymList: ['gyms', 'list'] as const,
  gymDetail: (id: string) => ['gyms', id, 'detail'] as const,

  exercises: ['exercises'] as const,
  exerciseDetail: (id: string) => ['exercises', id, 'detail'] as const,
  exerciseHistory: (id: string) => ['exercises', id, 'history'] as const,

  exerciseTypes: ['exercise-types'] as const,
  exerciseTypeList: ['exercise-types', 'list'] as const,
  exerciseTypeDetail: (id: string) => ['exercise-types', id, 'detail'] as const,

  routines: ['routines'] as const,
  routineDetail: (id: string) => ['routines', id, 'detail'] as const,

  programs: ['programs'] as const,
  programList: ['programs', 'list'] as const,
  programDetail: (id: string) => ['programs', id, 'detail'] as const,

  workoutHistoryList: ['workout-history', 'list'] as const
};
