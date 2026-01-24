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
- src/lib/utils/query.ts

Todo:

- [x] Refactor exercise-detail model and page
  - [x] Refactor Model to use queries and mutations
  - [x] Optimistic update
  - [x] Type-safe query keys
  - [x] Show refetching or pending state indicator even for background queries
- [x] Refactor exercise-type-detail model and page
- [x] Refactor exercise-type-list model and page
- [ ] Refactor gym-detail model and page
- [ ] Refactor gym-list model and page
- [ ] Refactor routine-detail model and page
- [ ] Refactor routine-list model and page
- [ ] Refactor program-detail model and page
- [ ] Refactor program-list model and page
- [ ] Refactor workout-detail model and page
- [ ] Refactor workout-history-detail model and page
- [ ] Refactor workout-history-list model and page

### Future tasks

- Fix Hardcoded Paths in Breadcrumbs

```
You are using hardcoded strings for breadcrumbs. If the app base path changes, breadcrumbs will break. Refactoring Opportunity: Consistently use resolve() for all internal links or abstract breadcrumb generation.
```

- UX / Error Visibility

```
if the "Create" action fails the errorMessage is displayed on the main page background (Alert.Root). Since the Dialog remains open (correctly preserving user input), it may obscure the error message, leaving the user confused about why the spinner stopped but nothing happened.
Recommendation: Consider checking model.errorMessage inside the Dialog context or using a toast notification for creation errors. This is a pattern observed in the reference implementation as well, suggesting a system-wide consistency improvement opportunity.
```
