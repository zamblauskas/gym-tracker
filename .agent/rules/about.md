---
trigger: always_on
---

# Gym Tracker 2.0 Documentation

## Overview

A web application for tracking gym workouts with programs, routines, and exercises.

## Features

1. **Programs & Routines**
   - Program: collection of routines (e.g., "Strength Training")
   - Routine: set of exercise types to complete in one gym session
   - Each exercise type can have multiple exercises (variations/machines)

2. **Workout Tracking**
   - Start a routine to create a workout session
   - Select one exercise per exercise type
   - Log sets with reps, weight, and RIR (Reps in Reserve)
   - View exercise history from past workouts
   - Complete or cancel workout

3. **Home Page**
   - View in-progress workouts with progress and elapsed time
   - See next routine for each program (auto-determined based on last completed)

## Tech Stack

| Category  | Technology                            |
| --------- | ------------------------------------- |
| Framework | SvelteKit ^2.47, Svelte ^5.41 (runes) |
| Language  | TypeScript ^5.9 (strict mode)         |
| Styling   | Tailwind CSS ^4.1 + shadcn-svelte     |
| Icons     | lucide-svelte                         |
| Backend   | Supabase (PostgreSQL)                 |
| Testing   | Vitest ^4.0                           |

## Commands

```bash
npm run test          # Run check + tests
npm run lint          # ESLint
```

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── ui/              # shadcn-svelte components
│   │   ├── ExerciseHistory.svelte
│   │   └── ExerciseSelector.svelte
│   ├── models/              # UI state management (*.svelte.ts)
│   ├── services/            # Data access layer
│   ├── supabase/
│   │   ├── client.ts        # Supabase client + insert/update types
│   │   └── types.ts         # Generated database types
│   ├── types/
│   │   ├── commands/        # Input types for mutations
│   │   └── views/           # Output types for queries
│   ├── utils/
│   │   └── time-ago.ts      # Human-readable timestamps
│   ├── context.ts           # Service container definition
│   ├── logger.ts            # Custom logger
│   └── utils.ts             # Tailwind utilities (cn)
├── routes/
│   ├── +layout.svelte       # Root layout, service initialization
│   ├── +page.svelte         # Home page
│   ├── exercise-types/
│   ├── exercises/
│   ├── programs/
│   ├── routines/
│   └── workouts/
└── supabase/
    └── migrations/          # Database migrations
```

## Architecture

### CQRS-Lite Pattern

Separates read (queries) and write (commands) operations:

```
Page → Model → ViewService (reads)
           └→ CommandService (writes)
```

**Services** (`src/lib/services/`):

- `XViewService` - builds enriched read models from database
- `XCommandService` - handles mutations (create, update, delete)

**Models** (`src/lib/models/*.svelte.ts`):

- Hold reactive view state using `$state`
- Derive computed properties using `$derived`
- Call command services for mutations
- Reload view after commands to reflect changes
- Handle loading/error states

**Example flow:**

```
WorkoutDetailPage
  └→ WorkoutDetailModel
       ├→ WorkoutViewService.getWorkoutDetail()
       └→ WorkoutCommandService.addSet()
```

### Type Conventions

**Command types** (`src/lib/types/commands/`):

- Namespace pattern: `Exercise.Create`, `Exercise.Update`
- ID passed separately from input object

**View types** (`src/lib/types/views/`):

- Namespace pattern: `Workout.Detail`, `Workout.Compact`
- Flattened, UI-ready structures

### Service Patterns

**CommandService:**

- Depends only on `SupabaseClient<Database>`
- Domain-oriented methods: `completeWorkout(id)` not `updateWorkout(id, status)`
- Returns `Promise<void>` or `Promise<string>` (ID for creates)
- Throws on error
- Uses `| null` for optional fields, not `?`
- Maps to Supabase insert/update types from `client.ts`

**ViewService:**

- Always check `deleted_at` on main table and joined tables
- Use `!inner` on mandatory joins (e.g., workout → routine → program)
- Optional joins without `!inner` (e.g., workout_exercise → exercise)

**Relational tables:**

- `routine_exercise_types` uses hard delete (no `deleted_at`)

### Logging

Import: `import { logger } from '$lib/logger'`

Pattern:

```typescript
logger.info('Updating routine', { routineId, input });
// ... operation
logger.info('Routine updated', { routineId });
// ... after reload
logger.info('Routine data loaded', { view: $state.snapshot(this.view) });
```

### Svelte 5 Runes

- `$state<T>(initial)` - reactive state
- `$derived(expression)` - computed values
- `$state.snapshot(value)` - get plain object for logging

## Database Schema

Key tables:

- `programs` - training programs
- `routines` - belong to programs, have exercise types
- `exercise_types` - categories (e.g., "Chest", "Biceps")
- `exercises` - specific exercises, belong to exercise types
- `routine_exercise_types` - junction table (hard delete)
- `workouts` - workout sessions, belong to routines
- `workout_exercises` - exercises in a workout
- `workout_sets` - sets logged during workout

All entities have `created_at`, `updated_at`, `deleted_at` (soft delete).
