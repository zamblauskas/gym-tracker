<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { onMount } from 'svelte';
  import { getContext } from 'svelte';
  import { Pencil, Plus, Trash2, Dumbbell } from 'lucide-svelte';
  import { PAGE_CHROME_KEY, SERVICES_KEY, type Services } from '$lib/context';
  import type { PageChromeModel } from '$lib/models/page-chrome.svelte';
  import { ExerciseTypeDetailModel } from '$lib/models/exercise-type-detail.svelte';
  import Separator from '$lib/components/ui/separator/separator.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
  import * as ButtonGroup from '$lib/components/ui/button-group/index.js';
  import * as Alert from '$lib/components/ui/alert/index.js';
  import * as Empty from '$lib/components/ui/empty/index.js';
  import { Spinner } from '$lib/components/ui/spinner/index.js';
  import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
  import ExerciseCard from '$lib/components/ExerciseCard.svelte';
  import AddEditExercise from '$lib/components/AddEditExercise.svelte';

  const exerciseTypeId = page.params.exerciseTypeId || '';

  const chrome = getContext<PageChromeModel>(PAGE_CHROME_KEY);
  const services = getContext<Services>(SERVICES_KEY);

  const model = new ExerciseTypeDetailModel(
    exerciseTypeId,
    services.exerciseTypeViewService,
    services.exerciseTypeCommandService,
    services.exerciseCommandService,
    services.gymViewService
  );

  let editDialogOpen = $state(false);
  let editedExerciseTypeName = $state('');
  let addExerciseDialogOpen = $state(false);
  let newExercise = $state({
    name: '',
    machineBrand: null as string | null,
    targetRepRangeMin: null as number | null,
    targetRepRangeMax: null as number | null,
    targetRepsInReserve: null as number | null
  });
  let newExerciseGymIds: string[] = $state([]);

  let breadcrumbItems = $derived(
    !model.exerciseType
      ? []
      : [
          { label: 'Exercise Types', href: '/exercise-types' },
          { label: model.exerciseType.name, href: `/exercise-types/${exerciseTypeId}` }
        ]
  );

  $effect(() => {
    chrome.breadcrumbItems = breadcrumbItems;
  });

  onMount(async () => {
    await model.loadData();
  });

  function openEditDialog() {
    editedExerciseTypeName = model.exerciseType?.name || '';
    editDialogOpen = true;
  }

  async function updateExerciseType() {
    const didUpdate = await model.updateExerciseType(editedExerciseTypeName);
    if (!didUpdate) return;
    editDialogOpen = false;
  }

  async function deleteExerciseType() {
    const didDelete = await model.deleteExerciseType();
    if (!didDelete) return;
    await goto(resolve('/exercise-types'));
  }

  function resetNewExercise() {
    newExercise = {
      name: '',
      machineBrand: null,
      targetRepRangeMin: null,
      targetRepRangeMax: null,
      targetRepsInReserve: null
    };
    newExerciseGymIds = [];
  }

  function toggleNewExerciseGym(gymId: string) {
    if (newExerciseGymIds.includes(gymId)) {
      newExerciseGymIds = newExerciseGymIds.filter((id) => id !== gymId);
    } else {
      newExerciseGymIds = [...newExerciseGymIds, gymId];
    }
  }

  async function createExercise() {
    const didCreate = await model.createExercise(
      newExercise.name,
      newExercise.machineBrand,
      { min: newExercise.targetRepRangeMin, max: newExercise.targetRepRangeMax },
      newExercise.targetRepsInReserve,
      newExerciseGymIds
    );
    if (!didCreate) return;
    resetNewExercise();
    addExerciseDialogOpen = false;
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
    {#each [0, 1, 2] as i (i)}
      <Skeleton class="h-[72px] w-full rounded-xl" />
    {/each}
  </div>
{:else if model.exerciseType}
  <div class="flex w-full flex-col gap-4 p-4">
    {#each model.exerciseType.exercises as exercise (exercise.id)}
      <ExerciseCard {exercise} />
    {:else}
      <Empty.Root>
        <Empty.Media>
          <Dumbbell class="size-10 text-muted-foreground" />
        </Empty.Media>
        <Empty.Header>
          <Empty.Title>No exercises found</Empty.Title>
          <Empty.Description>You haven't added any exercises to this type yet.</Empty.Description>
        </Empty.Header>
      </Empty.Root>
    {/each}
  </div>

  <div class="p-4">
    <Separator />
  </div>
{/if}

<div class="p-4">
  <ButtonGroup.Root class="w-full gap-1">
    <Dialog.Root
      bind:open={addExerciseDialogOpen}
      onOpenChange={(open) => !open && resetNewExercise()}
    >
      <Dialog.Trigger class="flex-1">
        <Button class="w-full" variant="outline" disabled={model.isActionInProgress}>
          <Plus /> Create exercise
        </Button>
      </Dialog.Trigger>
      <Dialog.Content onOpenAutoFocus={(e) => e.preventDefault()}>
        <Dialog.Header>
          <Dialog.Title>Create a new exercise</Dialog.Title>
          <Dialog.Description>Add an exercise to this exercise type.</Dialog.Description>
        </Dialog.Header>
        <AddEditExercise
          bind:formData={newExercise}
          allGyms={model.allGyms}
          selectedGymIds={newExerciseGymIds}
          onGymToggle={toggleNewExerciseGym}
        />
        <Dialog.Footer>
          <Button
            onclick={createExercise}
            disabled={newExercise.name.trim() === '' || model.isActionInProgress}
          >
            {#if model.isCreating}
              <Spinner class="mr-2" />
            {/if}
            Create
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
    <Dialog.Root bind:open={editDialogOpen}>
      <Dialog.Trigger class="flex-1" onclick={openEditDialog}>
        <Button class="w-full" variant="outline" disabled={model.isActionInProgress}>
          <Pencil /> Edit
        </Button>
      </Dialog.Trigger>
      <Dialog.Content onOpenAutoFocus={(e) => e.preventDefault()}>
        <Dialog.Header>
          <Dialog.Title>Edit exercise type</Dialog.Title>
          <Dialog.Description>Change the exercise type name.</Dialog.Description>
        </Dialog.Header>
        <Input placeholder="Exercise type name" bind:value={editedExerciseTypeName} />
        <Dialog.Footer>
          <Button
            onclick={updateExerciseType}
            disabled={editedExerciseTypeName.trim() === '' || model.isActionInProgress}
          >
            {#if model.isSaving}
              <Spinner class="mr-2" />
            {/if}
            Save
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
    <AlertDialog.Root>
      <AlertDialog.Trigger>
        <Button variant="outline" size="icon" disabled={model.isActionInProgress}>
          <Trash2 />
        </Button>
      </AlertDialog.Trigger>
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title>Delete exercise type?</AlertDialog.Title>
          <AlertDialog.Description>
            This will permanently delete this exercise type and all its exercises.
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
          <AlertDialog.Action onclick={deleteExerciseType}>
            {#if model.isDeleting}
              <Spinner class="mr-2" />
            {/if}
            Delete
          </AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog.Root>
  </ButtonGroup.Root>
</div>
