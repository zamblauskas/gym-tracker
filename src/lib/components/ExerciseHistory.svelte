<script lang="ts">
  import { History, ChevronsUpDown, MessageCircle } from 'lucide-svelte';
  import * as Collapsible from '$lib/components/ui/collapsible/index.js';
  import Separator from '$lib/components/ui/separator/separator.svelte';
  import * as Workout from '$lib/types/views/workout';
  import { timeAgo } from '$lib/utils/time-ago';
  import { calculateTotalVolume, formatVolume } from '$lib/utils/volume';
  import ExerciseHistoryDetail from './ExerciseHistoryDetail.svelte';

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

  function formatHistorySummary(item: Workout.ExerciseHistory) {
    if (item.sets.length === 0) {
      return '0 sets';
    }

    const ranges = item.sets.reduce(
      (acc, set) => {
        acc.weight.min = Math.min(acc.weight.min, set.weight);
        acc.weight.max = Math.max(acc.weight.max, set.weight);
        acc.reps.min = Math.min(acc.reps.min, set.reps);
        acc.reps.max = Math.max(acc.reps.max, set.reps);
        return acc;
      },
      {
        weight: { min: Infinity, max: -Infinity },
        reps: { min: Infinity, max: -Infinity }
      }
    );

    return [
      formatSetCount(item.sets.length),
      formatWeightRange(ranges.weight),
      formatRepRange(ranges.reps)
    ].join(' • ');
  }
</script>

{#if history.length > 0}
  <Collapsible.Root>
    <Collapsible.Trigger
      class="flex w-full items-center justify-between rounded-lg border bg-muted/50 p-3 text-sm hover:bg-muted"
    >
      {#if history[0]}
        <div class="flex flex-col items-start gap-1">
          <div class="flex items-center gap-2">
            <History class="inline-block h-4 w-4" />
            <span>Last workout - {formatDate(history[0].workoutDate)}</span>
          </div>
          <div class="align-left flex flex-col gap-1 text-left text-muted-foreground">
            <span>{formatHistorySummary(history[0])}</span>
            <span>{formatVolume(calculateTotalVolume(history[0].sets))}</span>
          </div>
          {#if history[0].notes}
            <div class="flex gap-1 text-sm text-muted-foreground italic">
              <MessageCircle class="size-4" />
              {history[0].notes}
            </div>
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
          <div class="text-sm text-muted-foreground">
            {item.routine.program.name} • {item.routine.name}
          </div>
          <ExerciseHistoryDetail sets={item.sets} notes={item.notes} />
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
