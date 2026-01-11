<script lang="ts">
  import { onMount } from 'svelte';

  import { getContext } from 'svelte';
  import { Plus, PersonStanding } from 'lucide-svelte';
  import { PAGE_CHROME_KEY, SERVICES_KEY, type Services } from '$lib/context';
  import { ExerciseTypeListModel } from '$lib/models/exercise-type-list.svelte';
  import type { PageChromeModel } from '$lib/models/page-chrome.svelte';

  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import * as Alert from '$lib/components/ui/alert/index.js';
  import * as Empty from '$lib/components/ui/empty/index.js';
  import { Spinner } from '$lib/components/ui/spinner/index.js';
  import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
  import Separator from '$lib/components/ui/separator/separator.svelte';

  import Button from '$lib/components/ui/button/button.svelte';
  import AddEditExerciseType from '$lib/components/AddEditExerciseType.svelte';
  import ExerciseTypeCard from '$lib/components/ExerciseTypeCard.svelte';

  const chrome = getContext<PageChromeModel>(PAGE_CHROME_KEY);
  const services = getContext<Services>(SERVICES_KEY);

  const model = new ExerciseTypeListModel(
    services.exerciseTypeViewService,
    services.exerciseTypeCommandService
  );

  let dialogOpen = $state(false);
  let newExerciseType = $state({
    name: '',
    targetRepRangeMin: null as number | null,
    targetRepRangeMax: null as number | null,
    targetRepsInReserve: null as number | null
  });

  chrome.setBreadcrumbItems([{ label: 'Exercise Types', href: '/exercise-types' }]);

  onMount(async () => {
    await model.loadData();
  });

  async function createExerciseType() {
    const didCreate = await model.createExerciseType(
      newExerciseType.name,
      { min: newExerciseType.targetRepRangeMin, max: newExerciseType.targetRepRangeMax },
      newExerciseType.targetRepsInReserve
    );
    if (!didCreate) return;

    newExerciseType = {
      name: '',
      targetRepRangeMin: null,
      targetRepRangeMax: null,
      targetRepsInReserve: null
    };
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
    {#each model.exerciseTypes as exerciseType (exerciseType.id)}
      <ExerciseTypeCard {exerciseType} />
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
      <AddEditExerciseType bind:formData={newExerciseType} />
      <Dialog.Footer>
        <Button
          class="w-full"
          onclick={createExerciseType}
          disabled={newExerciseType.name.trim() === '' || model.isActionInProgress}
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
