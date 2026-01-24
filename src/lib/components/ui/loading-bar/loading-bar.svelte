<script lang="ts">
  import { cn } from '$lib/utils.js';

  let { class: className = '' } = $props();
</script>

<!--
    Modern indeterminate loading bar
    Colors: Neon Blue (cyan-500) -> Purple (purple-500) -> Neon Green (emerald-500)
-->
<div
  role="progressbar"
  class={cn('relative h-1 w-full overflow-hidden rounded-full bg-muted', className)}
>
  <div
    class="animate-progress-indeterminate absolute inset-0 h-full w-full origin-left bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-500 bg-[length:200%_100%]"
  ></div>
</div>

<style>
  @keyframes progress-indeterminate {
    0% {
      transform: translateX(-100%);
      background-position: 100% 50%;
    }
    100% {
      transform: translateX(100%);
      background-position: 0% 50%;
    }
  }
  .animate-progress-indeterminate {
    animation: progress-indeterminate 1.5s infinite linear;
  }
</style>
