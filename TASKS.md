# Tracks epic and tasks we are actively working on

## Epic: Svelte-Query migration

Introduce @tanstack/svelte-query v6 with Svelte runes support

> While Svelte v5 has legacy compatibility with the stores syntax from Svelte v3/v4, it has been somewhat buggy and unreliable for this adapter. The @tanstack/svelte-query v6 adapter fully migrates to the runes syntax, which relies on signals. This rewrite should also simplify the code required to ensure your query inputs remain reactive.

Changes should be limited to Model and Page.

### Task: Introduce Gold-standard Model and Page

These will be used as reference for code-style:

- src/lib/models/exercise-detail.svelte.ts
- src/routes/exercises/[exerciseId]/+page.svelte
- src/lib/query-keys.ts

Todo:

- [x] Refactor Model to use queries and mutations
- [x] Optimistic update
- [x] Type-safe query keys

### Future tasks

- Fix Hardcoded Paths in Breadcrumbs

```
You are using hardcoded strings for breadcrumbs. If the app base path changes, breadcrumbs will break. Refactoring Opportunity: Consistently use resolve() for all internal links or abstract breadcrumb generation.
```
