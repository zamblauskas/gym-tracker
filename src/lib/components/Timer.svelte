<script lang="ts">
  import { X, Timer as TimerIcon } from 'lucide-svelte';
  import Button from '$lib/components/ui/button/button.svelte';

  interface Props {
    startTime: number;
    duration: number;
    onComplete: () => void;
    onDismiss: () => void;
  }

  let { startTime, duration, onComplete, onDismiss }: Props = $props();

  let timeLeft = $state(0);

  $effect(() => {
    calculateTimeLeft();

    const interval = setInterval(() => {
      calculateTimeLeft();
    }, 1000);

    return () => clearInterval(interval);
  });

  function calculateTimeLeft() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const left = duration - elapsed;
    if (left <= 0) {
      timeLeft = 0;
      onComplete();
    } else {
      timeLeft = left;
    }
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
      <span class="font-mono text-2xl leading-none font-bold tabular-nums">
        {formatTime(timeLeft)}
      </span>
    </div>
  </div>

  <Button variant="ghost" size="icon" class="h-8 w-8" onclick={onDismiss}>
    <X class="h-4 w-4" />
  </Button>
</div>
