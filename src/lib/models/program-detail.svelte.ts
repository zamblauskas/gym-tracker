import { type CreateMutationResult, type CreateQueryResult } from '@tanstack/svelte-query';
import { getContext } from 'svelte';
import { SERVICES_KEY, type Services } from '$lib/context';
import type * as Program from '$lib/types/views/program';
import { Keys } from '$lib/query-keys';
import { fetchQuery, updateMutation, deleteMutation, createMutation } from '$lib/utils/query';
import type { Routine as RoutineCommand, Program as ProgramCommand } from '$lib/types/commands';

export class ProgramDetailModel {
  private services = getContext<Services>(SERVICES_KEY);

  programQuery: CreateQueryResult<Program.Detail>;
  updateProgramMutation: CreateMutationResult<void, Error, ProgramCommand.Update>;
  reorderRoutinesMutation: CreateMutationResult<void, Error, RoutineCommand.UpdatePositions>;
  createRoutineMutation: CreateMutationResult<string, Error, RoutineCommand.Create>;
  deleteProgramMutation: CreateMutationResult<void, Error>;

  constructor(private programId: string) {
    this.programQuery = fetchQuery({
      key: () => Keys.programDetail(this.programId),
      fn: () => this.services.programViewService.getProgramDetailById(this.programId)
    });

    this.updateProgramMutation = updateMutation<ProgramCommand.Update, Program.Detail>({
      key: () => Keys.programDetail(this.programId),
      fn: (data) => this.services.programCommandService.updateProgram(this.programId, data),
      invalidateKeys: () => [
        Keys.programDetail(this.programId),
        Keys.programList,
        Keys.workoutHistory
      ]
    });

    this.reorderRoutinesMutation = updateMutation<RoutineCommand.UpdatePositions, Program.Detail>({
      key: () => Keys.programDetail(this.programId),
      fn: (data) => this.services.routineCommandService.updateRoutinePositions(data),
      invalidateKeys: () => [Keys.programDetail(this.programId)],
      merge: (prev, update) => {
        const newRoutines = update.orderedRoutineIds
          .map((id) => prev.routines.find((r) => r.id === id))
          .filter((r): r is Program.RoutineDetail => r !== undefined);
        return { ...prev, routines: newRoutines };
      }
    });

    this.createRoutineMutation = createMutation<RoutineCommand.Create>({
      fn: (data) => this.services.routineCommandService.createRoutine(data),
      invalidateKeys: () => [Keys.programDetail(this.programId), Keys.programList]
    });

    this.deleteProgramMutation = deleteMutation({
      fn: () => this.services.programCommandService.deleteProgram(this.programId),
      invalidateKeys: () => [Keys.programDetail(this.programId), Keys.programList]
    });
  }

  get program() {
    return this.programQuery.data;
  }

  get isLoading() {
    return this.programQuery.isLoading;
  }

  get isCreating() {
    return this.createRoutineMutation.isPending;
  }

  get isSaving() {
    const updateProgramMutationIsPending = this.updateProgramMutation.isPending;
    const reorderRoutinesMutationIsPending = this.reorderRoutinesMutation.isPending;
    return updateProgramMutationIsPending || reorderRoutinesMutationIsPending;
  }

  get isDeleting() {
    return this.deleteProgramMutation.isPending;
  }

  get isActionInProgress() {
    const isLoading = this.isLoading;
    const isCreating = this.isCreating;
    const isSaving = this.isSaving;
    const isDeleting = this.isDeleting;
    return isLoading || isCreating || isSaving || isDeleting;
  }

  get errorMessage() {
    const programError = this.programQuery.error?.message;
    const updateProgramMutationError = this.updateProgramMutation.error?.message;
    const reorderRoutinesMutationError = this.reorderRoutinesMutation.error?.message;
    const createRoutineMutationError = this.createRoutineMutation.error?.message;
    const deleteProgramMutationError = this.deleteProgramMutation.error?.message;
    return (
      programError ||
      updateProgramMutationError ||
      reorderRoutinesMutationError ||
      createRoutineMutationError ||
      deleteProgramMutationError ||
      null
    );
  }

  updateProgram(program: ProgramCommand.Update, routineOrder: string[]) {
    const promises = [];
    if (this.program && this.program.name !== program.name) {
      promises.push(this.updateProgramMutation.mutateAsync(program));
    }

    const currentOrder = this.program?.routines.map((r) => r.id) || [];
    const orderChanged =
      currentOrder.length !== routineOrder.length ||
      currentOrder.some((id, i) => id !== routineOrder[i]);

    if (orderChanged) {
      promises.push(
        this.reorderRoutinesMutation.mutateAsync({
          programId: this.programId,
          orderedRoutineIds: routineOrder
        })
      );
    }

    return Promise.all(promises);
  }

  createRoutine(routine: RoutineCommand.Create) {
    return this.createRoutineMutation.mutateAsync(routine);
  }

  deleteProgram() {
    return this.deleteProgramMutation.mutateAsync(undefined);
  }
}
