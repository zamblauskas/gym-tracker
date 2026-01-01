<script lang="ts">
  import { History, MessageSquare, ChevronsUpDown } from 'lucide-svelte';
  import * as Collapsible from '$lib/components/ui/collapsible/index.js';
  import Separator from '$lib/components/ui/separator/separator.svelte';
  import * as Workout from '$lib/types/views/workout';
  import { timeAgo } from '$lib/utils/time-ago';

  interface Props {
    history: Workout.ExerciseHistory[];
    showEmptyState?: boolean;
  }

  let { history, showEmptyState = false }: Props = $props();

  function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function formatSetCount(setCount: number): string {
    return `${setCount} ${setCount === 1 ? 'set' : 'sets'}`;
  }

  function formatWeightRange(range: { min: number; max: number }): string {
    return range.min === range.max ? `${range.min} kg` : `${range.min}-${range.max} kg`;
  }

  function formatRepRange(range: { min: number; max: number }): string {
    return range.min === range.max ? `${range.min} reps` : `${range.min}-${range.max} reps`;
  }

  function formatHistorySummary(item: Workout.ExerciseHistory): string {
    if (item.sets.length === 0) {
      return '0 sets';
    }

    return [
      formatSetCount(item.sets.length),
      formatWeightRange(
        item.sets.reduce(
          (acc, set) => {
            acc.min = Math.min(acc.min, set.weight);
            acc.max = Math.max(acc.max, set.weight);
            return acc;
          },
          { min: Infinity, max: -Infinity }
        )
      ),
      formatRepRange(
        item.sets.reduce(
          (acc, set) => {
            acc.min = Math.min(acc.min, set.reps);
            acc.max = Math.max(acc.max, set.reps);
            return acc;
          },
          { min: Infinity, max: -Infinity }
        )
      )
    ].join(' • ');
  }
</script>

{#if history.length > 0}
  <Collapsible.Root class="mt-6">
    <Collapsible.Trigger
      class="flex w-full items-center justify-between rounded-lg border bg-muted/50 p-3 text-sm hover:bg-muted"
    >
      {#if history[0]}
        <div class="flex flex-col items-start gap-1">
          <div class="flex items-center gap-2">
            <History class="inline-block h-4 w-4" />
            <span>Last workout - {formatDate(history[0].workoutDate)}</span>
          </div>
          <div class="text-muted-foreground">{formatHistorySummary(history[0])}</div>
          {#if history[0].notes}
            <div class="text-muted-foreground italic">"{history[0].notes}"</div>
          {/if}
        </div>
      {/if}
      <ChevronsUpDown
        class="h-5 w-5 transition-transform duration-200 group-data-[state=open]:rotate-90"
      />
    </Collapsible.Trigger>
    <Collapsible.Content class="mt-2 space-y-4 rounded-lg border bg-card p-4">
      {#each history as item, i (item.workoutExerciseId)}
        <div class="space-y-2">
          <div class="text-sm font-medium">
            {formatDate(item.workoutDate)}
            <span class="text-muted-foreground">({timeAgo(item.workoutDate)})</span>
          </div>
          <div class="space-y-1 pl-4">
            {#if item.sets.length === 0}
              <div class="flex gap-3 text-sm text-muted-foreground">No sets</div>
            {:else}
              {#each item.sets as set, setIndex (set.id)}
                <div class="flex gap-3 text-sm">
                  <span class="w-6 text-muted-foreground">#{setIndex + 1}</span>
                  <span>{set.weight} kg × {set.reps} reps</span>
                  {#if set.repsInReserve}
                    <span class="text-muted-foreground">{set.repsInReserve} RIR</span>
                  {/if}
                </div>
              {/each}
            {/if}
          </div>
          {#if item.notes}
            <div class="pl-4 text-sm text-muted-foreground italic">
              <MessageSquare class="inline-block h-4 w-4" /> "{item.notes}"
            </div>
          {/if}
          {#if i < history.length - 1}
            <Separator class="mt-3" />
          {/if}
        </div>
      {/each}
    </Collapsible.Content>
  </Collapsible.Root>
{:else if showEmptyState}
  <div class="mt-6 rounded-lg border bg-muted/50 p-4 text-center text-sm text-muted-foreground">
    No previous workouts
  </div>
{/if}
