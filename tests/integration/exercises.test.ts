import * as ExerciseTypeCmd from '$lib/types/commands/exercise-type';
import type { Range } from '$lib/types/range';
import * as Exercise from '$lib/types/views/exercise';
import { beforeAll, describe, expect, it } from 'vitest';
import { TestContext } from '../utils/context';
import { data } from '../utils/test-data';

describe('Exercise view and command services', () => {
  let context: TestContext;

  beforeAll(async () => {
    context = await TestContext.create();
  });

  function assertExerciseDetailView(
    view: Exercise.Detail,
    exerciseTypeId: string,
    exerciseType: ExerciseTypeCmd.Create,
    gyms: { id: string; name: string }[],
    exerciseId: string,
    exercise: {
      name: string;
      machineBrand: string | null;
      notes: string | null;
      targetRepRange: Range<number>;
      targetRepsInReserve: number | null;
    }
  ) {
    expect(view).toEqual({
      id: exerciseId,
      name: exercise.name,
      machineBrand: exercise.machineBrand,
      notes: exercise.notes,
      targetRepRange: exercise.targetRepRange,
      targetRepsInReserve: exercise.targetRepsInReserve,
      gyms: gyms,
      exerciseType: {
        id: exerciseTypeId,
        name: exerciseType.name
      }
    });
  }

  function assertExerciseCompactView(
    view: Exercise.Compact,
    exerciseId: string,
    gyms: { id: string; name: string }[],
    exercise: {
      name: string;
      machineBrand: string | null;
      targetRepRange: Range<number>;
      targetRepsInReserve: number | null;
    }
  ) {
    expect(view).toEqual({
      id: exerciseId,
      name: exercise.name,
      machineBrand: exercise.machineBrand,
      gyms: gyms
    });
  }

  it('create, update, read', async () => {
    // create
    const exerciseTypeInput = data.exerciseTypes.et1;
    const exerciseTypeId =
      await context.exerciseTypeCommandService.createExerciseType(exerciseTypeInput);

    const gymId1 = await context.gymCommandService.createGym(data.gyms.g1);
    const gymId2 = await context.gymCommandService.createGym(data.gyms.g2);
    const gymId3 = await context.gymCommandService.createGym(data.gyms.g3);

    const exerciseInput = data.exercises.e1;
    const id = await context.exerciseCommandService.createExercise({
      exerciseTypeId,
      gymIds: [gymId1, gymId2],
      ...exerciseInput
    });
    const created = await context.exerciseViewService.getExerciseDetailById(id);
    assertExerciseDetailView(
      created,
      exerciseTypeId,
      exerciseTypeInput,
      [
        { id: gymId1, name: data.gyms.g1.name },
        { id: gymId2, name: data.gyms.g2.name }
      ],
      id,
      exerciseInput
    );

    // update
    const update = {
      ...data.exercises.e2,
      gymIds: [gymId3]
    };
    await context.exerciseCommandService.updateExercise(id, update);
    const updated = await context.exerciseViewService.getExerciseDetailById(id);
    assertExerciseDetailView(
      updated,
      exerciseTypeId,
      exerciseTypeInput,
      [{ id: gymId3, name: data.gyms.g3.name }],
      id,
      update
    );
  });

  it('get exercises by type', async () => {
    const exerciseTypeInput = data.exerciseTypes.et1;
    const exerciseTypeId =
      await context.exerciseTypeCommandService.createExerciseType(exerciseTypeInput);
    const gymId = await context.gymCommandService.createGym(data.gyms.g1);
    const exerciseInput = data.exercises.e1;
    const id = await context.exerciseCommandService.createExercise({
      exerciseTypeId,
      gymIds: [gymId],
      ...exerciseInput
    });

    const exercises = await context.exerciseViewService.getExercisesByType(exerciseTypeId);

    expect(exercises.length).toBe(1);
    assertExerciseCompactView(
      exercises[0]!,
      id,
      [{ id: gymId, name: data.gyms.g1.name }],
      exerciseInput
    );
  });

  it('get exercises by type does not return deleted exercises', async () => {
    const exerciseTypeInput = data.exerciseTypes.et1;
    const exerciseTypeId =
      await context.exerciseTypeCommandService.createExerciseType(exerciseTypeInput);
    const exerciseInput = data.exercises.e1;
    const id = await context.exerciseCommandService.createExercise({
      exerciseTypeId,
      gymIds: [],
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
      gymIds: [],
      ...exerciseInput
    });
    const created = await context.exerciseViewService.getExerciseDetailById(id);

    assertExerciseDetailView(created, exerciseTypeId, exerciseTypeInput, [], id, exerciseInput);
  });
});
