<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { X, Timer as TimerIcon } from 'lucide-svelte';
  import Button from '$lib/components/ui/button/button.svelte';

  interface Props {
    duration: number;
    onComplete: () => void;
    onDismiss: () => void;
  }

  let { duration, onComplete, onDismiss }: Props = $props();

  let timeLeft = $state(0);
  let interval: NodeJS.Timeout | null = null;

  onMount(() => {
    timeLeft = duration;
    const startedAt = new Date();
    interval = setInterval(() => {
      timeLeft = duration - secondsFrom(startedAt);
      if (timeLeft <= 0) {
        if (interval) clearInterval(interval);
        onComplete();
      }
    }, 1000);
  });

  onDestroy(() => {
    if (interval) clearInterval(interval);
  });

  function secondsFrom(start: Date): number {
    return Math.floor((new Date().getTime() - start.getTime()) / 1000);
  }

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
</script>

<div
  class="flex items-center justify-between rounded-lg border bg-secondary/50 p-3 text-secondary-foreground"
>
  <div class="flex items-center gap-3">
    <div class="flex h-8 w-8 items-center justify-center">
      <TimerIcon class="h-4 w-4 animate-pulse text-primary" />
    </div>
    <div class="flex flex-col">
      <span class="text-xs font-medium text-muted-foreground uppercase">Rest Timer</span>
      <span class="font-mono text-lg leading-none font-bold tabular-nums">
        {formatTime(timeLeft)}
      </span>
    </div>
  </div>

  <Button variant="ghost" size="icon" class="h-8 w-8" onclick={onDismiss}>
    <X class="h-4 w-4" />
  </Button>
</div>
