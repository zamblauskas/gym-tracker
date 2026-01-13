<script lang="ts">
  import { resolve } from '$app/paths';
  import { ChevronRight, Folder } from 'lucide-svelte';
  import * as Item from '$lib/components/ui/item/index.js';
  import Badge from '$lib/components/ui/badge/badge.svelte';

  interface Program {
    id: string;
    name: string;
    routineCount?: number;
  }

  interface Props {
    program: Program;
  }

  let { program }: Props = $props();

  function getRoutineCountLabel(count: number): string {
    return count === 1 ? '1 routine' : `${count} routines`;
  }
</script>

<Item.Root variant="outline">
  {#snippet child({ props })}
    <a href={resolve(`/programs/${program.id}`)} {...props}>
      <Item.Content>
        <Item.Title><Folder class="size-4" /> {program.name}</Item.Title>
        <Item.Description>
          <div class="flex flex-wrap gap-2">
            {#if program.routineCount !== undefined}
              <Badge variant="secondary">
                {getRoutineCountLabel(program.routineCount)}
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
