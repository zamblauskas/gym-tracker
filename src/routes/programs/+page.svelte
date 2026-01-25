<script lang="ts">
  import { getContext } from 'svelte';
  import { Plus, Folder } from 'lucide-svelte';
  import { PAGE_CHROME_KEY } from '$lib/context';
  import type { PageChromeModel } from '$lib/models/page-chrome.svelte';
  import { ProgramListModel } from '$lib/models/program-list.svelte';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import * as Alert from '$lib/components/ui/alert/index.js';
  import * as Empty from '$lib/components/ui/empty/index.js';
  import { Spinner } from '$lib/components/ui/spinner/index.js';
  import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
  import Separator from '$lib/components/ui/separator/separator.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import ProgramCard from '$lib/components/ProgramCard.svelte';

  const chrome = getContext<PageChromeModel>(PAGE_CHROME_KEY);
  const model = new ProgramListModel();

  let isCreateDialogOpen = $state(false);
  let createName = $state('');

  chrome.setBreadcrumbItems([{ label: 'Programs' }]);

  async function createProgram() {
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
    {#each model.programs as program (program.id)}
      <ProgramCard {program} />
    {:else}
      <Empty.Root>
        <Empty.Media>
          <Folder class="size-10 text-muted-foreground" />
        </Empty.Media>
        <Empty.Header>
          <Empty.Title>No programs found</Empty.Title>
          <Empty.Description>You haven't created any programs yet.</Empty.Description>
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
        <Plus /> Create a new program
      </Button>
    </Dialog.Trigger>
    <Dialog.Content onOpenAutoFocus={(e) => e.preventDefault()}>
      <Dialog.Header>
        <Dialog.Title>Create a new program</Dialog.Title>
        <Dialog.Description>Enter a name for your new program.</Dialog.Description>
      </Dialog.Header>
      <Input placeholder="Program name" bind:value={createName} />
      <Dialog.Footer>
        <Button onclick={createProgram} disabled={model.isActionInProgress || !createName.trim()}>
          {#if model.isProgramCreating}
            <Spinner class="mr-2" />
          {/if}
          Create
        </Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>
</div>
