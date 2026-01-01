import type { ProgramViewService } from '$lib/services/program-view.service';
import type { ProgramCommandService } from '$lib/services/program-command.service';
import * as Program from '$lib/types/views/program';
import { logger } from '$lib/logger';

export class ProgramListModel {
  programs = $state<Program.Compact[]>([]);
  isLoading = $state(true);
  isCreating = $state(false);
  isActionInProgress = $derived(this.isLoading || this.isCreating);
  errorMessage = $state('');

  constructor(
    private viewSvc: ProgramViewService,
    private commandSvc: ProgramCommandService
  ) {}

  async loadData() {
    logger.info('Loading programs');

    this.isLoading = true;
    this.errorMessage = '';
    try {
      this.programs = await this.viewSvc.listPrograms();
      logger.info('Programs loaded', { programs: $state.snapshot(this.programs) });
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to load programs';
      logger.error('Failed to load programs', { error });
    } finally {
      this.isLoading = false;
    }
  }

  async createProgram(name: string): Promise<boolean> {
    logger.info('Creating program', { name });

    this.isCreating = true;
    this.errorMessage = '';
    try {
      const programId = await this.commandSvc.createProgram({ name });
      logger.info('Program created', { programId });
      await this.loadData();
      return true;
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to create program';
      logger.error('Failed to create program', { name, error });
      return false;
    } finally {
      this.isCreating = false;
    }
  }
}
