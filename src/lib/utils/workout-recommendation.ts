export interface Set {
  weight: number;
  reps: number;
  repsInReserve: number | null;
}

export interface SetRecommendation {
  weight: number;
  reps: number;
}

export function setRecommendation(
  volumeGoal: number,
  currentWorkout: Set[],
  previousWorkout: Set[]
): SetRecommendation | null {
  if (volumeGoal <= 0) {
    return null;
  }

  const setsInPreviousWorkout = previousWorkout.length;
  const setsInCurrentWorkout = currentWorkout.length;

  if (setsInCurrentWorkout >= setsInPreviousWorkout) {
    return null;
  }

  const lastSet = currentWorkout[setsInCurrentWorkout - 1];
  if (!lastSet) {
    return null;
  }

  const previousWorkoutSet = previousWorkout[setsInPreviousWorkout - 1];
  if (!previousWorkoutSet) {
    return null;
  }

  const recommendedWeight = Math.min(lastSet.weight, previousWorkoutSet.weight);

  const recommendedReps = Math.ceil(volumeGoal / recommendedWeight);

  return {
    weight: recommendedWeight,
    reps: recommendedReps
  };
}
