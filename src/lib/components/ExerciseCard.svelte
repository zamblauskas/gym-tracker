<script lang="ts">
  import type { Range } from '$lib/types/range';
  import { resolve } from '$app/paths';
  import { formatRepRange } from '$lib/utils/range';
  import { ChevronRight, Dumbbell, MapPinned } from 'lucide-svelte';
  import * as Item from '$lib/components/ui/item/index.js';
  import Badge from '$lib/components/ui/badge/badge.svelte';

  interface Exercise {
    id: string;
    name: string;
    machineBrand: string | null;
    targetRepRange: Range<number>;
    targetRepsInReserve: number | null;
    gyms:
      | {
          id: string;
          name: string;
        }[]
      | null;
  }

  interface Props {
    exercise: Exercise;
  }

  let { exercise }: Props = $props();
</script>

<Item.Root variant="outline">
  {#snippet child({ props })}
    <a href={resolve(`/exercises/${exercise.id}`)} {...props}>
      <Item.Content>
        <Item.Title><Dumbbell class="size-4" /> {exercise.name}</Item.Title>
        <Item.Description>
          <div class="flex flex-wrap gap-2">
            {#if exercise.machineBrand}
              <Badge variant="default">
                {exercise.machineBrand}
              </Badge>
            {/if}
            {#if exercise.targetRepRange.min || exercise.targetRepRange.max}
              <Badge variant="secondary">
                {formatRepRange(exercise.targetRepRange)} reps
              </Badge>
            {/if}
            {#if exercise.targetRepsInReserve}
              <Badge variant="secondary">
                {exercise.targetRepsInReserve} RIR
              </Badge>
            {/if}
            {#each exercise.gyms as gym (gym.id)}
              <Badge variant="secondary">
                <MapPinned class="size-4" />
                {gym.name}
              </Badge>
            {/each}
          </div>
        </Item.Description>
      </Item.Content>
      <Item.Actions>
        <ChevronRight class="size-5 text-muted-foreground" />
      </Item.Actions>
    </a>
  {/snippet}
</Item.Root>
