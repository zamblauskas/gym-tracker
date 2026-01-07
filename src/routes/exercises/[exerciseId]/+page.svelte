<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { onMount } from 'svelte';
  import { getContext } from 'svelte';
  import { Pencil, Trash2, CircleAlert, MapPinned } from 'lucide-svelte';
  import { PAGE_CHROME_KEY, SERVICES_KEY, type Services } from '$lib/context';
  import type { PageChromeModel } from '$lib/models/page-chrome.svelte';
  import { ExerciseDetailModel } from '$lib/models/exercise-detail.svelte';
  import Separator from '$lib/components/ui/separator/separator.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
  import * as ButtonGroup from '$lib/components/ui/button-group/index.js';
  import * as Alert from '$lib/components/ui/alert/index.js';
  import { Spinner } from '$lib/components/ui/spinner/index.js';
  import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
  import AddEditExercise from '$lib/components/AddEditExercise.svelte';

  const exerciseId = page.params.exerciseId || '';
  const chrome = getContext<PageChromeModel>(PAGE_CHROME_KEY);
  const services = getContext<Services>(SERVICES_KEY);
  const model = new ExerciseDetailModel(
    exerciseId,
    services.exerciseViewService,
    services.exerciseCommandService,
    services.gymViewService
  );

  let editDialogOpen = $state(false);
  let editedExercise = $state({
    name: '',
    machineBrand: null as string | null,
    targetRepRangeMin: null as number | null,
    targetRepRangeMax: null as number | null,
    targetRepsInReserve: null as number | null
  });
  let selectedGymIds: string[] = $state([]);

  let breadcrumbItems = $derived(
    !model.exercise
      ? []
      : [
          { label: 'Exercise Types', href: '/exercise-types' },
          {
            label: model.exercise.exerciseType.name,
            href: `/exercise-types/${model.exercise.exerciseType.id}`
          },
          {
            label: model.exercise.name
          }
        ]
  );

  $effect(() => {
    chrome.breadcrumbItems = breadcrumbItems;
  });

  onMount(async () => {
    if (exerciseId) {
      await model.loadData();
    } else {
      model.isLoading = false;
    }
  });

  function openEditDialog() {
    if (!model.exercise) return;
    editedExercise = {
      name: model.exercise.name,
      machineBrand: model.exercise.machineBrand,
      targetRepRangeMin: model.exercise.targetRepRange?.min,
      targetRepRangeMax: model.exercise.targetRepRange?.max,
      targetRepsInReserve: model.exercise.targetRepsInReserve
    };
    selectedGymIds = model.exercise.gyms.map((g) => g.id);
    editDialogOpen = true;
  }

  function toggleGym(gymId: string) {
    if (selectedGymIds.includes(gymId)) {
      selectedGymIds = selectedGymIds.filter((id) => id !== gymId);
    } else {
      selectedGymIds = [...selectedGymIds, gymId];
    }
  }

  async function updateExercise() {
    if (!model.exercise) return;
    if (!editedExercise.name.trim()) return;

    const didUpdate = await model.updateExercise(
      editedExercise.name,
      editedExercise.machineBrand,
      { min: editedExercise.targetRepRangeMin, max: editedExercise.targetRepRangeMax },
      editedExercise.targetRepsInReserve,
      selectedGymIds
    );
    if (!didUpdate) return;
    editDialogOpen = false;
  }

  async function deleteExercise() {
    if (!model.exercise) return;

    const didDelete = await model.deleteExercise();
    if (!didDelete) return;
    await goto(resolve(`/exercise-types/${model.exercise.exerciseType.id}`));
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
      <Skeleton class="h-[48px] w-full rounded-md" />
    {/each}
  </div>
{:else if model.exercise}
  <div class="flex w-full flex-col gap-4 p-4">
    {#if model.exercise.machineBrand}
      <div class="flex flex-col gap-1">
        <span class="text-sm text-muted-foreground">Machine Brand</span>
        <span>{model.exercise.machineBrand}</span>
      </div>
    {/if}
    {#if model.exercise.targetRepRange}
      <div class="flex flex-col gap-1">
        <span class="text-sm text-muted-foreground">Target Rep Range</span>
        <span>{model.exercise.targetRepRange.min}–{model.exercise.targetRepRange.max} reps</span>
      </div>
    {/if}
    {#if model.exercise.targetRepsInReserve}
      <div class="flex flex-col gap-1">
        <span class="text-sm text-muted-foreground">Reps in Reserve (RIR)</span>
        <span>{model.exercise.targetRepsInReserve}</span>
      </div>
    {/if}
    {#if model.exercise.gyms.length > 0}
      <div class="flex flex-col gap-1">
        <span class="text-sm text-muted-foreground">Available at</span>
        <div class="flex flex-wrap gap-2">
          {#each model.allGyms.filter( (g) => model.exercise?.gyms.find((g2) => g2.id === g.id) ) as gym (gym.id)}
            <div class="flex items-center gap-1 rounded-md border px-2 py-1 text-sm">
              <MapPinned class="size-3" />
              <span>{gym.name}</span>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
{/if}
<div class="p-4">
  <Separator />
</div>

<div class="p-4">
  <ButtonGroup.Root class="w-full gap-1">
    <Dialog.Root bind:open={editDialogOpen}>
      <Dialog.Trigger class="flex-1" onclick={openEditDialog}>
        <Button class="w-full" variant="outline" disabled={model.isActionInProgress}>
          <Pencil /> Edit
        </Button>
      </Dialog.Trigger>
      <Dialog.Content onOpenAutoFocus={(e) => e.preventDefault()}>
        <Dialog.Header>
          <Dialog.Title>Edit exercise</Dialog.Title>
          <Dialog.Description>Update exercise details.</Dialog.Description>
        </Dialog.Header>
        <AddEditExercise
          bind:formData={editedExercise}
          allGyms={model.allGyms}
          {selectedGymIds}
          onGymToggle={toggleGym}
        />
        <Dialog.Footer>
          <Button
            onclick={updateExercise}
            disabled={editedExercise.name.trim() === '' || model.isActionInProgress}
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
          <AlertDialog.Title>Delete exercise?</AlertDialog.Title>
          <AlertDialog.Description>
            This will permanently delete this exercise.
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
          <AlertDialog.Action onclick={deleteExercise}>
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
