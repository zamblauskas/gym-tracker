---
trigger: glob
globs: src/**/*.svelte
---

- When iterating with `each` always provide a unique key, i.e. `{#each exercises as exercise (exercise.id)}...{/each}`
