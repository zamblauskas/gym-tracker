<script lang="ts">
  import Input from '$lib/components/ui/input/input.svelte';
  import Label from '$lib/components/ui/label/label.svelte';

  interface ExerciseTypeFormData {
    name: string;
    targetRepRangeMin: number | null;
    targetRepRangeMax: number | null;
    targetRepsInReserve: number | null;
  }

  interface Props {
    formData: ExerciseTypeFormData;
  }

  let { formData = $bindable() }: Props = $props();
</script>

<div class="flex flex-col gap-4">
  <div class="flex flex-col gap-2">
    <Label for="exercise-type-name">Name</Label>
    <Input id="exercise-type-name" placeholder="e.g., Chest Press" bind:value={formData.name} />
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
    <Label for="exercise-type-rir">Reps in Reserve (RIR)</Label>
    <Input
      id="exercise-type-rir"
      type="number"
      placeholder="e.g., 2"
      min={0}
      max={99}
      bind:value={formData.targetRepsInReserve}
    />
  </div>
</div>
