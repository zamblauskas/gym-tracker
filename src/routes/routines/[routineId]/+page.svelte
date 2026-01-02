<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { onMount } from 'svelte';
  import { getContext } from 'svelte';
  import {
    Pencil,
    Trash2,
    ChevronRight,
    CircleAlert,
    Group,
    Play,
    ChevronUp,
    ChevronDown,
    Plus,
    Minus
  } from 'lucide-svelte';
  import { PAGE_CHROME_KEY, SERVICES_KEY, type Services } from '$lib/context';
  import type { PageChromeModel } from '$lib/models/page-chrome.svelte';
  import { RoutineDetailModel } from '$lib/models/routine-detail.svelte';
  import Separator from '$lib/components/ui/separator/separator.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import Label from '$lib/components/ui/label/label.svelte';
  import * as Item from '$lib/components/ui/item/index.js';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
  import * as ButtonGroup from '$lib/components/ui/button-group/index.js';
  import * as Alert from '$lib/components/ui/alert/index.js';
  import { Spinner } from '$lib/components/ui/spinner/index.js';
  import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';

  const routineId = page.params.routineId || '';
  const services = getContext<Services>(SERVICES_KEY);
  const chrome = getContext<PageChromeModel>(PAGE_CHROME_KEY);
  const model = new RoutineDetailModel(
    services.routineViewService,
    services.routineCommandService,
    services.workoutCommandService,
    services.exerciseTypeViewService,
    routineId
  );

  let editDialogOpen = $state(false);
  let editedRoutineName = $state('');
  let selectedExerciseTypeIds: string[] = $state([]);

  let breadcrumbItems = $derived(
    !model.routine
      ? []
      : [
          { label: 'Programs', href: '/programs' },
          { label: model.routine.program.name, href: `/programs/${model.routine.program.id}` },
          { label: model.routine.name }
        ]
  );

  $effect(() => {
    chrome.breadcrumbItems = breadcrumbItems;
  });

  onMount(async () => {
    await model.loadData();
  });

  function openEditDialog() {
    editedRoutineName = model.routine?.name || '';
    selectedExerciseTypeIds = model.routine?.exerciseTypeIds
      ? [...model.routine.exerciseTypeIds]
      : [];
    editDialogOpen = true;
  }

  function toggleExerciseType(exerciseTypeId: string) {
    if (selectedExerciseTypeIds.includes(exerciseTypeId)) {
      selectedExerciseTypeIds = selectedExerciseTypeIds.filter((id) => id !== exerciseTypeId);
    } else {
      selectedExerciseTypeIds = [...selectedExerciseTypeIds, exerciseTypeId];
    }
  }

  function moveSelectedUp(exerciseTypeId: string) {
    const index = selectedExerciseTypeIds.indexOf(exerciseTypeId);
    if (index <= 0) return;
    const newIds = [...selectedExerciseTypeIds];
    [newIds[index - 1], newIds[index]] = [newIds[index] ?? '', newIds[index - 1] ?? ''];
    selectedExerciseTypeIds = newIds;
  }

  function moveSelectedDown(exerciseTypeId: string) {
    const index = selectedExerciseTypeIds.indexOf(exerciseTypeId);
    if (index < 0 || index >= selectedExerciseTypeIds.length - 1) return;
    const newIds = [...selectedExerciseTypeIds];
    [newIds[index], newIds[index + 1]] = [newIds[index + 1] ?? '', newIds[index] ?? ''];
    selectedExerciseTypeIds = newIds;
  }

  let selectedExerciseTypes = $derived(
    selectedExerciseTypeIds.flatMap((id) => {
      const et = model.allExerciseTypes.find((et) => et.id === id);
      return et ? [et] : [];
    })
  );

  let unselectedExerciseTypes = $derived(
    model.allExerciseTypes.filter((et) => !selectedExerciseTypeIds.includes(et.id))
  );

  async function updateRoutine() {
    if (!model.routine) return;

    const didUpdate = await model.updateRoutine(editedRoutineName, selectedExerciseTypeIds);
    if (!didUpdate) return;
    editDialogOpen = false;
  }

  async function deleteRoutine() {
    if (!model.routine) return;

    const didDelete = await model.deleteRoutine();
    if (!didDelete) return;
    await goto(resolve(`/programs/${model.routine.program.id}`));
  }

  async function startWorkout() {
    if (!model.routine) return;

    const workoutId = await model.startWorkout();
    if (workoutId) {
      await goto(resolve(`/workouts/${workoutId}`));
    }
  }
</script>

{#if model.errorMessage}
  <div class="p-4">
    <Alert.Root variant="destructive">
      <CircleAlert class="h-4 w-4" />
      <Alert.Title>Error</Alert.Title>
      <Alert.Description>{model.errorMessage}</Alert.Description>
    </Alert.Root>
  </div>
{/if}

{#if model.isLoading}
  <div class="flex w-full flex-col gap-4 p-4">
    <Spinner class="mx-auto h-8 w-8" />
    {#each [0, 1, 2] as i (i)}
      <Skeleton class="h-[72px] w-full rounded-xl" />
    {/each}
  </div>
{:else if model.routine}
  <!-- Exercise type list -->
  <div class="flex w-full flex-col gap-4 p-4">
    {#each model.exerciseTypes as exerciseType (exerciseType.id)}
      <Item.Root variant="outline">
        {#snippet child({ props })}
          <a
            href={resolve(`/exercise-types/${exerciseType.id}`)}
            class="flex flex-1 items-center"
            {...props}
          >
            <Item.Content>
              <Item.Title>
                <Group class="size-4" />
                {exerciseType.name}
              </Item.Title>
            </Item.Content>
            <Item.Actions>
              <ChevronRight class="size-5 text-muted-foreground" />
            </Item.Actions>
          </a>
        {/snippet}
      </Item.Root>
    {/each}
  </div>
{/if}

<div class="p-4">
  <Separator />
</div>

<div class="p-4">
  <!-- Edit routine dialog -->
  <ButtonGroup.Root class="w-full gap-1">
    <Dialog.Root bind:open={editDialogOpen}>
      <Dialog.Trigger class="flex-1" onclick={openEditDialog}>
        <Button class="w-full" variant="outline" disabled={model.isActionInProgress}>
          <Pencil /> Edit
        </Button>
      </Dialog.Trigger>
      <Dialog.Content class="flex max-h-[95dvh] flex-col">
        <Dialog.Header>
          <Dialog.Title>Edit routine</Dialog.Title>
          <Dialog.Description>Update routine name and exercise types.</Dialog.Description>
        </Dialog.Header>
        <div class="flex flex-col gap-4 overflow-y-auto pt-1">
          <Input placeholder="Routine name" bind:value={editedRoutineName} />
          <Separator />
          {#if model.allExerciseTypes.length === 0}
            <p class="text-center text-sm text-muted-foreground">No exercise types available.</p>
          {:else}
            <div class="flex flex-col gap-2">
              <div class="pt-4 text-center text-base leading-none font-semibold">
                Selected exercise types
              </div>
              {#if selectedExerciseTypes.length === 0}
                <p class="text-center text-sm text-muted-foreground">No exercise types selected.</p>
              {/if}
              {#each selectedExerciseTypes as exerciseType, index (exerciseType.id)}
                <div class="flex items-center gap-2 rounded-lg border p-3">
                  <div class="flex flex-col gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      class="h-5 w-5"
                      disabled={index === 0 || model.isActionInProgress}
                      onclick={() => moveSelectedUp(exerciseType.id)}
                    >
                      <ChevronUp class="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      class="h-5 w-5"
                      disabled={index === selectedExerciseTypes.length - 1 ||
                        model.isActionInProgress}
                      onclick={() => moveSelectedDown(exerciseType.id)}
                    >
                      <ChevronDown class="h-3 w-3" />
                    </Button>
                  </div>
                  <Label for={exerciseType.id} class="flex-1 cursor-pointer">
                    {exerciseType.name}
                  </Label>
                  <Button size="icon" onclick={() => toggleExerciseType(exerciseType.id)}>
                    <Minus />
                  </Button>
                </div>
              {/each}
              <Separator class="my-2" />

              <div class="pt-4 text-center text-base leading-none font-semibold">
                Available exercise types
              </div>
              {#if unselectedExerciseTypes.length === 0}
                <p class="text-center text-sm text-muted-foreground">
                  All available exercise types are already selected.
                </p>
              {/if}
              {#each unselectedExerciseTypes as exerciseType (exerciseType.id)}
                <div class="flex w-full items-center gap-2 rounded-lg border p-3">
                  <div class="flex flex-1">
                    <Label for={exerciseType.id} class="cursor-pointer">
                      {exerciseType.name}
                    </Label>
                  </div>
                  <Button size="icon" onclick={() => toggleExerciseType(exerciseType.id)}>
                    <Plus />
                  </Button>
                </div>
              {/each}
            </div>
          {/if}
        </div>
        <Dialog.Footer>
          <Button
            onclick={updateRoutine}
            disabled={editedRoutineName.trim() === '' || model.isActionInProgress}
          >
            {#if model.isSaving}
              <Spinner class="mr-2" />
            {/if}
            Save
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>

    <!-- Delete routine alert dialog -->
    <AlertDialog.Root>
      <AlertDialog.Trigger>
        <Button variant="outline" size="icon" disabled={model.isActionInProgress}>
          <Trash2 />
        </Button>
      </AlertDialog.Trigger>
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title>Delete routine?</AlertDialog.Title>
          <AlertDialog.Description>
            This will permanently delete this routine.
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
          <AlertDialog.Action onclick={deleteRoutine}>
            {#if model.isDeleting}
              <Spinner class="mr-2" />
            {/if}
            Delete
          </AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog.Root>
  </ButtonGroup.Root>

  <!-- Start workout button -->
  <ButtonGroup.Root class="w-full gap-1 py-4">
    <Button
      class="w-full bg-green-500 font-bold text-white hover:bg-green-600 hover:text-white"
      variant="outline"
      disabled={model.exerciseTypes.length === 0 || model.isActionInProgress}
      onclick={startWorkout}
    >
      {#if model.isStartingWorkout}
        <Spinner class="mr-2" />
      {/if}
      <Play /> Start
    </Button>
  </ButtonGroup.Root>
</div>
