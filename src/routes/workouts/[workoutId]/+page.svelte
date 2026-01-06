<script lang="ts">
  import { page } from '$app/state';
  import { onMount, getContext } from 'svelte';
  import { resolve } from '$app/paths';
  import { ChevronLeft, ChevronRight, X, Plus, Pencil, Group, Dumbbell } from 'lucide-svelte';
  import { PAGE_CHROME_KEY, SERVICES_KEY, type Services } from '$lib/context';
  import * as Item from '$lib/components/ui/item/index.js';
  import type { PageChromeModel } from '$lib/models/page-chrome.svelte';
  import { WorkoutDetailModel } from '$lib/models/workout-detail.svelte';
  import * as Workout from '$lib/types/views/workout';
  import Button from '$lib/components/ui/button/button.svelte';
  import Separator from '$lib/components/ui/separator/separator.svelte';
  import { Textarea } from '$lib/components/ui/textarea';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
  import Input from '$lib/components/ui/input/input.svelte';
  import Label from '$lib/components/ui/label/label.svelte';
  import { Spinner } from '$lib/components/ui/spinner/index.js';
  import * as Alert from '$lib/components/ui/alert/index.js';
  import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
  import ExerciseHistory from '$lib/components/ExerciseHistory.svelte';
  import ExerciseSelector from '$lib/components/ExerciseSelector.svelte';
  import Badge from '$lib/components/ui/badge/badge.svelte';

  const workoutId = page.params.workoutId!;

  const chrome = getContext<PageChromeModel>(PAGE_CHROME_KEY);
  const services = getContext<Services>(SERVICES_KEY);

  const viewService = services.workoutViewService;
  const commandService = services.workoutCommandService;

  const model = new WorkoutDetailModel(viewService, commandService, workoutId);

  let chooseExerciseDialogOpen = $state(false);
  let addSetDialogOpen = $state(false);
  let editSetDialogOpen = $state(false);
  let deleteSetConfirmOpen = $state(false);

  let newSetWeight = $state<number | null>(null);
  let newSetReps = $state<number | null>(null);
  let newSetRepsInReserve = $state<number | null>(null);

  let editingSetId = $state<string | null>(null);
  let editSetWeight = $state<number | null>(null);
  let editSetReps = $state<number | null>(null);
  let editSetRepsInReserve = $state<number | null>(null);

  let deletingSetId = $state<string | null>(null);

  let breadcrumbItems = $derived(
    !model.view
      ? []
      : [
          {
            label: `Workout • ${model.view.routine.program.name} • ${model.view.routine.name}`,
            href: `/workouts/${workoutId}`
          }
        ]
  );

  $effect(() => {
    chrome.breadcrumbItems = breadcrumbItems;
  });

  onMount(async () => {
    await model.loadData();
  });

  function openAddSetDialog() {
    if (model.currentExerciseLog && model.currentExerciseLog.sets.length > 0) {
      const lastSet = model.currentExerciseLog.sets[model.currentExerciseLog.sets.length - 1];
      if (lastSet) {
        newSetWeight = lastSet.weight;
        newSetReps = lastSet.reps;
        newSetRepsInReserve = lastSet.repsInReserve;
      }
    } else {
      newSetWeight = null;
      newSetReps = null;
      newSetRepsInReserve = null;
    }
    addSetDialogOpen = true;
  }

  async function addSet() {
    if (!newSetWeight || !newSetReps) return;

    await model.addSet(newSetReps, newSetWeight, newSetRepsInReserve);
    addSetDialogOpen = false;
  }

  function openEditSetDialog(set: Workout.SetDetail) {
    editingSetId = set.id;
    editSetWeight = set.weight;
    editSetReps = set.reps;
    editSetRepsInReserve = set.repsInReserve;
    editSetDialogOpen = true;
  }

  async function updateSet() {
    if (!editingSetId || !editSetReps || !editSetWeight) return;

    await model.updateSet(editingSetId, editSetReps, editSetWeight, editSetRepsInReserve);
    editSetDialogOpen = false;
    editingSetId = null;
  }

  function openDeleteConfirmation(setId: string) {
    deletingSetId = setId;
    deleteSetConfirmOpen = true;
  }

  async function confirmDeleteSet() {
    if (!deletingSetId) return;
    await model.deleteSet(deletingSetId);
    deleteSetConfirmOpen = false;
    deletingSetId = null;
  }

  function saveNotes() {
    model.updateNotes();
  }
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
  <div class="flex w-full flex-col gap-4 p-4">
    <Spinner class="mx-auto h-8 w-8" />
    <Skeleton class="h-12 w-full" />
    <Skeleton class="h-64 w-full" />
  </div>
{:else if model.view && model.currentExerciseLog}
  <div class="flex flex-col">
    <!-- Header -->
    <div class="flex flex-col gap-2 px-4 pt-4">
      <span class="text-sm text-muted-foreground">Exercise Type</span>
      <Item.Root variant="outline">
        {#snippet child({ props })}
          {#if model.currentExerciseLog}
            <a
              href={resolve(`/exercise-types/${model.currentExerciseLog.exerciseType.id}`)}
              {...props}
            >
              <Item.Content>
                <Item.Title>
                  <Group />
                  <span class="font-medium">{model.currentExerciseLog.exerciseType.name}</span>
                </Item.Title>
              </Item.Content>
              <Item.Actions>
                <ChevronRight class="size-4" />
              </Item.Actions>
            </a>
          {/if}
        {/snippet}
      </Item.Root>
    </div>
    {#if model.currentExercise}
      <div class="flex flex-col gap-2 p-4">
        <span class="text-sm text-muted-foreground">Exercise</span>
        <Item.Root variant="outline">
          {#snippet child({ props })}
            {#if model.currentExercise}
              <a href={resolve(`/exercises/${model.currentExercise.id}`)} {...props}>
                <Item.Content>
                  <Item.Title>
                    <Dumbbell />
                    <span class="font-medium">{model.currentExercise.name}</span>
                  </Item.Title>
                  {#if model.currentExercise.machineBrand || model.currentExercise.targetRepRange || model.currentExercise.targetRepsInReserve}
                    <Item.Description>
                      <div class="flex flex-wrap gap-2">
                        {#if model.currentExercise.machineBrand}
                          <Badge variant="default">
                            {model.currentExercise.machineBrand}
                          </Badge>
                        {/if}
                        {#if model.currentExercise.targetRepRange.min || model.currentExercise.targetRepRange.max}
                          <Badge variant="secondary">
                            {model.currentExercise.targetRepRange.min}-{model.currentExercise
                              .targetRepRange.max} reps
                          </Badge>
                        {/if}
                        {#if model.currentExercise.targetRepsInReserve}
                          <Badge variant="secondary">
                            {model.currentExercise.targetRepsInReserve} RIR
                          </Badge>
                        {/if}
                      </div>
                    </Item.Description>
                  {/if}
                </Item.Content>
                <Item.Actions>
                  <ChevronRight class="size-4" />
                </Item.Actions>
              </a>
            {/if}
          {/snippet}
        </Item.Root>
      </div>
    {/if}

    <div class="px-4">
      <Separator />
    </div>

    <!-- Exercise Selection / Display -->
    <div class="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
      {#if !model.currentExerciseLog.exercise}
        <div class="flex flex-col items-center justify-center gap-4 py-8">
          <Button
            variant="outline"
            class="w-full max-w-xs"
            onclick={() => (chooseExerciseDialogOpen = true)}>Choose exercise</Button
          >
        </div>
      {:else}
        <!-- Sets List -->
        <div class="flex flex-col gap-2">
          {#each model.currentExerciseLog.sets as set, i (set.id)}
            <div class="flex items-center justify-between rounded-lg border bg-card p-3">
              <div class="flex gap-4">
                <span class="w-6 font-bold text-muted-foreground">#{i + 1}</span>
                <span>{set.weight} kg</span>
                <span>{set.reps} reps</span>
                {#if set.repsInReserve}
                  <span class="text-muted-foreground">{set.repsInReserve} RIR</span>
                {/if}
              </div>
              <div class="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8"
                  onclick={() => openEditSetDialog(set)}
                >
                  <Pencil class="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8"
                  onclick={() => openDeleteConfirmation(set.id)}
                >
                  <X class="h-4 w-4" />
                </Button>
              </div>
            </div>
          {/each}
        </div>

        <Button variant="outline" class="mt-2 w-full" onclick={openAddSetDialog}>
          <Plus class="mr-2 h-4 w-4" /> Create set
        </Button>

        {#if model.currentExerciseLog.sets.length === 0}
          <Button
            variant="outline"
            class="mt-2 w-full"
            onclick={() => (chooseExerciseDialogOpen = true)}>Change exercise</Button
          >
        {/if}

        <div class="mt-4">
          <Textarea
            placeholder="Add notes..."
            bind:value={model.currentExerciseLog.notes}
            onchange={saveNotes}
          />
        </div>

        <ExerciseHistory
          history={model.exerciseHistory}
          showEmptyState={!model.currentExerciseLog.exercise &&
            model.currentExerciseLog.sets.length > 0}
        />
      {/if}
    </div>
  </div>
{:else}
  <div class="flex items-center justify-center p-4 font-semibold">No exercises</div>
{/if}

<!-- Navigation & Actions -->
{#if model.view}
  <div class="mt-auto border-t bg-background p-4">
    <div class="mb-4 flex items-center justify-between">
      <Button
        variant="ghost"
        size="icon"
        disabled={model.currentIndex === 0}
        onclick={() => model.navigateTo(model.currentIndex - 1)}
      >
        <ChevronLeft class="h-8 w-8" />
      </Button>

      {#if model.view?.exercises.length > 0}
        <span class="text-sm text-muted-foreground">
          {model.currentIndex + 1} / {model.view?.exercises.length}
        </span>
      {/if}

      <Button
        variant="ghost"
        size="icon"
        disabled={model.currentIndex >= model.view?.exercises.length - 1}
        onclick={() => model.navigateTo(model.currentIndex + 1)}
      >
        <ChevronRight class="h-8 w-8" />
      </Button>
    </div>

    <div class="flex flex-col gap-2">
      <Button class="w-full" onclick={() => model.completeWorkout()}>Complete</Button>
      <Button variant="outline" class="w-full" onclick={() => model.cancelWorkout()}>Cancel</Button>
    </div>
  </div>
{/if}

<!-- Choose Exercise Dialog -->
{#if model.currentExerciseLog}
  <ExerciseSelector
    bind:open={chooseExerciseDialogOpen}
    exerciseTypeId={model.currentExerciseLog.exerciseType.id}
    onSelect={(id) => model.selectExercise(id)}
  />
{/if}

<!-- Add Set Dialog -->
<Dialog.Root bind:open={addSetDialogOpen}>
  <Dialog.Content onOpenAutoFocus={(e) => e.preventDefault()}>
    <Dialog.Header>
      <Dialog.Title>Add Set</Dialog.Title>
    </Dialog.Header>
    <div class="grid gap-4 py-4">
      <div class="grid grid-cols-4 items-center gap-4">
        <Label for="weight">Weight</Label>
        <Input id="weight" type="number" bind:value={newSetWeight} class="col-span-3" />
      </div>
      <div class="grid grid-cols-4 items-center gap-4">
        <Label for="reps">Reps</Label>
        <Input id="reps" type="number" bind:value={newSetReps} class="col-span-3" />
      </div>
      <div class="grid grid-cols-4 items-center gap-4">
        <Label for="rir">RIR</Label>
        <Input id="rir" type="number" bind:value={newSetRepsInReserve} class="col-span-3" />
      </div>
    </div>
    <Dialog.Footer>
      <Button
        onclick={addSet}
        disabled={newSetWeight === null ||
          newSetReps === null ||
          newSetWeight <= 0 ||
          newSetReps <= 0}>Save</Button
      >
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<!-- Edit Set Dialog -->
<Dialog.Root bind:open={editSetDialogOpen}>
  <Dialog.Content onOpenAutoFocus={(e) => e.preventDefault()}>
    <Dialog.Header>
      <Dialog.Title>Edit Set</Dialog.Title>
    </Dialog.Header>
    <div class="grid gap-4 py-4">
      <div class="grid grid-cols-4 items-center gap-4">
        <Label for="edit-weight" class="text-right">Weight (kg)</Label>
        <Input id="edit-weight" type="number" bind:value={editSetWeight} class="col-span-3" />
      </div>
      <div class="grid grid-cols-4 items-center gap-4">
        <Label for="edit-reps" class="text-right">Reps</Label>
        <Input id="edit-reps" type="number" bind:value={editSetReps} class="col-span-3" />
      </div>
      <div class="grid grid-cols-4 items-center gap-4">
        <Label for="edit-rir" class="text-right">RIR</Label>
        <Input id="edit-rir" type="number" bind:value={editSetRepsInReserve} class="col-span-3" />
      </div>
    </div>
    <Dialog.Footer>
      <Button onclick={updateSet}>Save</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<!-- Delete Set Confirmation -->
<AlertDialog.Root bind:open={deleteSetConfirmOpen}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Delete Set</AlertDialog.Title>
      <AlertDialog.Description>
        Are you sure you want to delete this set? This action cannot be undone.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action onclick={confirmDeleteSet}>Delete</AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
