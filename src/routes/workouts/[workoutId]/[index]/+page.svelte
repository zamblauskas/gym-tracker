<script lang="ts">
  import { page } from '$app/state';
  import { getContext } from 'svelte';
  import { resolve } from '$app/paths';
  import { PUBLIC_TIMER_DURATION } from '$env/static/public';
  import { ChevronLeft, ChevronRight, X, Repeat, Plus, Pencil, NotebookPen } from 'lucide-svelte';
  import { PAGE_CHROME_KEY, TIMER_KEY } from '$lib/context';

  import type { PageChromeModel } from '$lib/models/page-chrome.svelte';
  import type { TimerModel } from '$lib/models/timer.svelte';
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
  import ExerciseCard from '$lib/components/ExerciseCard.svelte';
  import ExerciseTypeCard from '$lib/components/ExerciseTypeCard.svelte';
  import Timer from '$lib/components/Timer.svelte';
  import { calculateTotalVolume, formatVolume } from '$lib/utils/volume';

  const workoutId = $derived(page.params.workoutId!);
  const index = $derived(Number(page.params.index!));

  const chrome = getContext<PageChromeModel>(PAGE_CHROME_KEY);
  const timer = getContext<TimerModel>(TIMER_KEY);

  const model = new WorkoutDetailModel(
    () => workoutId,
    () => index
  );

  let chooseExerciseDialogOpen = $state(false);
  let addSetDialogOpen = $state(false);
  let editSetDialogOpen = $state(false);
  let deleteSetConfirmOpen = $state(false);

  let timerDuration = Number(PUBLIC_TIMER_DURATION);
  let activeTimer = $derived(
    model.workout?.exercise?.id ? timer.get(model.workout.exercise.id) : undefined
  );

  let newSetWeight = $state<number | null>(null);
  let newSetReps = $state<number | null>(null);
  let newSetRepsInReserve = $state<number | null>(null);

  let editingSetId = $state<string | null>(null);
  let editSetWeight = $state<number | null>(null);
  let editSetReps = $state<number | null>(null);
  let editSetRepsInReserve = $state<number | null>(null);

  let deletingSetId = $state<string | null>(null);

  let notes = $state('');
  let lastExerciseId = $state<string | undefined>(undefined);

  $effect(() => {
    const exerciseId = model.workout?.exercise?.id;
    if (exerciseId && exerciseId !== lastExerciseId) {
      lastExerciseId = exerciseId;
      notes = model.workout?.exercise?.notes ?? '';
    }
  });

  let breadcrumbItems = $derived(
    !model.workout
      ? []
      : [
          {
            label: `Workout • ${model.workout.routine.program.name} • ${model.workout.routine.name}`
          }
        ]
  );

  $effect(() => {
    chrome.breadcrumbItems = breadcrumbItems;
  });

  function openAddSetDialog() {
    if (model.workout?.exercise && model.workout.exercise.sets.length > 0) {
      const lastSet = model.workout.exercise.sets[model.workout.exercise.sets.length - 1];
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
    if (model.workout?.exercise?.id) {
      timer.start(model.workout.exercise.id, timerDuration);
    }
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
    // Optimistic update
    void model.updateNotes(notes);
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
{:else if model.workout}
  <div class="flex flex-col">
    <div class="flex flex-col gap-2 px-4 pt-4">
      <span class="text-sm text-muted-foreground">Exercise Type</span>
      {#if model.workout.exercise}
        <ExerciseTypeCard exerciseType={model.workout.exercise.exerciseType} />
      {/if}
    </div>
    {#if model.workout.exercise.exercise}
      <div class="flex flex-col gap-2 p-4">
        <span class="text-sm text-muted-foreground">Exercise</span>
        <ExerciseCard exercise={model.workout.exercise.exercise} />
        {#if model.workout.exercise.exercise.notes}
          <div class="flex items-start gap-1 pl-1 text-muted-foreground">
            <NotebookPen class="mt-0.5 size-4" />
            <span class="text-sm whitespace-pre-wrap italic"
              >{model.workout.exercise.exercise.notes}</span
            >
          </div>
        {/if}
      </div>
    {/if}

    <div class="px-4">
      <Separator />
    </div>

    <div class="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
      {#if !model.workout.exercise.exercise}
        <div class="flex flex-col items-center justify-center gap-4 py-8">
          <Button
            variant="outline"
            class="w-full max-w-xs"
            disabled={model.isActionInProgress}
            onclick={() => (chooseExerciseDialogOpen = true)}>Choose exercise</Button
          >
        </div>
      {:else}
        <div class="flex flex-col gap-2">
          {#each model.workout.exercise.sets as set, i (set.id)}
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
                  disabled={model.isActionInProgress}
                  onclick={() => openEditSetDialog(set)}
                >
                  <Pencil class="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8"
                  disabled={model.isActionInProgress}
                  onclick={() => openDeleteConfirmation(set.id)}
                >
                  <X class="h-4 w-4" />
                </Button>
              </div>
            </div>
          {/each}
        </div>

        {#if model.workout.exercise.sets.length > 0}
          <div class="rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            Volume: {formatVolume(calculateTotalVolume(model.workout.exercise.sets))}
          </div>
        {/if}

        {#if activeTimer && model.workout?.exercise?.id}
          <Timer
            duration={activeTimer.duration}
            startTime={activeTimer.startTime}
            onDismiss={() => timer.remove(model.workout!.exercise.id)}
            onComplete={() => timer.remove(model.workout!.exercise.id)}
          />
        {/if}

        <Button
          variant="outline"
          class="mt-2 w-full"
          disabled={model.isActionInProgress}
          onclick={openAddSetDialog}
        >
          <Plus class="mr-2 h-4 w-4" /> Create set
        </Button>

        <Button
          variant="outline"
          class="mt-2 w-full"
          disabled={model.isActionInProgress}
          onclick={() => (chooseExerciseDialogOpen = true)}
        >
          <Repeat class="mr-2 h-4 w-4" />Change exercise
        </Button>

        <div class="mt-4">
          <Textarea placeholder="Add notes..." bind:value={notes} onchange={saveNotes} />
        </div>

        <ExerciseHistory
          history={model.history}
          showEmptyState={!model.workout.exercise.exercise &&
            model.workout.exercise.sets.length > 0}
        />
      {/if}
    </div>
  </div>
{:else}
  <div class="flex items-center justify-center p-4 font-semibold">No exercises</div>
{/if}

{#if model.workout}
  <div class="mt-auto border-t bg-background p-4">
    <div class="mb-4 flex items-center justify-between">
      <Button
        variant="ghost"
        size="icon"
        disabled={index === 0 || model.isActionInProgress}
        href={resolve(`/workouts/${workoutId}/${index - 1}`)}
      >
        <ChevronLeft class="h-8 w-8" />
      </Button>

      {#if model.workout.exerciseCount > 0}
        <span class="text-sm text-muted-foreground">
          {index + 1} / {model.workout.exerciseCount}
        </span>
      {/if}

      <Button
        variant="ghost"
        size="icon"
        disabled={index >= model.workout.exerciseCount - 1 || model.isActionInProgress}
        href={resolve(`/workouts/${workoutId}/${index + 1}`)}
      >
        <ChevronRight class="h-8 w-8" />
      </Button>
    </div>

    <div class="flex flex-col gap-2">
      <AlertDialog.Root>
        <AlertDialog.Trigger>
          <Button class="w-full" disabled={model.isActionInProgress}>Complete</Button>
        </AlertDialog.Trigger>
        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Title>Complete workout?</AlertDialog.Title>
            <AlertDialog.Description>
              This will mark the workout as completed and save your progress.
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
            <AlertDialog.Action onclick={() => model.completeWorkout()}>
              {#if model.isCompleting}
                <Spinner class="mr-2" />
              {/if}
              Complete
            </AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog.Root>
      <AlertDialog.Root>
        <AlertDialog.Trigger>
          <Button variant="outline" class="w-full" disabled={model.isActionInProgress}
            >Cancel</Button
          >
        </AlertDialog.Trigger>
        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Title>Cancel workout?</AlertDialog.Title>
            <AlertDialog.Description>
              This will discard the workout and all recorded sets.
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel>Go back</AlertDialog.Cancel>
            <AlertDialog.Action onclick={() => model.cancelWorkout()}>
              {#if model.isCancelling}
                <Spinner class="mr-2" />
              {/if}
              Cancel workout
            </AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </div>
  </div>
{/if}

{#if model.workout?.exercise}
  <ExerciseSelector
    bind:open={chooseExerciseDialogOpen}
    exerciseTypeId={model.workout.exercise.exerciseType.id}
    onSelect={(id) => model.selectExercise(id)}
  />
{/if}

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
        disabled={model.isActionInProgress ||
          newSetWeight === null ||
          newSetReps === null ||
          newSetWeight <= 0 ||
          newSetReps <= 0}
      >
        {#if model.isAddingSet}
          <Spinner class="mr-2" />
        {/if}
        Save
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

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
      <Button onclick={updateSet} disabled={model.isActionInProgress}>
        {#if model.isUpdatingSet}
          <Spinner class="mr-2" />
        {/if}
        Save
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

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
      <AlertDialog.Action onclick={confirmDeleteSet}>
        {#if model.isDeletingSet}
          <Spinner class="mr-2" />
        {/if}
        Delete
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
