<script lang="ts">
  import { resolve } from '$app/paths';
  import { getContext } from 'svelte';
  import { MapPinned, Plus, ChevronRight } from 'lucide-svelte';
  import { PAGE_CHROME_KEY } from '$lib/context';
  import { GymListModel } from '$lib/models/gym-list.svelte';
  import type { PageChromeModel } from '$lib/models/page-chrome.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import * as Alert from '$lib/components/ui/alert/index.js';
  import { Spinner } from '$lib/components/ui/spinner/index.js';
  import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
  import Separator from '$lib/components/ui/separator/separator.svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import * as Item from '$lib/components/ui/item/index.js';
  import * as Empty from '$lib/components/ui/empty/index.js';

  const chrome = getContext<PageChromeModel>(PAGE_CHROME_KEY);
  const model = new GymListModel();

  let isCreateDialogOpen = $state(false);
  let createName = $state('');

  chrome.setBreadcrumbItems([{ label: 'Gyms' }]);

  async function createGym() {
    await model.create({ name: createName });
    isCreateDialogOpen = false;
    createName = '';
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
{:else}
  <div class="flex w-full flex-col gap-4 p-4">
    {#each model.gyms as gym (gym.id)}
      <Item.Root variant="outline">
        {#snippet child({ props })}
          <a href={resolve(`/gyms/${gym.id}`)} {...props}>
            <Item.Content>
              <Item.Title><MapPinned /> {gym.name}</Item.Title>
            </Item.Content>
            <Item.Actions>
              <ChevronRight class="size-4" />
            </Item.Actions>
          </a>
        {/snippet}
      </Item.Root>
    {:else}
      <Empty.Root>
        <Empty.Media>
          <MapPinned class="size-10 text-muted-foreground" />
        </Empty.Media>
        <Empty.Header>
          <Empty.Title>No gyms found</Empty.Title>
          <Empty.Description>
            Add your gyms to track progress on specific machines.
          </Empty.Description>
        </Empty.Header>
      </Empty.Root>
    {/each}
  </div>
{/if}

<div class="p-4">
  <Separator />
</div>

<div class="p-4">
  <Dialog.Root bind:open={isCreateDialogOpen}>
    <Dialog.Trigger class="w-full">
      <Button class="w-full" variant="outline" disabled={model.isActionInProgress}>
        <Plus /> Add Gym
      </Button>
    </Dialog.Trigger>
    <Dialog.Content onOpenAutoFocus={(e) => e.preventDefault()}>
      <Dialog.Header>
        <Dialog.Title>Add Gym</Dialog.Title>
      </Dialog.Header>
      <div class="space-y-4 py-4">
        <Input placeholder="Gym Name" bind:value={createName} />
      </div>
      <Dialog.Footer>
        <Button variant="outline" onclick={() => (isCreateDialogOpen = false)}>Cancel</Button>
        <Button onclick={createGym} disabled={model.isActionInProgress || !createName.trim()}>
          {#if model.isGymCreating}
            <Spinner class="mr-2" />
          {/if}
          Create
        </Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>
</div>
