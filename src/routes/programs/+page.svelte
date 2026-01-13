<script lang="ts">
  import { onMount, getContext } from 'svelte';
  import { Plus, Folder } from 'lucide-svelte';
  import { PAGE_CHROME_KEY, SERVICES_KEY, type Services } from '$lib/context';
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
  const services = getContext<Services>(SERVICES_KEY);
  const model = new ProgramListModel(services.programViewService, services.programCommandService);

  let dialogOpen = $state(false);
  let newProgramName = $state('');

  chrome.setBreadcrumbItems([{ label: 'Programs' }]);

  onMount(async () => {
    await model.loadData();
  });

  async function createProgram() {
    const didCreate = await model.createProgram(newProgramName);
    if (!didCreate) return;
    newProgramName = '';
    dialogOpen = false;
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
  <Dialog.Root bind:open={dialogOpen}>
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
      <Input placeholder="Program name" bind:value={newProgramName} />
      <Dialog.Footer>
        <Button
          onclick={createProgram}
          disabled={newProgramName.trim() === '' || model.isActionInProgress}
        >
          {#if model.isCreating}
            <Spinner class="mr-2" />
          {/if}
          Create
        </Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>
</div>
