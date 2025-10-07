# CLAUDE.md

## Tech Stack
- React + Vite + TypeScript + Tailwind v4
- shadcn/ui + Framer Motion + Vaul (drawers)
- Supabase (auth + storage) or LocalStorage backend
- React Router v6 (URL-based navigation)

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
- Repository pattern (`IDataRepository<T>`) abstracts storage backend
- LocalStorage or Supabase backend (env-based: `VITE_STORAGE_BACKEND`)
- Supabase: RLS-enforced, automatic user_id injection
- Batch operations supported for multi-entity updates

### Routing & Drawer Management (React Router v6)
- **URL-based navigation**: All navigation uses `navigate()`, `useParams()`, `useSearchParams()`
- **Unified drawer system**: ALL drawers use URL query params for consistency
  - Entity CRUD drawers: `?drawer=createExerciseType&id=123` (handled by DrawerManager)
  - Transient drawers: `?drawer=setLogger&exerciseId=456` (rendered in-page, state from URL)
- **Smart back button UX**: Closing drawers uses `navigate(path, { replace: true })`
  - This replaces the drawer URL in history, preventing back button from reopening
  - Example flow: Home → Exercise Types → Add (opens) → Save (closes with replace) → Back → Home ✅
  - Without replace: Home → Exercise Types → Add → Save → Back → Add (reopens) ❌
- **DrawerManager**: Handles persistent entity CRUD drawers (create/edit ExerciseTypes, Routines, Programs)
- **In-page drawers**: Transient workflow drawers (SetLogger, ExerciseSelection) rendered within page component tree
  - State still comes from URL params, but drawer shell is local to component
  - Allows access to page-specific state and handlers
- **useDrawer hook**: Unified API for opening/closing any drawer with smart history management
- **AppRouter**: Defines all route configurations
- **Route wrapper pattern**: `RouteEntityWrapper` eliminates repetitive route setup
- **useNavigationHandlers** hook: Encapsulates navigation + entity operation combos
- **useRouteEntity** hook: Entity lookup + 404 redirects

### Component Architecture
- Pages are route components (Home, ActiveWorkout, *List, *Detail)
- Fully controlled components pattern (e.g., `WorkoutExerciseManager`)
- State lifted to parent (ActiveWorkout), children are pure presentational
- Custom hooks extract complex logic (e.g., `useExerciseHistory`, `useWorkoutLogic`)
- `RouteEntityWrapper` generic component for entity-based routes

### Active Workout Flow
- **Persistent active sessions**: In-progress workouts stored in repository, survive page refresh
- Active session derived from `workoutSessions.find(s => s.status === 'in-progress')`
- **Drawer state from URL**: SetLogger and ExerciseSelection drawers use URL params (`?drawer=setLogger`)
  - Drawer open/close modifies URL with `{ replace: true }` for good back button UX
  - URL is single source of truth for drawer visibility
  - Drawer components rendered locally in ActiveWorkout, state passed from URL
- Exercise selection stored in `session.exerciseSelections` (single source of truth)
- Navigate between exercise types with prev/next buttons
- Exercise logs created on-demand when sets/notes are added
- Notes sync via controlled state with debounced save on blur
- Previous session history fetched via `useExerciseHistory`
- Finish workout calculates `duration` and `totalVolume` via `finishWorkoutSession()`, sets status to `'completed'`
- Cancel workout deletes the in-progress session from repository
- Home page shows "Resume Workout" button when `activeSession` exists

### Key Patterns
- Cascade deletion (exercise type → exercises → routine refs → program refs)
- Smart routine cycling (tracks last completed workout in program cycle, ignores in-progress sessions)
- Auto-save notes with 500ms debounce (`NOTES_AUTOSAVE_DEBOUNCE_MS`)
- Exercise history lookup (searches all sessions for specific exercise)
- Deep equality checks for state change detection (`deepEqual()`)
- Logger utility for structured debugging (`logger.ts`)
- Data migration on first load (`WorkoutContext`) adds `status` field to legacy sessions

## File Structure
```
apps/web/src/
├── components/
│   ├── ui/                    # shadcn/ui components (Button, Card, Drawer, etc.)
│   ├── workout/               # Workout-specific components
│   ├── AppRouter.tsx          # Route definitions + route wrappers
│   ├── DrawerManager.tsx      # Drawer routing logic
│   ├── RouteEntityWrapper.tsx # Generic route wrapper component
│   ├── Breadcrumb.tsx         # Breadcrumb navigation
│   └── ErrorBoundary.tsx      # Error boundary wrapper
├── contexts/                  # React contexts for state management
│   ├── AppStateContext.tsx    # Coordinator context
│   ├── ExercisesContext.tsx   # Exercise + ExerciseType state
│   ├── RoutinesContext.tsx    # Routine state
│   ├── ProgramsContext.tsx    # Program state
│   ├── WorkoutContext.tsx     # Active workout session state
│   ├── ErrorContext.tsx       # Global error handling
│   └── AuthContext.tsx        # Supabase auth
├── hooks/                     # Custom React hooks
│   ├── usePersistedState.ts   # Repository persistence with delta tracking
│   ├── useDrawer.ts           # Unified drawer management with smart history
│   ├── useNavigationHandlers.ts # Navigation + entity operations
│   ├── useRouteEntity.ts      # Entity lookup + 404 redirect
│   ├── useWorkoutLogic.ts     # Next workout calculation
│   ├── useExerciseHistory.ts  # Previous session lookup
│   └── useEntityHandlers.ts   # Entity CRUD operations
├── lib/
│   ├── repositories/          # IDataRepository, LocalStorage, Supabase
│   ├── utils/                 # deepEqual, logger
│   ├── workoutCalculations.ts # Volume, duration calculations
│   ├── exerciseHistory.ts     # Exercise history queries
│   ├── entityFactory.ts       # Entity creation helpers
│   ├── constants.ts           # App constants (DRAWER_MODE, etc.)
│   └── config.ts              # Environment config
├── pages/                     # Route components (*List, *Detail, Active)
├── types/                     # TypeScript domain types
└── main.tsx                   # App entry point with context providers
```

## Conventions
- Path aliases: `@/` maps to `src/`
- CSS variables defined in globals.css
- Mobile-first design (Vaul drawers, responsive layouts)
- No explicit back buttons (browser back + breadcrumbs only)
- TypeScript strict mode enabled with `noUncheckedIndexedAccess`
- Drawer height: 96% of viewport (`DRAWER_HEIGHT_CLASS`)
- All entity types extend `{ id: string }`
- Date fields use native `Date` objects (serialized by repositories)
