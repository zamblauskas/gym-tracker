import type { GymViewService } from '$lib/services/gym-view.service';
import type { GymCommandService } from '$lib/services/gym-command.service';
import * as Gym from '$lib/types/views/gym';
import { logger } from '$lib/logger';

export class GymDetailModel {
  gym = $state<Gym.Detail | null>(null);
  isLoading = $state(true);
  isUpdating = $state(false);
  isDeleting = $state(false);
  isActionInProgress = $derived(this.isLoading || this.isUpdating || this.isDeleting);
  errorMessage = $state('');

  constructor(
    private gymId: string,
    private viewSvc: GymViewService,
    private commandSvc: GymCommandService
  ) {}

  async loadData() {
    logger.info('Loading gym', { gymId: this.gymId });

    this.isLoading = true;
    this.errorMessage = '';
    try {
      this.gym = await this.viewSvc.getGymById(this.gymId);
      logger.info('Gym loaded', { gym: $state.snapshot(this.gym) });
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to load gym';
      logger.error('Failed to load gym', { gymId: this.gymId, error });
    } finally {
      this.isLoading = false;
    }
  }

  async updateGym(name: string): Promise<boolean> {
    logger.info('Updating gym', { gymId: this.gymId, name });

    this.isUpdating = true;
    this.errorMessage = '';
    try {
      await this.commandSvc.updateGym(this.gymId, { name });
      logger.info('Gym updated', { gymId: this.gymId });
      await this.loadData();
      return true;
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to update gym';
      logger.error('Failed to update gym', { gymId: this.gymId, error });
      return false;
    } finally {
      this.isUpdating = false;
    }
  }

  async deleteGym(): Promise<boolean> {
    logger.info('Deleting gym', { gymId: this.gymId });

    this.isDeleting = true;
    this.errorMessage = '';
    try {
      await this.commandSvc.deleteGym(this.gymId);
      logger.info('Gym deleted', { gymId: this.gymId });
      return true;
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to delete gym';
      logger.error('Failed to delete gym', { gymId: this.gymId, error });
      return false;
    } finally {
      this.isDeleting = false;
    }
  }
}
