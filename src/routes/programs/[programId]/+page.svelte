<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { onMount } from 'svelte';
  import { getContext } from 'svelte';
  import {
    Pencil,
    Plus,
    Trash2,
    CircleAlert,
    ChevronUp,
    ChevronDown,
    ScrollText
  } from 'lucide-svelte';
  import { PAGE_CHROME_KEY, SERVICES_KEY, type Services } from '$lib/context';
  import type { PageChromeModel } from '$lib/models/page-chrome.svelte';
  import { ProgramDetailModel } from '$lib/models/program-detail.svelte';
  import Separator from '$lib/components/ui/separator/separator.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import RoutineCard from '$lib/components/RoutineCard.svelte';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
  import * as ButtonGroup from '$lib/components/ui/button-group/index.js';
  import * as Alert from '$lib/components/ui/alert/index.js';
  import * as Empty from '$lib/components/ui/empty/index.js';
  import { Spinner } from '$lib/components/ui/spinner/index.js';
  import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
  import * as Program from '$lib/types/views/program';

  const programId = page.params.programId || '';
  const chrome = getContext<PageChromeModel>(PAGE_CHROME_KEY);
  const services = getContext<Services>(SERVICES_KEY);
  const model = new ProgramDetailModel(
    programId,
    services.programViewService,
    services.programCommandService,
    services.routineCommandService
  );

  let editDialogOpen = $state(false);
  let editedProgramName = $state('');
  let editedRoutineOrder: Program.RoutineDetail[] = $state([]);
  let addRoutineDialogOpen = $state(false);
  let newRoutineName = $state('');

  let breadcrumbItems = $derived(
    !model.program ? [] : [{ label: 'Programs', href: '/programs' }, { label: model.program.name }]
  );

  $effect(() => {
    chrome.breadcrumbItems = breadcrumbItems;
  });

  onMount(async () => {
    await model.loadData();
  });

  function openEditDialog() {
    editedProgramName = model.program?.name || '';
    editedRoutineOrder = model.program?.routines ? [...model.program.routines] : [];
    editDialogOpen = true;
  }

  async function updateProgram() {
    const newOrder = editedRoutineOrder.map((r) => r.id);
    const didUpdate = await model.updateProgram(editedProgramName, newOrder);
    if (!didUpdate) return;

    editDialogOpen = false;
  }

  async function moveRoutineUp(routineId: string) {
    const index = editedRoutineOrder.findIndex((r) => r.id === routineId);
    if (index >= 0) {
      const temp1 = editedRoutineOrder[index - 1];
      const temp2 = editedRoutineOrder[index];
      if (temp1 && temp2) {
        editedRoutineOrder[index] = temp1;
        editedRoutineOrder[index - 1] = temp2;
      }
    }
  }

  async function moveRoutineDown(routineId: string) {
    const index = editedRoutineOrder.findIndex((r) => r.id === routineId);
    if (index >= 0) {
      const temp1 = editedRoutineOrder[index + 1];
      const temp2 = editedRoutineOrder[index];
      if (temp1 && temp2) {
        editedRoutineOrder[index] = temp1;
        editedRoutineOrder[index + 1] = temp2;
      }
    }
  }

  async function createRoutine() {
    const didCreate = await model.createRoutine(newRoutineName);
    if (!didCreate) return;
    newRoutineName = '';
    addRoutineDialogOpen = false;
  }

  async function deleteProgram() {
    const didDelete = await model.deleteProgram();
    if (!didDelete) return;
    await goto(resolve('/programs'));
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
{:else if model.program}
  <div class="flex w-full flex-col gap-4 p-4">
    {#each model.program.routines as routine (routine.id)}
      <RoutineCard {routine} />
    {:else}
      <Empty.Root>
        <Empty.Media>
          <ScrollText class="size-10 text-muted-foreground" />
        </Empty.Media>
        <Empty.Header>
          <Empty.Title>No routines found</Empty.Title>
          <Empty.Description>You haven't added any routines to this program yet.</Empty.Description>
        </Empty.Header>
      </Empty.Root>
    {/each}
  </div>
{/if}

<div class="p-4">
  <Separator />
</div>

<div class="p-4">
  <ButtonGroup.Root class="w-full gap-1">
    <!-- Add Routine button -->
    <Dialog.Root bind:open={addRoutineDialogOpen}>
      <Dialog.Trigger class="flex-1">
        <Button
          class="w-full"
          variant="outline"
          disabled={!model.program || model.isActionInProgress}
        >
          <Plus /> Create routine
        </Button>
      </Dialog.Trigger>
      <Dialog.Content onOpenAutoFocus={(e) => e.preventDefault()}>
        <Dialog.Header>
          <Dialog.Title>Create a new routine</Dialog.Title>
          <Dialog.Description>Enter a name for your new routine.</Dialog.Description>
        </Dialog.Header>
        <Input placeholder="Routine name" bind:value={newRoutineName} />
        <Dialog.Footer>
          <Button
            onclick={createRoutine}
            disabled={newRoutineName.trim() === '' || model.isActionInProgress}
          >
            {#if model.isCreating}
              <Spinner class="mr-2" />
            {/if}
            Create
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
    <!-- Edit Program button -->
    <Dialog.Root bind:open={editDialogOpen}>
      <Dialog.Trigger class="flex-1" onclick={openEditDialog}>
        <Button
          class="w-full"
          variant="outline"
          disabled={!model.program || model.isActionInProgress}
        >
          <Pencil /> Edit
        </Button>
      </Dialog.Trigger>
      <Dialog.Content
        class="flex max-h-[95dvh] flex-col"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Dialog.Header>
          <Dialog.Title>Edit program</Dialog.Title>
          <Dialog.Description>Change the program name and reorder routines.</Dialog.Description>
        </Dialog.Header>
        <div class="flex flex-col gap-4 overflow-y-auto pt-1">
          <Input placeholder="Program name" bind:value={editedProgramName} />

          <Separator class="my-4" />

          {#if model.program && model.program.routines.length === 0}
            <p class="text-center text-sm text-muted-foreground">No routines available.</p>
          {:else}
            <div class="flex flex-col gap-2">
              {#each editedRoutineOrder as routine, index (routine.id)}
                <div class="flex items-center gap-2 rounded-lg border p-3">
                  <div class="flex flex-col gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      class="h-5 w-5"
                      disabled={!model.program || model.isActionInProgress || index === 0}
                      onclick={() => moveRoutineUp(routine.id)}
                    >
                      <ChevronUp class="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      class="h-5 w-5"
                      disabled={!model.program ||
                        model.isActionInProgress ||
                        index === model.program.routines.length - 1}
                      onclick={() => moveRoutineDown(routine.id)}
                    >
                      <ChevronDown class="h-3 w-3" />
                    </Button>
                  </div>

                  <span class="flex-1">{routine.name}</span>
                </div>
              {/each}
            </div>
          {/if}
        </div>
        <Dialog.Footer>
          <Button
            onclick={updateProgram}
            disabled={editedProgramName.trim() === '' || model.isActionInProgress}
          >
            {#if model.isSaving}
              <Spinner class="mr-2" />
            {/if}
            Save
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
    <!-- Delete Program button -->
    <AlertDialog.Root>
      <AlertDialog.Trigger>
        <Button variant="outline" size="icon" disabled={!model.program || model.isActionInProgress}>
          <Trash2 />
        </Button>
      </AlertDialog.Trigger>
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title>Delete program?</AlertDialog.Title>
          <AlertDialog.Description>
            This will permanently delete this program and all its routines.
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
          <AlertDialog.Action onclick={deleteProgram}>
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
