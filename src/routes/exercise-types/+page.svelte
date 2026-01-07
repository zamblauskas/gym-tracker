<script lang="ts">
  import { onMount } from 'svelte';
  import { resolve } from '$app/paths';
  import { getContext } from 'svelte';
  import { Plus, PersonStanding, ChevronRight } from 'lucide-svelte';
  import { PAGE_CHROME_KEY, SERVICES_KEY, type Services } from '$lib/context';
  import { ExerciseTypeListModel } from '$lib/models/exercise-type-list.svelte';
  import type { PageChromeModel } from '$lib/models/page-chrome.svelte';
  import * as Item from '$lib/components/ui/item/index.js';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import * as Alert from '$lib/components/ui/alert/index.js';
  import * as Empty from '$lib/components/ui/empty/index.js';
  import { Spinner } from '$lib/components/ui/spinner/index.js';
  import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
  import Separator from '$lib/components/ui/separator/separator.svelte';
  import Badge from '$lib/components/ui/badge/badge.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import Input from '$lib/components/ui/input/input.svelte';

  const chrome = getContext<PageChromeModel>(PAGE_CHROME_KEY);
  const services = getContext<Services>(SERVICES_KEY);

  const model = new ExerciseTypeListModel(
    services.exerciseTypeViewService,
    services.exerciseTypeCommandService
  );

  let dialogOpen = $state(false);
  let newExerciseTypeName = $state('');

  chrome.setBreadcrumbItems([{ label: 'Exercise Types', href: '/exercise-types' }]);

  onMount(async () => {
    await model.loadData();
  });

  async function createExerciseType() {
    const didCreate = await model.createExerciseType(newExerciseTypeName);
    if (!didCreate) return;

    newExerciseTypeName = '';
    dialogOpen = false;
  }

  function getExerciseCountLabel(exerciseCount: number): string {
    return exerciseCount === 1 ? '1 exercise' : `${exerciseCount} exercises`;
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
    {#each model.exerciseTypes as exerciseType (exerciseType.id)}
      <Item.Root variant="outline">
        {#snippet child({ props })}
          <a href={resolve(`/exercise-types/${exerciseType.id}`)} {...props}>
            <Item.Content>
              <Item.Title><PersonStanding class="size-4" /> {exerciseType.name}</Item.Title>
            </Item.Content>
            <Item.Actions>
              <ChevronRight class="size-4" />
            </Item.Actions>
            <Item.Footer>
              <Badge variant="secondary">{getExerciseCountLabel(exerciseType.exerciseCount)}</Badge>
            </Item.Footer>
          </a>
        {/snippet}
      </Item.Root>
    {:else}
      <Empty.Root>
        <Empty.Media>
          <PersonStanding class="size-10 text-muted-foreground" />
        </Empty.Media>
        <Empty.Header>
          <Empty.Title>No exercise types found</Empty.Title>
          <Empty.Description>You haven't created any exercise types yet.</Empty.Description>
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
        <Plus /> Create a new exercise type
      </Button>
    </Dialog.Trigger>
    <Dialog.Content onOpenAutoFocus={(e) => e.preventDefault()}>
      <Dialog.Header>
        <Dialog.Title>Create a new exercise type</Dialog.Title>
        <Dialog.Description>Enter a name for your new exercise type.</Dialog.Description>
      </Dialog.Header>
      <Input placeholder="Exercise type name" bind:value={newExerciseTypeName} />
      <Dialog.Footer>
        <Button
          onclick={createExerciseType}
          disabled={newExerciseTypeName.trim() === '' || model.isActionInProgress}
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
