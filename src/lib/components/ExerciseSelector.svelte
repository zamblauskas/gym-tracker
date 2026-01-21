<script lang="ts">
  import { getContext, untrack } from 'svelte';
  import { SERVICES_KEY, type Services } from '$lib/context';
  import { ExerciseSelectorModel } from '../models/exercise-selector.svelte';
  import { MapPinned } from 'lucide-svelte';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import * as Item from '$lib/components/ui/item/index.js';
  import { Spinner } from '$lib/components/ui/spinner/index.js';
  import Badge from './ui/badge/badge.svelte';

  interface Props {
    open: boolean;
    exerciseTypeId: string;
    onSelect: (exerciseId: string) => void;
  }

  let { open = $bindable(false), exerciseTypeId, onSelect }: Props = $props();

  const services = getContext<Services>(SERVICES_KEY);
  const model = new ExerciseSelectorModel(services.exerciseViewService);

  $effect(() => {
    if (open && exerciseTypeId) {
      untrack(() => void model.loadExercises(exerciseTypeId));
    }
  });

  function handleSelect(id: string) {
    onSelect(id);
    open = false;
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content onOpenAutoFocus={(e) => e.preventDefault()}>
    <Dialog.Header>
      <Dialog.Title>Choose Exercise</Dialog.Title>
    </Dialog.Header>
    <div class="flex max-h-[60vh] flex-col gap-2 overflow-y-auto">
      {#if model.isLoading}
        <div class="flex justify-center py-8">
          <Spinner class="h-8 w-8" />
        </div>
      {:else if model.errorMessage}
        <p class="py-4 text-center text-destructive">{model.errorMessage}</p>
      {:else}
        {#each model.exercises as exercise (exercise.id)}
          <Item.Root onclick={() => handleSelect(exercise.id)} variant="outline">
            <Item.Content>
              <Item.Title>{exercise.name}</Item.Title>
              <Item.Description>
                {#if exercise.machineBrand}
                  <Badge>{exercise.machineBrand}</Badge>
                {/if}
                {#each exercise.gyms as gym (gym.id)}
                  <Badge variant="secondary">
                    <MapPinned class="size-4" />
                    {gym.name}
                  </Badge>
                {/each}
              </Item.Description>
            </Item.Content>
          </Item.Root>
        {/each}
        {#if model.exercises.length === 0}
          <p class="py-4 text-center text-muted-foreground">No exercises found for this type.</p>
        {/if}
      {/if}
    </div>
  </Dialog.Content>
</Dialog.Root>
