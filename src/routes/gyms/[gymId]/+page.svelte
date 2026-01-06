<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { onMount } from 'svelte';
  import { getContext } from 'svelte';
  import { Pencil, Trash2, CircleAlert } from 'lucide-svelte';
  import { PAGE_CHROME_KEY, SERVICES_KEY, type Services } from '$lib/context';
  import type { PageChromeModel } from '$lib/models/page-chrome.svelte';
  import { GymDetailModel } from '$lib/models/gym-detail.svelte';
  import Separator from '$lib/components/ui/separator/separator.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import Label from '$lib/components/ui/label/label.svelte';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
  import * as ButtonGroup from '$lib/components/ui/button-group/index.js';
  import * as Alert from '$lib/components/ui/alert/index.js';
  import { Spinner } from '$lib/components/ui/spinner/index.js';
  import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';

  const gymId = page.params.gymId || '';
  const chrome = getContext<PageChromeModel>(PAGE_CHROME_KEY);
  const services = getContext<Services>(SERVICES_KEY);
  const model = new GymDetailModel(gymId, services.gymViewService, services.gymCommandService);

  let editDialogOpen = $state(false);
  let editName = $state('');

  let breadcrumbItems = $derived(
    !model.gym
      ? []
      : [
          { label: 'Gyms', href: '/gyms' },
          {
            label: model.gym.name
          }
        ]
  );

  $effect(() => {
    chrome.setBreadcrumbItems(breadcrumbItems);
  });

  onMount(async () => {
    if (gymId) {
      await model.loadData();
    } else {
      model.isLoading = false;
    }
  });

  function openEditDialog() {
    if (!model.gym) return;
    editName = model.gym.name;
    editDialogOpen = true;
  }

  async function updateGym() {
    if (!model.gym) return;
    if (!editName.trim()) return;

    const didUpdate = await model.updateGym(editName);
    if (!didUpdate) return;
    editDialogOpen = false;
  }

  async function deleteGym() {
    if (!model.gym) return;

    const didDelete = await model.deleteGym();
    if (!didDelete) return;
    await goto(resolve('/gyms'));
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
{:else if model.gym}
  <div class="flex w-full flex-col gap-4 p-4">
    <div class="flex flex-col gap-1">
      <span class="text-sm text-muted-foreground">Name</span>
      <span>{model.gym.name}</span>
    </div>
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
          <Dialog.Title>Edit gym</Dialog.Title>
          <Dialog.Description>Update gym details.</Dialog.Description>
        </Dialog.Header>
        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <Label for="edit-name">Name</Label>
            <Input id="edit-name" placeholder="Gym Name" bind:value={editName} />
          </div>
        </div>
        <Dialog.Footer>
          <Button onclick={updateGym} disabled={editName.trim() === '' || model.isActionInProgress}>
            {#if model.isUpdating}
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
          <AlertDialog.Title>Delete gym?</AlertDialog.Title>
          <AlertDialog.Description>This will permanently delete this gym.</AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
          <AlertDialog.Action onclick={deleteGym}>
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
