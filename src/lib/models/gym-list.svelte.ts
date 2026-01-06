import type { GymViewService } from '$lib/services/gym-view.service';
import type { GymCommandService } from '$lib/services/gym-command.service';
import * as Gym from '$lib/types/views/gym';
import { logger } from '$lib/logger';

export class GymListModel {
  gyms = $state<Gym.Compact[]>([]);
  isLoading = $state(true);
  isCreating = $state(false);
  isActionInProgress = $derived(this.isLoading || this.isCreating);
  errorMessage = $state('');

  constructor(
    private viewSvc: GymViewService,
    private commandSvc: GymCommandService
  ) {}

  async loadData() {
    logger.info('Loading gyms');

    this.isLoading = true;
    this.errorMessage = '';
    try {
      this.gyms = await this.viewSvc.listGyms();
      logger.info('Gyms loaded', { gyms: $state.snapshot(this.gyms) });
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to load gyms';
      logger.error('Failed to load gyms', { error });
    } finally {
      this.isLoading = false;
    }
  }

  async createGym(name: string): Promise<boolean> {
    logger.info('Creating gym', { name });

    this.isCreating = true;
    this.errorMessage = '';
    try {
      const gymId = await this.commandSvc.createGym({ name });
      logger.info('Gym created', { gymId });
      await this.loadData();
      return true;
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to create gym';
      logger.error('Failed to create gym', { name, error });
      return false;
    } finally {
      this.isCreating = false;
    }
  }
}
