<script lang="ts">
  import { getContext } from 'svelte';
  import { SERVICES_KEY, type Services } from '$lib/context';
  import { ExerciseSelectorModel } from '../models/exercise-selector.svelte';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import Button from '$lib/components/ui/button/button.svelte';
  import { Spinner } from '$lib/components/ui/spinner/index.js';

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
      model.loadExercises(exerciseTypeId);
    }
  });

  function handleSelect(id: string) {
    onSelect(id);
    open = false;
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content>
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
          <Button variant="outline" class="justify-start" onclick={() => handleSelect(exercise.id)}>
            {exercise.name}
            {#if exercise.machineBrand}
              <span class="text-muted-foreground">({exercise.machineBrand})</span>
            {/if}
          </Button>
        {/each}
        {#if model.exercises.length === 0}
          <p class="py-4 text-center text-muted-foreground">No exercises found for this type.</p>
        {/if}
      {/if}
    </div>
  </Dialog.Content>
</Dialog.Root>
