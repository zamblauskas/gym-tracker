<script lang="ts">
  import { Plus, Minus } from 'lucide-svelte';
  import type { Gym } from '$lib/types/views';
  import Separator from '$lib/components/ui/separator/separator.svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import Label from '$lib/components/ui/label/label.svelte';
  import Button from '$lib/components/ui/button/button.svelte';

  interface ExerciseFormData {
    name: string;
    machineBrand: string | null;
    targetRepRangeMin: number | null;
    targetRepRangeMax: number | null;
    targetRepsInReserve: number | null;
  }

  interface Props {
    formData: ExerciseFormData;
    allGyms: Gym.Compact[];
    selectedGymIds: string[];
    onGymToggle: (gymId: string) => void;
  }

  let { formData = $bindable(), allGyms, selectedGymIds, onGymToggle }: Props = $props();

  let selectedGyms = $derived(
    selectedGymIds
      .flatMap((id) => {
        const g = allGyms.find((g) => g.id === id);
        return g ? [g] : [];
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  );

  let unselectedGyms = $derived(allGyms.filter((g) => !selectedGymIds.includes(g.id)));
</script>

<div class="flex flex-col gap-4 overflow-y-auto">
  <div class="flex flex-col gap-2">
    <Label for="exercise-name">Name</Label>
    <Input id="exercise-name" placeholder="e.g., Bench Press" bind:value={formData.name} />
  </div>
  <div class="flex flex-col gap-2">
    <Label for="exercise-brand">Machine Brand</Label>
    <Input
      id="exercise-brand"
      placeholder="e.g., Life Fitness"
      bind:value={formData.machineBrand}
    />
  </div>
  <div class="flex flex-col gap-2">
    <Label>Target Rep Range</Label>
    <div class="flex items-center gap-2">
      <Input
        type="number"
        placeholder="Min"
        min={1}
        max={99}
        bind:value={formData.targetRepRangeMin}
      />
      <span class="text-muted-foreground">—</span>
      <Input
        type="number"
        placeholder="Max"
        min={1}
        max={99}
        bind:value={formData.targetRepRangeMax}
      />
    </div>
  </div>
  <div class="flex flex-col gap-2">
    <Label for="exercise-rir">Reps in Reserve (RIR)</Label>
    <Input
      id="exercise-rir"
      type="number"
      placeholder="e.g., 2"
      min={0}
      max={99}
      bind:value={formData.targetRepsInReserve}
    />
  </div>
  <Separator />
  <div class="flex flex-col gap-2">
    {#if allGyms.length === 0}
      <p class="text-center text-sm text-muted-foreground">No gyms available.</p>
    {:else}
      <div class="flex flex-col gap-2">
        {#if selectedGyms.length > 0}
          <div class="pt-4 text-center text-base leading-none font-semibold">Selected gyms</div>
          {#each selectedGyms as gym (gym.id)}
            <div class="flex items-center gap-2 rounded-lg border p-2">
              <span class="flex-1 text-sm">{gym.name}</span>
              <Button
                size="icon"
                variant="ghost"
                onclick={() => onGymToggle(gym.id)}
                onmousedown={(e) => e.preventDefault()}
              >
                <Minus />
              </Button>
            </div>
          {/each}
        {/if}

        {#if unselectedGyms.length > 0}
          <div class="pt-4 text-center text-base leading-none font-semibold">Available gyms</div>
          {#each unselectedGyms as gym (gym.id)}
            <div class="flex items-center gap-2 rounded-lg border p-2">
              <span class="flex-1 text-sm">{gym.name}</span>
              <Button
                size="icon"
                variant="ghost"
                onclick={() => onGymToggle(gym.id)}
                onmousedown={(e) => e.preventDefault()}
              >
                <Plus />
              </Button>
            </div>
          {/each}
        {/if}
      </div>
    {/if}
  </div>
</div>
