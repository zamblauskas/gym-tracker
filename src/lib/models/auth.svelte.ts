import type { Database } from '$lib/supabase/types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { logger } from '$lib/logger';

type Unsubscribe = () => void;

export class AuthModel {
  email = $state<string | null>(null);
  errorMessage = $state('');

  isLoading = $state(true);
  isSignedIn = $derived(this.email !== null);

  private unsubscribeAuthStateChange: Unsubscribe | null = null;

  constructor(private supabase: SupabaseClient<Database>) {}

  async refresh() {
    logger.info('Refreshing auth session');

    this.isLoading = true;
    this.errorMessage = '';
    try {
      const { data, error } = await this.supabase.auth.getSession();

      if (error) {
        this.email = null;
        this.errorMessage = error.message;
        logger.error('Failed to refresh auth session', { error });
        return;
      }

      this.email = data.session?.user.email ?? null;
      logger.info('Auth session refreshed', { email: this.email });
    } finally {
      this.isLoading = false;
    }
  }

  subscribe() {
    if (this.unsubscribeAuthStateChange) return;

    const { data } = this.supabase.auth.onAuthStateChange((_event, session) => {
      this.email = session?.user.email ?? null;
    });

    this.unsubscribeAuthStateChange = () => data.subscription.unsubscribe();
  }

  unsubscribe() {
    this.unsubscribeAuthStateChange?.();
    this.unsubscribeAuthStateChange = null;
  }

  async signInWithPassword(email: string, password: string): Promise<boolean> {
    logger.info('Signing in with password', { email });

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const { error } = await this.supabase.auth.signInWithPassword({ email, password });

      if (error) {
        this.errorMessage = error.message;
        logger.error('Failed to sign in', { email, error });
        return false;
      }

      logger.info('Signed in successfully', { email });
      await this.refresh();
      return true;
    } finally {
      this.isLoading = false;
    }
  }

  async signOut(): Promise<boolean> {
    logger.info('Signing out');

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const { error } = await this.supabase.auth.signOut();

      if (error) {
        this.errorMessage = error.message;
        logger.error('Failed to sign out', { error });
        return false;
      }

      logger.info('Signed out successfully');
      await this.refresh();
      return true;
    } finally {
      this.isLoading = false;
    }
  }
}
