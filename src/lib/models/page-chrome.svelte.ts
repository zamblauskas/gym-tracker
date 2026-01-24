import type { BreadcrumbItem } from '$lib/components/ui/Breadcrumb.svelte';
import { useIsFetching, useIsMutating, type QueryClient } from '@tanstack/svelte-query';

export class PageChromeModel {
  private fetchingCount;
  private mutatingCount;

  breadcrumbItems = $state<BreadcrumbItem[]>([]);

  constructor(queryClient: QueryClient) {
    this.fetchingCount = useIsFetching(undefined, queryClient);
    this.mutatingCount = useIsMutating(undefined, queryClient);
  }

  get isLoading() {
    const isFetching = this.fetchingCount.current > 0;
    const isMutating = this.mutatingCount.current > 0;
    return isFetching || isMutating;
  }

  setBreadcrumbItems(items: BreadcrumbItem[]) {
    this.breadcrumbItems = items;
  }
}
