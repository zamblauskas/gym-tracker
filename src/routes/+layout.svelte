<script lang="ts">
  import '../app.css';
  import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
  import favicon from '$lib/assets/favicon.svg';
  import { onDestroy, onMount, setContext } from 'svelte';
  import { User } from 'lucide-svelte';
  import Separator from '$lib/components/ui/separator/separator.svelte';
  import { getSupabaseClient } from '$lib/supabase/client';
  import { AuthModel } from '$lib/models/auth.svelte';
  import { PageChromeModel } from '$lib/models/page-chrome.svelte';
  import { TimerModel } from '$lib/models/timer.svelte';
  import { AUTH_KEY, PAGE_CHROME_KEY, TIMER_KEY, SERVICES_KEY } from '$lib/context';
  import { dev } from '$app/environment';
  import { injectAnalytics } from '@vercel/analytics/sveltekit';
  import Breadcrumb from '$lib/components/ui/Breadcrumb.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import * as Alert from '$lib/components/ui/alert/index.js';
  import { Spinner } from '$lib/components/ui/spinner/index.js';
  import { LoadingBar } from '$lib/components/ui/loading-bar/index.js';
  import { ExerciseTypeViewService } from '$lib/services/exercise-type-view.service';
  import { ExerciseTypeCommandService } from '$lib/services/exercise-type-command.service';
  import { ExerciseViewService } from '$lib/services/exercise-view.service';
  import { ExerciseCommandService } from '$lib/services/exercise-command.service';
  import { GymViewService } from '$lib/services/gym-view.service';
  import { GymCommandService } from '$lib/services/gym-command.service';
  import { ProgramViewService } from '$lib/services/program-view.service';
  import { ProgramCommandService } from '$lib/services/program-command.service';
  import { RoutineViewService } from '$lib/services/routine-view.service';
  import { RoutineCommandService } from '$lib/services/routine-command.service';
  import { WorkoutViewService } from '$lib/services/workout-view.service';
  import { WorkoutCommandService } from '$lib/services/workout-command.service';
  import { WorkoutHistoryViewService } from '$lib/services/workout-history-view.service';
  import { WorkoutHistoryCommandService } from '$lib/services/workout-history-command.service';

  injectAnalytics({ mode: dev ? 'development' : 'production' });

  let { children } = $props();

  const supabase = getSupabaseClient();
  const auth = new AuthModel(supabase);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 60 * 1000 // 1 hour
      }
    }
  });

  const chrome = new PageChromeModel(queryClient);
  const timer = new TimerModel();

  const exerciseTypeViewService = new ExerciseTypeViewService(supabase);
  const exerciseTypeCommandService = new ExerciseTypeCommandService(supabase);
  const exerciseViewService = new ExerciseViewService(supabase);
  const exerciseCommandService = new ExerciseCommandService(supabase);
  const gymViewService = new GymViewService(supabase);
  const gymCommandService = new GymCommandService(supabase);
  const programViewService = new ProgramViewService(supabase);
  const programCommandService = new ProgramCommandService(supabase);
  const routineViewService = new RoutineViewService(supabase);
  const routineCommandService = new RoutineCommandService(supabase);
  const workoutViewService = new WorkoutViewService(supabase);
  const workoutCommandService = new WorkoutCommandService(supabase);
  const workoutHistoryViewService = new WorkoutHistoryViewService(supabase);
  const workoutHistoryCommandService = new WorkoutHistoryCommandService(supabase);

  let userDialogOpen = $state(false);
  let loginEmail = $state('');
  let loginPassword = $state('');

  setContext(AUTH_KEY, auth);
  setContext(PAGE_CHROME_KEY, chrome);
  setContext(TIMER_KEY, timer);
  setContext(SERVICES_KEY, {
    exerciseTypeViewService,
    exerciseTypeCommandService,
    exerciseViewService,
    exerciseCommandService,
    gymViewService,
    gymCommandService,
    programViewService,
    programCommandService,
    routineViewService,
    routineCommandService,
    workoutViewService,
    workoutCommandService,
    workoutHistoryViewService,
    workoutHistoryCommandService
  });

  onMount(async () => {
    auth.subscribe();
    await auth.refresh();
  });

  onDestroy(() => {
    auth.unsubscribe();
  });

  async function signIn() {
    const didSignIn = await auth.signInWithPassword(loginEmail, loginPassword);
    if (didSignIn) {
      loginPassword = '';
      userDialogOpen = false;
    }
  }

  async function signOut() {
    const didSignOut = await auth.signOut();
    if (didSignOut) {
      userDialogOpen = false;
    }
  }
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<div>
  <div class="flex items-center gap-3 p-4">
    <div class="min-w-0 flex-1">
      <Breadcrumb items={chrome.breadcrumbItems} />
    </div>

    <!-- User info dialog -->
    {#if auth.isSignedIn}
      <Dialog.Root bind:open={userDialogOpen}>
        <Dialog.Trigger>
          <Button variant="outline" size="icon" aria-label="User">
            <User class="size-4" />
          </Button>
        </Dialog.Trigger>
        <Dialog.Content onOpenAutoFocus={(e) => e.preventDefault()}>
          <Dialog.Header>
            <Dialog.Title>User</Dialog.Title>
          </Dialog.Header>

          <div class="space-y-4">
            <div class="text-sm">
              <div class="text-muted-foreground">Signed in as</div>
              <div class="font-medium">{auth.email}</div>
            </div>
            <Button class="w-full" variant="outline" onclick={signOut} disabled={auth.isLoading}>
              {#if auth.isLoading}
                <Spinner class="mr-2" />
              {/if}
              Logout
            </Button>
          </div>

          {#if auth.errorMessage}
            <div class="pt-4">
              <Alert.Root variant="destructive">
                <Alert.Title>Auth error</Alert.Title>
                <Alert.Description>{auth.errorMessage}</Alert.Description>
              </Alert.Root>
            </div>
          {/if}
        </Dialog.Content>
      </Dialog.Root>
    {/if}
  </div>
</div>

{#if chrome.isLoading}
  <LoadingBar />
{:else}
  <div class="mt-1"></div>
{/if}

<div>
  {#if auth.isLoading}
    <div class="flex w-full flex-col gap-4 p-4">
      <Spinner class="mx-auto h-8 w-8" />
    </div>
  {:else if auth.isSignedIn}
    <QueryClientProvider client={queryClient}>
      {@render children()}
    </QueryClientProvider>
  {:else}
    <!-- Sign In -->
    <div class="p-4">
      <p class="text-heading text-center text-4xl font-bold tracking-widest">Gym Tracker</p>
    </div>

    <div class="p-4">
      <Separator></Separator>
    </div>
    {#if auth.errorMessage}
      <div class="p-4">
        <Alert.Root variant="destructive">
          <Alert.Title>Error</Alert.Title>
          <Alert.Description>{auth.errorMessage}</Alert.Description>
        </Alert.Root>
      </div>
    {/if}
    <div class="flex w-full flex-col gap-4 p-4">
      <Input placeholder="Email" bind:value={loginEmail} />
      <Input placeholder="Password" type="password" bind:value={loginPassword} />
      <Button
        class="w-full"
        onclick={signIn}
        disabled={auth.isLoading || !loginEmail.trim() || !loginPassword}
      >
        {#if auth.isLoading}
          <Spinner class="mr-2" />
        {/if}
        Login
      </Button>
    </div>
  {/if}
</div>
