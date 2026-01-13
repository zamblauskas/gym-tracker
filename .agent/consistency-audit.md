# Consistency Audit Report

**Date:** 2026-01-12T20:47:51+02:00

## Inventory

### Modified Files

1. `src/lib/context.ts` (lines 14, 33)
2. `src/lib/supabase/types.ts` (extensive auto-generated changes)
3. `src/lib/types/views/workout.ts` (lines 72-82)
4. `src/routes/+layout.svelte` (lines 30, 50, 70-71)
5. `src/routes/+page.svelte` (lines 18-19, 118, 179-191)

### New Files

1. `src/lib/models/workout-history-list.svelte.ts`
2. `src/lib/services/workout-history-view.service.ts`
3. `src/routes/workout-history/+page.svelte`
4. `supabase/migrations/20260112000000_workout_completed_at_constraint.sql`

---

## Detailed Analysis

### File: src/lib/context.ts

- **Twin:** N/A (Service registry file)
- **Status:** ✅ Match
- **Evidence:**
  - Line 14: `import type { WorkoutHistoryViewService } from './services/workout-history-view.service';`
  - Line 33: `workoutHistoryViewService: WorkoutHistoryViewService;`
- **Rationale:**
  - Follows exact alphabetical ordering pattern (WorkoutHistoryViewService comes after WorkoutViewService)
  - Import statement matches existing pattern: `import type { XViewService } from './services/x-view.service';`
  - Interface property follows camelCase naming: `workoutHistoryViewService`
  - Consistent with all other service registrations in the file

---

### File: src/lib/supabase/types.ts

- **Twin:** N/A (Auto-generated file)
- **Status:** ✅ Match
- **Evidence:** Extensive changes across multiple line ranges (database type definitions)
- **Rationale:**
  - This is an auto-generated file from Supabase CLI
  - Changes are expected when database schema is modified
  - Not manually authored, so consistency concerns don't apply

---

### File: src/lib/types/views/workout.ts

- **Twin:** `src/lib/types/views/program.ts`, `src/lib/types/views/gym.ts`
- **Status:** ✅ Match
- **Evidence:**

  ```typescript
  // New addition (lines 73-82)
  export interface HistoryItem {
    id: string;
    routine: {
      name: string;
      program: {
        name: string;
      };
    };
    completedAt: Date;
  }
  ```

  - Compared to `program.ts`:
    ```typescript
    export interface Compact {
      id: string;
      name: string;
      routineCount: number;
    }
    ```

- **Rationale:**
  - Follows namespace pattern for view types (within `workout.ts` module)
  - Interface name `HistoryItem` is descriptive and follows PascalCase
  - Property naming: `completedAt` uses camelCase (consistent with `createdAt` in `Compact` interface)
  - Nested object structure matches existing patterns in the same file (see `Detail` interface lines 46-57)
  - Uses `Date` type for timestamps (consistent with `createdAt: Date` in `Compact` interface)

---

### File: src/routes/+layout.svelte

- **Twin:** N/A (Root layout file)
- **Status:** ✅ Match
- **Evidence:**
  - Line 30: `import { WorkoutHistoryViewService } from '$lib/services/workout-history-view.service';`
  - Line 50: `const workoutHistoryViewService = new WorkoutHistoryViewService(supabase);`
  - Lines 70-71: Added to services context object
    ```typescript
    workoutHistoryViewService;
    ```
- **Rationale:**
  - Import follows alphabetical ordering and existing pattern
  - Service instantiation matches pattern: `const xViewService = new XViewService(supabase);`
  - Context registration is alphabetically ordered (comes after `workoutViewService`)
  - Follows exact same pattern as all other services (e.g., `gymViewService`, `programViewService`)

---

### File: src/routes/+page.svelte

- **Twin:** N/A (Home page)
- **Status:** ✅ Match
- **Evidence:**
  - Lines 18-19: Added `History` icon import
    ```typescript
    import {
      MapPinned,
      Folder,
      PersonStanding,
      ChevronRight,
      Activity,
      CircleAlert,
      Play,
      History // NEW
    } from 'lucide-svelte';
    ```
  - Line 118: Changed label from "Start a workout" to "Next workout"
  - Lines 179-191: Added new navigation item
    ```svelte
    <Item.Root variant="outline">
      {#snippet child({ props })}
        <a href={resolve('/workout-history')} {...props}>
          <Item.Content>
            <Item.Title><History />History</Item.Title>
          </Item.Content>
          <Item.Actions>
            <ChevronRight class="size-4" />
          </Item.Actions>
        </a>
      {/snippet}
    </Item.Root>
    ```
- **Rationale:**
  - Icon import maintains alphabetical order within lucide-svelte imports
  - New navigation item follows exact same structure as existing items (lines 141-178)
  - Uses same components: `Item.Root`, `Item.Content`, `Item.Title`, `Item.Actions`
  - Icon placement matches pattern: `<Icon />Text` (see line 145, 158, 171)
  - Uses `resolve()` for href (consistent with all other navigation items)
  - Label change on line 118 is a minor UX improvement, maintains existing structure

---

### File: src/lib/models/workout-history-list.svelte.ts

- **Twin:** `src/lib/models/program-list.svelte.ts`, `src/lib/models/gym-list.svelte.ts`
- **Status:** ⚠️ Diverged
- **Evidence:**

  **New file (workout-history-list.svelte.ts):**

  ```typescript
  export class WorkoutHistoryListModel {
    items = $state<Workout.HistoryItem[]>([]);
    isLoading = $state(true);
    errorMessage = $state('');

    constructor(private viewSvc: WorkoutHistoryViewService) {}

    async loadData() {
      logger.info('Loading workout history');
      this.isLoading = true;
      this.errorMessage = '';
      try {
        this.items = await this.viewSvc.getHistory();
        logger.info('Workout history loaded', { count: this.items.length });
      } catch (error) {
        this.errorMessage =
          error instanceof Error ? error.message : 'Failed to load workout history';
        logger.error('Failed to load workout history', { error });
      } finally {
        this.isLoading = false;
      }
    }
  }
  ```

  **Twin: program-list.svelte.ts:**

  ```typescript
  export class ProgramListModel {
    programs = $state<Program.Compact[]>([]);
    isLoading = $state(true);
    isCreating = $state(false);
    isActionInProgress = $derived(this.isLoading || this.isCreating);
    errorMessage = $state('');

    constructor(
      private viewSvc: ProgramViewService,
      private commandSvc: ProgramCommandService
    ) {}

    async loadData() {
      logger.info('Loading programs');

      this.isLoading = true;
      this.errorMessage = '';
      try {
        this.programs = await this.viewSvc.listPrograms();
        logger.info('Programs loaded', { programs: $state.snapshot(this.programs) });
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to load programs';
        logger.error('Failed to load programs', { error });
      } finally {
        this.isLoading = false;
      }
    }

    async createProgram(name: string): Promise<boolean> { ... }
  }
  ```

- **Rationale:**
  - **DIVERGENCE 1:** Property naming inconsistency
    - New file uses `items` for the list property
    - Twins use entity-specific names: `programs`, `gyms`
    - Should be `workouts` or `historyItems` for consistency
  - **DIVERGENCE 2:** Logging inconsistency
    - New file logs: `{ count: this.items.length }`
    - Twin logs: `{ programs: $state.snapshot(this.programs) }`
    - Twin pattern provides more debugging information by logging the full snapshot
    - New file should use: `{ items: $state.snapshot(this.items) }`

  - **MATCH:** Overall structure is correct
    - State properties follow pattern
    - Constructor injection matches
    - Error handling matches
    - Try-catch-finally structure matches
    - Logger usage is present (though details differ)

---

### File: src/lib/services/workout-history-view.service.ts

- **Twin:** `src/lib/services/program-view.service.ts`, `src/lib/services/gym-view.service.ts`
- **Status:** ✅ Match
- **Evidence:**

  **New file:**

  ```typescript
  export class WorkoutHistoryViewService {
    constructor(private client: SupabaseClient<Database>) {}

    async getHistory(limit: number = 20): Promise<Workout.HistoryItem[]> {
      const { data, error } = await this.client
        .from('workouts')
        .select(
          `
          id,
          completed_at,
          routines!inner (
            name,
            programs!inner (
              name
            )
          )
        `
        )
        .eq('status', 'completed')
        .is('deleted_at', null)
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to load workout history: ${error.message}`);
      }

      return data.map((workout) => {
        if (workout.completed_at === null) {
          throw new Error(`Workout ${workout.id} is completed without a completed_at date`);
        }

        return {
          id: workout.id,
          routine: {
            name: workout.routines.name,
            program: {
              name: workout.routines.programs.name
            }
          },
          completedAt: new Date(workout.completed_at)
        };
      });
    }
  }
  ```

  **Twin: gym-view.service.ts:**

  ```typescript
  export class GymViewService {
    constructor(private client: SupabaseClient<Database>) {}

    async listGyms(): Promise<Gym.Compact[]> {
      const { data, error } = await this.client
        .from('gyms')
        .select('id,name')
        .is('deleted_at', null)
        .order('name');

      if (error) {
        throw new Error(`Failed to load gyms: ${error.message}`);
      }

      return data.map((gym) => ({
        id: gym.id,
        name: gym.name
      }));
    }
  }
  ```

- **Rationale:**
  - **MATCH:** Constructor pattern identical
  - **MATCH:** Error handling pattern: `throw new Error(\`Failed to load...: ${error.message}\`)`
  - **MATCH:** Uses `.is('deleted_at', null)` for soft delete filtering
  - **MATCH:** Uses `!inner` joins for mandatory relationships (routines, programs)
  - **MATCH:** Returns Promise with typed view model
  - **MATCH:** Maps database response to view type
  - **MATCH:** Method naming follows pattern (though `getHistory` vs `listGyms` - both are acceptable)
  - **EXCELLENT:** Includes runtime validation for `completed_at` null check (defensive programming)
  - **MATCH:** Default parameter pattern: `limit: number = 20`
  - **MATCH:** Date conversion: `new Date(workout.completed_at)`

---

### File: src/routes/workout-history/+page.svelte

- **Twin:** `src/routes/programs/+page.svelte`, `src/routes/gyms/+page.svelte`
- **Status:** ✅ Match
- **Evidence:**

  **New file structure:**

  ```svelte
  <script lang="ts">
    import { onMount } from 'svelte';
    import { resolve } from '$app/paths';
    import { getContext } from 'svelte';
    // ... icons and components

    const chrome = getContext<PageChromeModel>(PAGE_CHROME_KEY);
    const services = getContext<Services>(SERVICES_KEY);
    const model = new WorkoutHistoryListModel(services.workoutHistoryViewService);

    chrome.setBreadcrumbItems([{ label: 'History' }]);

    onMount(async () => {
      await model.loadData();
    });
  </script>

  {#if model.errorMessage}
    <div class="p-4">
      <Alert.Root variant="destructive">
        <Alert.Title>Error</Alert.Title>
        <Alert.Description>{model.errorMessage}</Alert.Description>
      </Alert.Root>
    </div>
  {/if}

  {#if model.isLoading}
    <div class="flex w-full flex-col gap-4 p-4">
      <Spinner class="mx-auto h-8 w-8" />
      {#each [0, 1, 2] as i (i)}
        <Skeleton class="h-[72px] w-full rounded-xl" />
      {/each}
    </div>
  {:else}
    <div class="flex w-full flex-col gap-4 p-4">
      {#each model.items as item (item.id)}
        <Item.Root variant="outline">
          {#snippet child({ props })}
            <a href={resolve(`/workout-history/${item.id}`)} {...props}>
              <Item.Content>
                <Item.Title>{item.routine.program.name}</Item.Title>
                <Item.Description>{item.routine.name}</Item.Description>
              </Item.Content>
              <Item.Actions>
                <ChevronRight class="size-4" />
              </Item.Actions>
              <Item.Footer>
                <Badge variant="secondary">{timeAgo(item.completedAt)}</Badge>
              </Item.Footer>
            </a>
          {/snippet}
        </Item.Root>
      {:else}
        <Empty.Root>
          <Empty.Media>
            <History class="size-10 text-muted-foreground" />
          </Empty.Media>
          <Empty.Header>
            <Empty.Title>No history</Empty.Title>
            <Empty.Description>You haven't completed any workouts yet.</Empty.Description>
          </Empty.Header>
        </Empty.Root>
      {/each}
    </div>
  {/if}
  ```

  **Twin: programs/+page.svelte (relevant sections):**

  ```svelte
  <script lang="ts">
    import { onMount } from 'svelte';
    import { resolve } from '$app/paths';
    import { getContext } from 'svelte';
    // ... icons and components

    const chrome = getContext<PageChromeModel>(PAGE_CHROME_KEY);
    const services = getContext<Services>(SERVICES_KEY);
    const model = new ProgramListModel(services.programViewService, services.programCommandService);

    chrome.setBreadcrumbItems([{ label: 'Programs' }]);

    onMount(async () => {
      await model.loadData();
    });
  </script>

  {#if model.errorMessage}
    <div class="p-4">
      <Alert.Root variant="destructive">
        <Alert.Title>Error</Alert.Title>
        <Alert.Description>{model.errorMessage}</Alert.Description>
      </Alert.Root>
    </div>
  {/if}

  {#if model.isLoading}
    <div class="flex w-full flex-col gap-4 p-4">
      <Spinner class="mx-auto h-8 w-8" />
      {#each [0, 1, 2] as i (i)}
        <Skeleton class="h-[72px] w-full rounded-xl" />
      {/each}
    </div>
  {:else}
    <div class="flex w-full flex-col gap-4 p-4">
      {#each model.programs as program (program.id)}
        <Item.Root variant="outline">
          {#snippet child({ props })}
            <a href={resolve(`/programs/${program.id}`)} {...props}>
              <Item.Content>
                <Item.Title><Folder /> {program.name}</Item.Title>
              </Item.Content>
              <Item.Actions>
                <ChevronRight class="size-4" />
              </Item.Actions>
              <Item.Footer>
                <Badge variant="secondary">{getRoutineCountLabel(program.routineCount)}</Badge>
              </Item.Footer>
            </a>
          {/snippet}
        </Item.Root>
      {:else}
        <Empty.Root>
          <Empty.Media>
            <Folder class="size-10 text-muted-foreground" />
          </Empty.Media>
          <Empty.Header>
            <Empty.Title>No programs found</Empty.Title>
            <Empty.Description>You haven't created any programs yet.</Empty.Description>
          </Empty.Header>
        </Empty.Root>
      {/each}
    </div>
  {/if}
  ```

- **Rationale:**
  - **MATCH:** Import organization (svelte imports, then app imports, then lib imports)
  - **MATCH:** Context retrieval pattern
  - **MATCH:** Model instantiation pattern
  - **MATCH:** Breadcrumb setup
  - **MATCH:** onMount async data loading
  - **MATCH:** Error display structure (Alert.Root with destructive variant)
  - **MATCH:** Loading state with Spinner and Skeleton placeholders
  - **MATCH:** Same skeleton count (3 items) and dimensions (h-[72px])
  - **MATCH:** List rendering with Item.Root components
  - **MATCH:** Empty state pattern with Empty.Root, Empty.Media, Empty.Header
  - **MATCH:** Uses resolve() for navigation links
  - **MATCH:** Item structure: Title, Description (when applicable), Actions, Footer
  - **MATCH:** ChevronRight icon in Actions
  - **MATCH:** Badge in Footer for metadata
  - **MATCH:** Uses timeAgo() utility (consistent with home page usage)

---

### File: supabase/migrations/20260112000000_workout_completed_at_constraint.sql

- **Twin:** `supabase/migrations/20260106000000_gyms.sql`, `supabase/migrations/20251226000000_workouts.sql`
- **Status:** ✅ Match
- **Evidence:**

  **New file:**

  ```sql
  ALTER TABLE workouts
      ADD CONSTRAINT workouts_completed_at_required_when_completed
      CHECK (
          (status = 'completed' AND completed_at IS NOT NULL) OR
          (status != 'completed')
      );
  ```

  **Twin: 20260106000000_gyms.sql (constraint example):**

  ```sql
  CONSTRAINT gyms_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
  ```

  **Twin: 20251226000000_workouts.sql (constraint example):**

  ```sql
  CONSTRAINT workouts_status_check CHECK (status IN ('in_progress', 'completed', 'cancelled'))
  ```

- **Rationale:**
  - **MATCH:** Filename follows pattern: `YYYYMMDDHHMMSS_description.sql`
  - **MATCH:** Uses snake_case for constraint name: `workouts_completed_at_required_when_completed`
  - **MATCH:** Constraint naming pattern: `{table}_{description}`
  - **MATCH:** Indentation: 4 spaces (consistent with existing migrations)
  - **MATCH:** SQL formatting: uppercase keywords (ALTER, TABLE, ADD, CONSTRAINT, CHECK, AND, OR, IS, NOT, NULL)
  - **MATCH:** Logical constraint structure
  - **MATCH:** Ends with semicolon and newline

---

## Summary

### 🔍 Pattern Mapping Summary

| Component                                                              | Twins Used                                           | Status |
| :--------------------------------------------------------------------- | :--------------------------------------------------- | :----- |
| src/lib/context.ts                                                     | N/A (Service registry)                               | ✅     |
| src/lib/supabase/types.ts                                              | N/A (Auto-generated)                                 | ✅     |
| src/lib/types/views/workout.ts                                         | program.ts, gym.ts                                   | ✅     |
| src/routes/+layout.svelte                                              | N/A (Root layout)                                    | ✅     |
| src/routes/+page.svelte                                                | N/A (Home page)                                      | ✅     |
| src/lib/models/workout-history-list.svelte.ts                          | program-list.svelte.ts, gym-list.svelte.ts           | ⚠️     |
| src/lib/services/workout-history-view.service.ts                       | program-view.service.ts, gym-view.service.ts         | ✅     |
| src/routes/workout-history/+page.svelte                                | programs/+page.svelte, gyms/+page.svelte             | ✅     |
| supabase/migrations/20260112000000_workout_completed_at_constraint.sql | 20260106000000_gyms.sql, 20251226000000_workouts.sql | ✅     |

### 🚩 Deviations & Issues

**File: `src/lib/models/workout-history-list.svelte.ts`**

1. **Property Naming Inconsistency**
   - **Current:** `items = $state<Workout.HistoryItem[]>([]);`
   - **Expected:** `historyItems = $state<Workout.HistoryItem[]>([]);` or `workouts = $state<Workout.HistoryItem[]>([]);`
   - **Reason:** Twin files use entity-specific names (`programs`, `gyms`), not generic `items`

2. **Logging Inconsistency**
   - **Current:** `logger.info('Workout history loaded', { count: this.items.length });`
   - **Expected:** `logger.info('Workout history loaded', { items: $state.snapshot(this.items) });`
   - **Reason:** Twin files log the full snapshot for better debugging, not just the count

---

## Phase 4: Final Verdict

**[REJECT - INCONSISTENT]**

One file (`src/lib/models/workout-history-list.svelte.ts`) introduced minor structural debt with two deviations from established patterns:

1. Generic property naming (`items`) instead of entity-specific naming
2. Simplified logging (count only) instead of full snapshot logging

### Recommended Fixes

**File: `src/lib/models/workout-history-list.svelte.ts`**

```typescript
export class WorkoutHistoryListModel {
  // CHANGE: Rename 'items' to 'historyItems' for consistency
  historyItems = $state<Workout.HistoryItem[]>([]);
  isLoading = $state(true);
  errorMessage = $state('');

  constructor(private viewSvc: WorkoutHistoryViewService) {}

  async loadData() {
    logger.info('Loading workout history');
    this.isLoading = true;
    this.errorMessage = '';
    try {
      // CHANGE: Update reference
      this.historyItems = await this.viewSvc.getHistory();
      // CHANGE: Log full snapshot instead of just count
      logger.info('Workout history loaded', { historyItems: $state.snapshot(this.historyItems) });
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to load workout history';
      logger.error('Failed to load workout history', { error });
    } finally {
      this.isLoading = false;
    }
  }
}
```

**File: `src/routes/workout-history/+page.svelte`**

Update references to match the renamed property:

```svelte
{#each model.historyItems as item (item.id)}
  <!-- ... -->
{:else}
  <!-- ... -->
{/each}
```
