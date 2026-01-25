<script lang="ts">
  import { resolve } from '$app/paths';
  import { getContext } from 'svelte';
  import { ChevronRight, History } from 'lucide-svelte';
  import { PAGE_CHROME_KEY } from '$lib/context';
  import type { PageChromeModel } from '$lib/models/page-chrome.svelte';
  import { WorkoutHistoryListModel } from '$lib/models/workout-history-list.svelte';
  import { timeAgo } from '$lib/utils/time-ago';
  import * as Item from '$lib/components/ui/item/index.js';
  import * as Alert from '$lib/components/ui/alert/index.js';
  import * as Empty from '$lib/components/ui/empty/index.js';
  import { Spinner } from '$lib/components/ui/spinner/index.js';
  import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
  import Badge from '$lib/components/ui/badge/badge.svelte';

  const chrome = getContext<PageChromeModel>(PAGE_CHROME_KEY);
  const model = new WorkoutHistoryListModel();

  chrome.setBreadcrumbItems([{ label: 'Workout History' }]);
</script>

{#if model.errorMessage}
  <div class="p-4">
    <Alert.Root variant="destructive">
      <Alert.Title>Error</Alert.Title>
      <Alert.Description>{model.errorMessage}</Alert.Description>
    </Alert.Root>
  </div>
{/if}

{#if model.isLoading}
  <div class="flex w-full flex-col gap-4 p-4">
    <Spinner class="mx-auto h-8 w-8" />
    {#each [0, 1, 2] as i (i)}
      <Skeleton class="h-[72px] w-full rounded-xl" />
    {/each}
  </div>
{:else}
  <div class="flex w-full flex-col gap-4 p-4">
    {#each model.historyItems as item (item.id)}
      <Item.Root variant="outline">
        {#snippet child({ props })}
          <a href={resolve(`/workout-history/${item.id}`)} {...props}>
            <Item.Content>
              <Item.Title>{item.routine.program.name}</Item.Title>
              <Item.Description>{item.routine.name}</Item.Description>
            </Item.Content>
            <Item.Actions>
              <ChevronRight class="size-4" />
            </Item.Actions>
            <Item.Footer>
              <Badge variant="secondary">{timeAgo(item.completedAt)}</Badge>
            </Item.Footer>
          </a>
        {/snippet}
      </Item.Root>
    {:else}
      <Empty.Root>
        <Empty.Media>
          <History class="size-10 text-muted-foreground" />
        </Empty.Media>
        <Empty.Header>
          <Empty.Title>No history</Empty.Title>
          <Empty.Description>You haven't completed any workouts yet.</Empty.Description>
        </Empty.Header>
      </Empty.Root>
    {/each}
  </div>
{/if}
