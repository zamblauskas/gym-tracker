export const Keys = {
  gyms: ['gyms', 'list'] as const,
  exerciseDetail: (id: string) => ['exercises', id, 'detail'] as const,
  exerciseHistory: (id: string) => ['exercises', id, 'history'] as const,

  exerciseTypes: ['exercise-types', 'list'] as const,
  exerciseTypeDetail: (id: string) => ['exercise-types', id, 'detail'] as const
};
