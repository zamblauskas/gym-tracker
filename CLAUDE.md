# CLAUDE.md

## Tech Stack
- **Frontend**: React 19.2 + TypeScript 5.9 + Vite 7.1
- **Styling**: Tailwind CSS v4 + Framer Motion 12.23 + shadcn/ui components
- **UI Components**: Vaul (drawers), Radix UI (primitives), Lucide React (icons)
- **Routing**: React Router v7 (URL-based navigation)
- **Data Layer**: Supabase (auth + storage) or LocalStorage backend
- **Validation**: Zod 4.1
- **State**: React Context API (no external state management library)

## Domain Model (Hierarchical)
- **Exercise Type**: Category grouping exercises (e.g., "Incline Chest Press")
- **Exercise**: Specific movement variation (name, machine brand, target reps, RIR)
- **Routine**: Collection of exercise types (e.g., "Chest + Triceps")
- **Program**: Collection of routines in cycle order
- **Workout Session**: Logged workout with exercise logs, sets, notes, metrics
  - Contains `exerciseSelections` (map of exercise type index → selected exercise ID)
  - Tracks `startTime`, `endTime`, `duration`, `totalVolume`
  - Has `status`: `'in-progress'` | `'completed'` | `'skipped'`

## Architecture

### State Management
- Domain-specific React contexts: `ExercisesContext`, `RoutinesContext`, `ProgramsContext`, `WorkoutContext`
- `AppStateContext` coordinates all domain contexts, provides unified API
- `usePersistedState` hook syncs state with repository (localStorage/Supabase)
- Delta tracking for optimized saves (tracks adds, updates, deletes)
- Optimistic UI updates with automatic rollback on errors
- `ErrorContext` and `Toast` for global error handling

### Data Layer
- Repository pattern (`*Repository` interfaces) abstracts storage backend
- LocalStorage or Supabase backend (env-based: `VITE_STORAGE_BACKEND`)
- **Supabase Implementation**:
  - RLS-enforced (all policies check `auth.uid() = user_id`)
  - Automatic `user_id` injection on create
  - Date serialization (Date ↔ ISO 8601 strings)
  - Soft deletes via `deleted_at` timestamp
  - Auto-updated `updated_at` via database trigger
  - Tables: `exercise_types` with indexes on `user_id`, `created_at`, `deleted_at`
- **LocalStorage Implementation**:
  - Single-user mode (no authentication)
  - JSON serialization with Map-based storage
  - Consistent API with Supabase implementation
  - Storage key pattern: `gym-tracker:*`
- Batch operations supported for multi-entity updates

### Component Architecture
- Pages are route components (Home, ActiveWorkout, *List, *Detail)
- Fully controlled components pattern (e.g., `WorkoutExerciseManager`)
- State lifted to parent (ActiveWorkout), children are pure presentational
- Custom hooks extract complex logic (e.g., `useExerciseHistory`, `useWorkoutLogic`)
- `RouteEntityWrapper` generic component for entity-based routes

## Conventions

### Code Style
- **Path aliases**: `@/` maps to `src/`
- **TypeScript**: Strict mode enabled with `noUncheckedIndexedAccess`
- **Date handling**: Native `Date` objects (serialized by repositories)
- **ID generation**: `crypto.randomUUID()` for all entity IDs

### UI/UX
- **Mobile-first**: Vaul drawers, responsive Tailwind layouts
- **No back buttons**: Browser back button only (no explicit back buttons in UI)
- **Drawer height**: 96% of viewport (`DRAWER_HEIGHT_CLASS` constant)
- **CSS variables**: Defined in `globals.css` using HSL format (`hsl(var(--color-*))`)
- **Animations**: Framer Motion for page transitions and component animations
- **Loading states**: Skeleton components for initial data loading

### Navigation
- **URL as state**: Drawer state, exercise index, all in URL (no React state for navigation)
- **History management**: Always use `replace: true` for drawers to prevent history pollution

### Data Management
- **Repository pattern**: All data access through `*Repository` interface
- **Optimistic updates**: UI updates immediately, rollback on error
- **Delta tracking**: Only save changed entities (add/update/delete detection)
- **Deep equality**: Use `deepEqual()` to detect actual changes before saves
