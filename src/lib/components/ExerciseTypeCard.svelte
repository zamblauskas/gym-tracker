<script lang="ts">
  import type { Range } from '$lib/types/range';
  import { resolve } from '$app/paths';
  import { formatRepRange } from '$lib/utils/range';
  import { ChevronRight, PersonStanding } from 'lucide-svelte';
  import * as Item from '$lib/components/ui/item/index.js';
  import Badge from '$lib/components/ui/badge/badge.svelte';

  interface ExerciseType {
    id: string;
    name: string;
    exerciseCount?: number;
    targetRepRange: Range<number> | null;
    targetRepsInReserve: number | null;
  }

  interface Props {
    exerciseType: ExerciseType;
  }

  let { exerciseType }: Props = $props();

  function getExerciseCountLabel(count: number): string {
    return count === 1 ? '1 exercise' : `${count} exercises`;
  }
</script>

<Item.Root variant="outline">
  {#snippet child({ props })}
    <a href={resolve(`/exercise-types/${exerciseType.id}`)} {...props}>
      <Item.Content>
        <Item.Title><PersonStanding class="size-4" /> {exerciseType.name}</Item.Title>
        <Item.Description>
          <div class="flex flex-wrap gap-2">
            {#if exerciseType.exerciseCount !== undefined}
              <Badge variant="secondary">
                {getExerciseCountLabel(exerciseType.exerciseCount)}
              </Badge>
            {/if}
            {#if exerciseType.targetRepRange && (exerciseType.targetRepRange.min || exerciseType.targetRepRange.max)}
              <Badge variant="secondary">
                {formatRepRange(exerciseType.targetRepRange)} reps
              </Badge>
            {/if}
            {#if exerciseType.targetRepsInReserve}
              <Badge variant="secondary">
                {exerciseType.targetRepsInReserve} RIR
              </Badge>
            {/if}
          </div>
        </Item.Description>
      </Item.Content>
      <Item.Actions>
        <ChevronRight class="size-5 text-muted-foreground" />
      </Item.Actions>
    </a>
  {/snippet}
</Item.Root>
