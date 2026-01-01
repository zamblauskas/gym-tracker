import type { BreadcrumbItem } from '$lib/components/ui/Breadcrumb.svelte';

export class PageChromeModel {
  breadcrumbItems = $state<BreadcrumbItem[]>([]);

  setBreadcrumbItems(items: BreadcrumbItem[]) {
    this.breadcrumbItems = items;
  }
}
