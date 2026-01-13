<script lang="ts">
  import { onMount, getContext } from 'svelte';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import * as Item from '$lib/components/ui/item/index.js';
  import * as Alert from '$lib/components/ui/alert/index.js';
  import Separator from '$lib/components/ui/separator/separator.svelte';
  import { Spinner } from '$lib/components/ui/spinner/index.js';
  import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
  import type { PageChromeModel } from '$lib/models/page-chrome.svelte';
  import {
    MapPinned,
    Folder,
    PersonStanding,
    ChevronRight,
    Activity,
    CircleAlert,
    Play,
    History
  } from 'lucide-svelte';
  import Badge from '$lib/components/ui/badge/badge.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import { PAGE_CHROME_KEY, SERVICES_KEY, type Services } from '$lib/context';
  import { HomeModel } from '$lib/models/home.svelte';
  import { timeAgo } from '$lib/utils/time-ago';

  const chrome = getContext<PageChromeModel>(PAGE_CHROME_KEY);
  const services = getContext<Services>(SERVICES_KEY);

  chrome.setBreadcrumbItems([]);

  const workoutViewService = services.workoutViewService;
  const routineViewService = services.routineViewService;
  const commandService = services.workoutCommandService;

  const model = new HomeModel(workoutViewService, routineViewService);

  let isStarting = $state(false);
  let startError = $state('');

  onMount(async () => {
    await model.loadData();
  });

  async function startRoutine(routineId: string) {
    isStarting = true;
    startError = '';
    try {
      const workoutId = await commandService.startWorkoutForRoutine(routineId);
      await goto(resolve(`/workouts/${workoutId}/0`));
    } catch (e) {
      console.error(e);
      startError = 'Failed to start workout';
    } finally {
      isStarting = false;
    }
  }
</script>

<div class="p-4">
  <p class="text-heading text-center text-4xl font-bold tracking-widest">Gym Tracker</p>
</div>

<div class="p-4">
  <Separator></Separator>
</div>

{#if model.errorMessage || startError}
  <div class="p-4">
    <Alert.Root variant="destructive">
      <CircleAlert class="h-4 w-4" />
      <Alert.Title>Error</Alert.Title>
      <Alert.Description>{model.errorMessage || startError}</Alert.Description>
    </Alert.Root>
  </div>
{/if}

{#if model.isLoading}
  <div class="flex w-full flex-col gap-4 p-4">
    <Spinner class="mx-auto h-8 w-8" />
    {#each [0, 1] as i (i)}
      <Skeleton class="h-[100px] w-full rounded-xl" />
    {/each}
  </div>
{:else if model.workouts.length > 0}
  <!-- In-progress workouts -->
  <div class="flex w-full flex-col gap-4 p-4">
    <span class="text-center text-sm font-bold text-muted-foreground">In-progress workouts</span>
    {#each model.workouts as workout (workout.id)}
      <Item.Root variant="outline">
        {#snippet child({ props })}
          <a href={resolve(`/workouts/${workout.id}/0`)} {...props}>
            <Item.Content>
              <Item.Title><Activity class="mr-2" />{workout.routine.program.name}</Item.Title>
              <Item.Description>{workout.routine.name}</Item.Description>
            </Item.Content>
            <Item.Actions>
              <div class="flex items-center gap-2">
                <ChevronRight class="size-4" />
              </div>
            </Item.Actions>
            <Item.Footer>
              <Badge variant="secondary"
                >{workout.completedExerciseCount}/{workout.exerciseCount} exercises</Badge
              >
              <Badge variant="outline">{timeAgo(workout.createdAt)}</Badge>
            </Item.Footer>
          </a>
        {/snippet}
      </Item.Root>
    {/each}
  </div>
{/if}

<!-- Next routines -->
{#if !model.isLoading && model.nextRoutines.length > 0}
  <div class="flex w-full flex-col gap-4 p-4">
    <span class="text-center text-sm font-bold text-muted-foreground">Next workout</span>
    {#each model.nextRoutines as item (item.id)}
      <Item.Root variant="outline">
        {#snippet child({ props })}
          <div class="flex flex-1 items-center" {...props}>
            <Item.Content>
              <Item.Title><Folder class="mr-2" />{item.program.name}</Item.Title>
              <Item.Description>{item.name}</Item.Description>
            </Item.Content>
            <Item.Actions>
              <Button variant="outline" onclick={() => startRoutine(item.id)} disabled={isStarting}>
                <Play class="size-4" /> Start
              </Button>
            </Item.Actions>
          </div>
        {/snippet}
      </Item.Root>
    {/each}
  </div>
{/if}

<div class="flex w-full flex-col gap-4 p-4">
  <span class="text-center text-sm font-bold text-muted-foreground">Program builder</span>
  <Item.Root variant="outline">
    {#snippet child({ props })}
      <a href={resolve('/programs')} {...props}>
        <Item.Content>
          <Item.Title><Folder /> Programs</Item.Title>
        </Item.Content>
        <Item.Actions>
          <ChevronRight class="size-4" />
        </Item.Actions>
      </a>
    {/snippet}
  </Item.Root>

  <Item.Root variant="outline">
    {#snippet child({ props })}
      <a href={resolve('/exercise-types')} {...props}>
        <Item.Content>
          <Item.Title><PersonStanding />Exercise Types</Item.Title>
        </Item.Content>
        <Item.Actions>
          <ChevronRight class="size-4" />
        </Item.Actions>
      </a>
    {/snippet}
  </Item.Root>

  <Item.Root variant="outline">
    {#snippet child({ props })}
      <a href={resolve('/gyms')} {...props}>
        <Item.Content>
          <Item.Title><MapPinned />Gyms</Item.Title>
        </Item.Content>
        <Item.Actions>
          <ChevronRight class="size-4" />
        </Item.Actions>
      </a>
    {/snippet}
  </Item.Root>

  <Item.Root variant="outline">
    {#snippet child({ props })}
      <a href={resolve('/workout-history')} {...props}>
        <Item.Content>
          <Item.Title><History />History</Item.Title>
        </Item.Content>
        <Item.Actions>
          <ChevronRight class="size-4" />
        </Item.Actions>
      </a>
    {/snippet}
  </Item.Root>
</div>
