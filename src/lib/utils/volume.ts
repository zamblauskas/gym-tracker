export interface SetInput {
  weight: number;
  reps: number;
  repsInReserve: number | null;
}

export interface VolumeMetrics {
  actual: number;
  potential: number;
}

export function calculateSetVolume(set: SetInput): VolumeMetrics {
  const actual = set.weight * set.reps;
  const potentialReps = set.reps + (set.repsInReserve ?? 0);
  const potential = set.weight * potentialReps;
  return { actual, potential };
}

export function calculateTotalVolume(sets: SetInput[]): VolumeMetrics {
  return sets.reduce(
    (acc, set) => {
      const setVolume = calculateSetVolume(set);
      return {
        actual: acc.actual + setVolume.actual,
        potential: acc.potential + setVolume.potential
      };
    },
    { actual: 0, potential: 0 }
  );
}

export function formatVolume(volume: VolumeMetrics): string {
  const effort = volume.potential > 0 ? Math.round((volume.actual / volume.potential) * 100) : 100;
  const actualFormatted = volume.actual.toLocaleString();
  const potentialFormatted = volume.potential.toLocaleString();

  if (volume.actual === volume.potential) {
    return `${actualFormatted} kg`;
  }
  return `${actualFormatted} kg • Potential: ${potentialFormatted} kg (${effort}%)`;
}
