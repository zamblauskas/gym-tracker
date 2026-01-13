<script lang="ts">
  import { resolve } from '$app/paths';
  import { ChevronRight, ScrollText } from 'lucide-svelte';
  import * as Item from '$lib/components/ui/item/index.js';

  interface Routine {
    id: string;
    name: string;
  }

  interface Props {
    routine: Routine;
  }

  let { routine }: Props = $props();
</script>

<Item.Root variant="outline">
  {#snippet child({ props })}
    <a href={resolve(`/routines/${routine.id}`)} {...props}>
      <Item.Content>
        <Item.Title><ScrollText class="size-4" /> {routine.name}</Item.Title>
      </Item.Content>
      <Item.Actions>
        <ChevronRight class="size-5 text-muted-foreground" />
      </Item.Actions>
    </a>
  {/snippet}
</Item.Root>
