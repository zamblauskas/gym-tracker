import { type CreateMutationResult, type CreateQueryResult } from '@tanstack/svelte-query';
import { Program as ProgramCommand } from '$lib/types/commands';
import { SERVICES_KEY } from '$lib/context';
import { getContext } from 'svelte';
import type { Services } from '$lib/context';
import type { Program } from '$lib/types/views';
import { Keys } from '$lib/query-keys';
import { createMutation, fetchQuery } from '$lib/utils/query';

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
