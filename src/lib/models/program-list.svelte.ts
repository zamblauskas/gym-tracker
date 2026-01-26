import type { Services } from '$lib/context';
import { SERVICES_KEY } from '$lib/context';
import { Keys } from '$lib/query-keys';
import { Program as ProgramCommand } from '$lib/types/commands';
import type { Program } from '$lib/types/views';
import { createMutation, fetchQuery } from '$lib/utils/query';
import { type CreateMutationResult, type CreateQueryResult } from '@tanstack/svelte-query';
import { getContext } from 'svelte';

export class ProgramListModel {
  private services = getContext<Services>(SERVICES_KEY);

  programsQuery: CreateQueryResult<Program.Compact[]>;
  createProgramMutation: CreateMutationResult<string, Error, ProgramCommand.Create>;

  constructor() {
    this.programsQuery = fetchQuery({
      key: () => Keys.programList,
      fn: () => this.services.programViewService.listPrograms()
    });

    this.createProgramMutation = createMutation<ProgramCommand.Create>({
      fn: (data: ProgramCommand.Create) => this.services.programCommandService.createProgram(data),
      invalidateKeys: () => [Keys.programList]
    });
  }

  get programs() {
    return this.programsQuery.data ?? [];
  }

  get isLoading() {
    return this.programsQuery.isLoading;
  }

  get isActionInProgress() {
    const isLoading = this.isLoading;
    const createMutationIsPending = this.createProgramMutation.isPending;

    return isLoading || createMutationIsPending;
  }

  get isProgramCreating() {
    return this.createProgramMutation.isPending;
  }

  get errorMessage() {
    const programsError = this.programsQuery.error?.message;
    const createMutationError = this.createProgramMutation.error?.message;

    return programsError || createMutationError || null;
  }

  create(program: ProgramCommand.Create) {
    return this.createProgramMutation.mutateAsync(program);
  }
}
