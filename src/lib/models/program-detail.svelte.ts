import type { ProgramViewService } from '$lib/services/program-view.service';
import type { ProgramCommandService } from '$lib/services/program-command.service';
import type { RoutineCommandService } from '$lib/services/routine-command.service';
import * as Program from '$lib/types/views/program';
import { logger } from '$lib/logger';

export class ProgramDetailModel {
  program = $state<Program.Detail | null>(null);
  isLoading = $state(true);
  isCreating = $state(false);
  isSaving = $state(false);
  isReordering = $state(false);
  isDeleting = $state(false);

  isActionInProgress = $derived(
    this.isLoading || this.isCreating || this.isSaving || this.isReordering || this.isDeleting
  );

  errorMessage = $state('');

  constructor(
    private programId: string,
    private programViewSvc: ProgramViewService,
    private programCommandSvc: ProgramCommandService,
    private routineCommandSvc: RoutineCommandService
  ) {}

  async loadData(): Promise<void> {
    logger.info('Loading program data', { programId: this.programId });

    this.isLoading = true;
    this.errorMessage = '';
    try {
      this.program = await this.programViewSvc.getProgramDetailById(this.programId);
      logger.info('Program data loaded', { program: $state.snapshot(this.program) });
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to load program';
      logger.error('Failed to load program', { programId: this.programId, error });
    } finally {
      this.isLoading = false;
    }
  }

  async updateProgram(name: string, routineOrder: string[]): Promise<boolean> {
    logger.info('Updating program', { programId: this.programId, name, routineOrder });

    this.isSaving = true;
    this.errorMessage = '';
    try {
      await this.programCommandSvc.updateProgram(this.programId, { name });
      if (this.hasOrderChanged(routineOrder)) {
        await this.routineCommandSvc.updateRoutinePositions({
          programId: this.programId,
          orderedRoutineIds: routineOrder
        });
      }
      logger.info('Program updated', { programId: this.programId });
      await this.loadData();
      return true;
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to update program';
      logger.error('Failed to update program', {
        programId: this.programId,
        name,
        routineOrder,
        error
      });
      return false;
    } finally {
      this.isSaving = false;
    }
  }

  private hasOrderChanged(updated: string[]): boolean {
    const original = this.program?.routines.map((r) => r.id) || [];
    return JSON.stringify(original) !== JSON.stringify(updated);
  }

  async createRoutine(name: string): Promise<boolean> {
    logger.info('Creating routine', { programId: this.programId, name });

    this.isCreating = true;
    this.errorMessage = '';
    try {
      const routineId = await this.routineCommandSvc.createRoutine({
        programId: this.programId,
        name
      });
      logger.info('Routine created', { routineId });
      await this.loadData();
      return true;
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to create routine';
      logger.error('Failed to create routine', { programId: this.programId, name, error });
      return false;
    } finally {
      this.isCreating = false;
    }
  }

  async deleteProgram(): Promise<boolean> {
    logger.info('Deleting program', { programId: this.programId });

    this.isDeleting = true;
    this.errorMessage = '';
    try {
      await this.programCommandSvc.deleteProgram(this.programId);
      logger.info('Program deleted', { programId: this.programId });
      return true;
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to delete program';
      logger.error('Failed to delete program', { programId: this.programId, error });
      return false;
    } finally {
      this.isDeleting = false;
    }
  }
}
