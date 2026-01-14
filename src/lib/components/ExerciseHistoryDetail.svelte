<script lang="ts">
  import { MessageCircle } from 'lucide-svelte';
  import type { SetDetail } from '$lib/types/views/workout';
  import { calculateTotalVolume, formatVolume } from '$lib/utils/volume';

  interface Props {
    sets: SetDetail[];
    notes: string | null;
  }

  let { sets, notes }: Props = $props();
</script>

{#if sets.length > 0}
  <div class="mt-4 rounded-md border">
    <table class="w-full text-sm">
      <thead class="[&_tr]:border-b">
        <tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
          <th class="h-10 w-[50px] px-2 text-left align-middle font-medium text-muted-foreground"
            >Set</th
          >
          <th class="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Weight</th>
          <th class="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Reps</th>
          <th class="h-10 px-2 text-right align-middle font-medium text-muted-foreground">RIR</th>
        </tr>
      </thead>
      <tbody class="[&_tr:last-child]:border-0">
        {#each sets as set, i (set.id)}
          <tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
            <td class="p-2 align-middle font-medium">{i + 1}</td>
            <td class="p-2 align-middle">{set.weight} kg</td>
            <td class="p-2 align-middle">{set.reps}</td>
            <td class="p-2 text-right align-middle">
              {set.repsInReserve !== null ? set.repsInReserve : '-'}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <!-- Volume -->
  <div class="px-2 pt-2 text-sm text-muted-foreground">
    Volume: {formatVolume(calculateTotalVolume(sets))}
  </div>
{/if}

<!-- Notes -->
{#if notes}
  <div class="flex gap-1 px-2 pt-2 text-sm text-muted-foreground italic">
    <MessageCircle class="size-4" />
    {notes}
  </div>
{/if}
