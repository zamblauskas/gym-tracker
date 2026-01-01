import { describe, beforeAll, expect, it } from 'vitest';
import { TestContext } from '../utils/context';
import { data } from '../utils/test-data';
import * as Exercise from '$lib/types/views/exercise';
import * as ExerciseCmd from '$lib/types/commands/exercise';
import * as ExerciseTypeCmd from '$lib/types/commands/exercise-type';

describe('Exercise view and command services', () => {
  let context: TestContext;

  beforeAll(async () => {
    context = await TestContext.create();
  });

  function assertExerciseDetailView(
    view: Exercise.Detail,
    exerciseTypeId: string,
    exerciseType: ExerciseTypeCmd.Create,
    exerciseId: string,
    exercise: ExerciseCmd.Update
  ) {
    expect(view).toEqual({
      id: exerciseId,
      name: exercise.name,
      machineBrand: exercise.machineBrand,
      targetRepRange: exercise.targetRepRange,
      targetRepsInReserve: exercise.targetRepsInReserve,
      exerciseType: {
        id: exerciseTypeId,
        name: exerciseType.name
      }
    });
  }

  function assertExerciseCompactView(
    view: Exercise.Compact,
    exerciseId: string,
    exercise: ExerciseCmd.Update
  ) {
    expect(view).toEqual({
      id: exerciseId,
      name: exercise.name,
      machineBrand: exercise.machineBrand
    });
  }

  it('create, update, read, delete an exercise', async () => {
    // create
    const exerciseTypeInput = data.exerciseTypes.et1;
    const exerciseTypeId =
      await context.exerciseTypeCommandService.createExerciseType(exerciseTypeInput);
    const exerciseInput = data.exercises.e1;
    const id = await context.exerciseCommandService.createExercise({
      exerciseTypeId,
      ...exerciseInput
    });
    const created = await context.exerciseViewService.getExerciseDetailById(id);
    assertExerciseDetailView(created, exerciseTypeId, exerciseTypeInput, id, exerciseInput);

    // update
    const update = data.exercises.e2;
    await context.exerciseCommandService.updateExercise(id, update);
    const updated = await context.exerciseViewService.getExerciseDetailById(id);
    assertExerciseDetailView(updated, exerciseTypeId, exerciseTypeInput, id, update);

    // delete
    await context.exerciseCommandService.deleteExercise(id);
    await expect(context.exerciseViewService.getExerciseDetailById(id)).rejects.toThrowError(
      'Exercise not found'
    );
  });

  it('get exercises by type', async () => {
    const exerciseTypeInput = data.exerciseTypes.et1;
    const exerciseTypeId =
      await context.exerciseTypeCommandService.createExerciseType(exerciseTypeInput);
    const exerciseInput = data.exercises.e1;
    const id = await context.exerciseCommandService.createExercise({
      exerciseTypeId,
      ...exerciseInput
    });

    const exercises = await context.exerciseViewService.getExercisesByType(exerciseTypeId);

    expect(exercises.length).toBe(1);
    assertExerciseCompactView(exercises[0]!, id, exerciseInput);
  });

  it('get exercises by type does not return deleted exercises', async () => {
    const exerciseTypeInput = data.exerciseTypes.et1;
    const exerciseTypeId =
      await context.exerciseTypeCommandService.createExerciseType(exerciseTypeInput);
    const exerciseInput = data.exercises.e1;
    const id = await context.exerciseCommandService.createExercise({
      exerciseTypeId,
      ...exerciseInput
    });

    await context.exerciseCommandService.deleteExercise(id);

    const exercises = await context.exerciseViewService.getExercisesByType(exerciseTypeId);

    expect(exercises).toEqual([]);
  });

  it('null values are supported', async () => {
    const exerciseTypeInput = data.exerciseTypes.et1;
    const exerciseTypeId =
      await context.exerciseTypeCommandService.createExerciseType(exerciseTypeInput);
    const exerciseInput = data.exercises.eNull;
    const id = await context.exerciseCommandService.createExercise({
      exerciseTypeId,
      ...exerciseInput
    });
    const created = await context.exerciseViewService.getExerciseDetailById(id);

    assertExerciseDetailView(created, exerciseTypeId, exerciseTypeInput, id, exerciseInput);
  });

  it('deleting exercise type deletes exercises', async () => {
    const exerciseTypeInput = data.exerciseTypes.et1;
    const exerciseTypeId =
      await context.exerciseTypeCommandService.createExerciseType(exerciseTypeInput);
    const exerciseInput = data.exercises.e1;
    const exerciseId = await context.exerciseCommandService.createExercise({
      exerciseTypeId,
      ...exerciseInput
    });

    await context.exerciseTypeCommandService.deleteExerciseType(exerciseTypeId);

    await expect(
      context.exerciseViewService.getExerciseDetailById(exerciseId)
    ).rejects.toThrowError('Exercise not found');
  });
});
