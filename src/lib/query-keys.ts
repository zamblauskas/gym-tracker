export const Keys = {
  gyms: ['gyms'] as const,
  exercise: (id: string) => ['exercise', id] as const,
  exerciseHistory: (id: string) => ['exercise-history', id] as const,
  exerciseType: (id: string) => ['exercise-type', id] as const
};
