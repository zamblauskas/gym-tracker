<script lang="ts">
  import { Home } from 'lucide-svelte';
  import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';

  export interface BreadcrumbItem {
    label: string;
    href?: string;
  }

  interface Props {
    items: BreadcrumbItem[];
  }

  let { items }: Props = $props();
</script>

<Breadcrumb.Root>
  <Breadcrumb.List>
    <Breadcrumb.Item>
      <Breadcrumb.Link href="/"><Home></Home></Breadcrumb.Link>
    </Breadcrumb.Item>
    {#if items.length > 0}
      <Breadcrumb.Separator />
    {/if}

    {#each items as item, index}
      {#if index < items.length - 1 && item.href}
        <Breadcrumb.Item>
          <Breadcrumb.Link href={item.href}>
            {item.label}
          </Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
      {:else}
        <Breadcrumb.Item>
          <Breadcrumb.Page>
            {item.label}
          </Breadcrumb.Page>
        </Breadcrumb.Item>
      {/if}
    {/each}
  </Breadcrumb.List>
</Breadcrumb.Root>
