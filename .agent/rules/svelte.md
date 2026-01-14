---
trigger: glob
globs: src/**/*.svelte
---

- When iterating with `each` always provide a unique key, i.e. `{#each exercises as exercise (exercise.id)}...{/each}`

- When an $effect is used to trigger an imperative action (like fetching data), always:
  - Explicitly capture the dependency outside to ensure it is tracked.
  - Wrap the action execution in untrack to prevent accidental tracking of internal state read during the action.

```
$effect(() => {
  const m = model; // Explicit dependency
  untrack(() => {
    m.loadData();  // Untracked execution
  });
});
```

- All destructive actions must have a confirmation popup
