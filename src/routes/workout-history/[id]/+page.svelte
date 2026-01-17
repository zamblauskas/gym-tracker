<script lang="ts">
  import { page } from '$app/state';
  import { onMount, getContext } from 'svelte';
  import { resolve } from '$app/paths';
  import { Trash2, Clock, CheckCircle } from 'lucide-svelte';
  import { PAGE_CHROME_KEY, SERVICES_KEY, type Services } from '$lib/context';
  import type { PageChromeModel } from '$lib/models/page-chrome.svelte';
  import { WorkoutHistoryDetailModel } from '$lib/models/workout-history-detail.svelte';
  import { timeAgo } from '$lib/utils/time-ago';
  import ExerciseCard from '$lib/components/ExerciseCard.svelte';
  import ExerciseTypeCard from '$lib/components/ExerciseTypeCard.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import Separator from '$lib/components/ui/separator/separator.svelte';
  import { Spinner } from '$lib/components/ui/spinner/index.js';
  import * as Alert from '$lib/components/ui/alert/index.js';
  import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
  import ProgramCard from '$lib/components/ProgramCard.svelte';
  import RoutineCard from '$lib/components/RoutineCard.svelte';
  import { formatDuration } from '$lib/utils/duration';
  import ExerciseHistoryDetail from '$lib/components/ExerciseHistoryDetail.svelte';

  const chrome = getContext<PageChromeModel>(PAGE_CHROME_KEY);
  const services = getContext<Services>(SERVICES_KEY);
  const workoutId = page.params.id ?? '';
  const model = new WorkoutHistoryDetailModel(
    workoutId,
    services.workoutHistoryViewService,
    services.workoutHistoryCommandService
  );

  chrome.setBreadcrumbItems([
    { label: 'Workout History', href: resolve('/workout-history') },
    { label: 'Detail' }
  ]);

  onMount(async () => {
    if (workoutId) {
      await model.loadData();
    }
  });
</script>

{#if model.errorMessage}
  <div class="p-4">
    <Alert.Root variant="destructive">
      <Alert.Title>Error</Alert.Title>
      <Alert.Description>{model.errorMessage}</Alert.Description>
    </Alert.Root>
  </div>
{/if}

{#if model.isLoading}
  <div class="flex h-[50vh] w-full items-center justify-center">
    <Spinner class="h-8 w-8" />
  </div>
{:else if model.workout}
  <div class="flex flex-col gap-4 p-4">
    <!-- Summary Card -->
    <div class="rounded-xl border bg-card p-4 text-card-foreground shadow">
      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-1">
          <span class="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock class="size-3" /> Duration
          </span>
          <span class="font-medium">
            {formatDuration(model.workout.startedAt, model.workout.completedAt)}
          </span>
        </div>
        <div class="flex flex-col gap-1">
          <span class="flex items-center gap-1 text-xs text-muted-foreground">
            <CheckCircle class="size-3" /> Completed
          </span>
          <span class="font-medium">
            {model.workout.completedAt ? timeAgo(model.workout.completedAt) : '-'}
          </span>
        </div>
      </div>

      <Separator class="my-4" />

      <div class="flex flex-col gap-1">
        <span class="flex items-center gap-1 text-xs text-muted-foreground"> Program </span>
        <ProgramCard program={model.workout.routine.program} />
      </div>
      <div class="flex flex-col gap-1 pt-2">
        <span class="flex items-center gap-1 text-xs text-muted-foreground"> Routine </span>
        <RoutineCard routine={model.workout.routine} />
      </div>
    </div>

    <!-- Exercises -->
    <div class="flex flex-col gap-4">
      {#each model.workout.exercises as exerciseDetail (exerciseDetail.id)}
        {#if exerciseDetail.exercise}
          <div class="rounded-xl border bg-card p-4 text-card-foreground shadow">
            <div class="flex flex-col gap-1">
              <span class="flex items-center gap-1 text-xs text-muted-foreground">
                Exercise Type
              </span>
              <ExerciseTypeCard exerciseType={exerciseDetail.exerciseType} />
            </div>

            <div class="flex flex-col gap-1 pt-2">
              <span class="flex items-center gap-1 text-xs text-muted-foreground"> Exercise </span>
              {#if exerciseDetail.exercise}
                <ExerciseCard exercise={exerciseDetail.exercise} />
              {/if}
            </div>

            <ExerciseHistoryDetail sets={exerciseDetail.sets} notes={exerciseDetail.notes} />
          </div>
        {/if}
      {/each}
    </div>

    <!-- Actions -->
    <div class="mt-8">
      <AlertDialog.Root>
        <AlertDialog.Trigger class="w-full">
          <Button
            variant="outline"
            class="flex w-full items-center gap-2"
            disabled={model.isActionInProgress}
          >
            <Trash2 class="size-4" />
            Delete Workout
          </Button>
        </AlertDialog.Trigger>
        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Title>Delete workout?</AlertDialog.Title>
            <AlertDialog.Description>
              This will permanently delete this workout history.
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
            <AlertDialog.Action onclick={() => model.delete()}>
              {#if model.isDeleting}
                <Spinner class="mr-2" />
              {/if}
              Delete
            </AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </div>
  </div>
{/if}
