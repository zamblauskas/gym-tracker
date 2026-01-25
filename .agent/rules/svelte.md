---
trigger: glob
globs: src/**/*.svelte.ts
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

- When a method compare multiple Svelte runes (signals) each one must be captured with a concrete const, otherwise compiler might never reach and register following runes signals as method dependencies

```
// Bug `isExerciseCreating` might not be registered as dependency
  get isActionInProgress() {
    return (
      this.isLoading ||
      this.isExerciseCreating
    );
  }
```

```
// Correct

  get isActionInProgress() {
    const isLoading = this.isLoading;
    const isExerciseCreating = this.isExerciseCreating;

    return isLoading || isExerciseCreating;
  }
```

## Svelte Query (TanStack Query)

- Use helper utils from `$lib/utils/query.ts` for consistency:
  - `fetchQuery` for read operations (queries)
  - `updateMutation` / `deleteMutation` / `createMutation` for write operations (mutations)
- Always use the `Keys` object from `$lib/query-keys.ts` for query keys to ensure type safety and consistency across the app.
- When invalidating keys, prefer returning an array of keys from the `invalidateKeys` callback in mutation helpers.
- Models should aggregate `isLoading`, `isPending`, and `error` states from all internal queries and mutations to provide a unified state to the UI.
