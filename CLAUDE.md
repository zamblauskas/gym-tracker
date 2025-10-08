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
- Repository pattern (`IDataRepository<T>`) abstracts storage backend
- LocalStorage or Supabase backend (env-based: `VITE_STORAGE_BACKEND`)
- Supabase: RLS-enforced, automatic user_id injection
- Batch operations supported for multi-entity updates

### Routing & Drawer Management (React Router v6)
- **URL-based navigation**: All navigation uses `navigate()`, `useParams()`, `useSearchParams()`
- **Unified drawer system**: ALL drawers use URL query params for consistency
  - Entity CRUD drawers: `?drawer=createExerciseType&id=123` (handled by DrawerManager)
  - Transient drawers: `?drawer=setLogger&exerciseId=456` (rendered in-page, state from URL)
- **Smart back button UX**: Opening drawers uses `navigate(url, { replace: true })`
  - This replaces the current history entry, preventing history pollution
  - Closing drawers also uses `navigate(path, { replace: true })`
  - Result: Drawers never create new history entries, back button navigates to previous page
  - Example: Page A → Open Drawer (replace) → Close (replace) → Back → Previous Page ✅
- **DrawerManager**: Handles persistent entity CRUD drawers (create/edit ExerciseTypes, Routines, Programs, AddExerciseTypeToRoutine)
  - Renders drawer shell based on `?drawer=` query param
  - Provides `closeDrawer()` to child components for navigation
- **In-page drawers**: Transient workflow drawers (SetLogger, ExerciseSelection) rendered within ActiveWorkout page
  - State still comes from URL params, but drawer shell is local to component
  - Allows access to page-specific state and handlers
- **useDrawer hook**: Unified API for opening/closing any drawer with smart history management
  - `openDrawer(mode, params)`: Opens drawer with replace: true
  - `closeDrawer()`: Closes drawer with replace: true
  - Returns: `{ isOpen, drawerMode, drawerParams, openDrawer, closeDrawer }`
- **AppRouter**: Defines all route configurations and route wrapper components
  - Route wrappers (e.g., `ExerciseTypeDetailRoute`) use `RouteEntityWrapper` for entity lookup
- **useNavigationHandlers** hook: Encapsulates navigation + entity operation combos
  - Wraps entity operations (create/edit/delete) with appropriate navigation
  - Navigation happens after successful entity operation or on cancel
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
- **URL-based exercise navigation**: Current exercise index stored in URL path (`/workout/active/:exerciseIndex`)
  - Navigate between exercises using prev/next buttons
  - Invalid index redirects to `/workout/active/0` with replace: true
- **Drawer state from URL**: SetLogger and ExerciseSelection drawers use URL params (`?drawer=setLogger&exerciseId=123`)
  - Drawer open/close modifies URL with `{ replace: true }` for good back button UX
  - URL is single source of truth for drawer visibility
  - Drawer components rendered locally in ActiveWorkout, state passed from URL
- Exercise selection stored in `session.exerciseSelections` (single source of truth)
- Exercise logs created on-demand when sets/notes are added
- Notes sync via controlled state with immediate save on blur (no debounce in current implementation)
- Previous session history fetched via `useExerciseHistory`
- Finish workout calculates `duration` and `totalVolume` via `finishWorkoutSession()`, sets status to `'completed'`
- Cancel workout deletes the in-progress session from repository
- Home page shows "Resume Workout" button when `activeSession` exists
- Confirmation dialogs for cancel/finish actions (ConfirmDialog component)

### Key Patterns
- **Cascade deletion**: exercise type → exercises → routine refs → program refs
- **Smart routine cycling**: tracks last completed workout in program cycle, ignores in-progress sessions
- **Exercise history lookup**: searches all sessions for specific exercise (`useExerciseHistory`)
- **Deep equality checks**: state change detection using `deepEqual()` in `usePersistedState`
- **Delta tracking**: optimizes repository saves by detecting adds, updates, deletes
- **Optimistic UI**: state updates immediately, rollback on repository errors
- **Queued saves**: if save in progress, queue next save to prevent race conditions
- **Logger utility**: structured debugging via `logger.ts`
- **Data migration**: `WorkoutContext` adds `status` field to legacy sessions on first load
- **Controlled components**: all form inputs fully controlled with React state
- **Error boundaries**: `ErrorBoundary` wraps app, `ErrorContext` for global error handling

## File Structure
```
apps/web/src/
├── components/
│   ├── ui/                          # shadcn/ui components (Button, Card, ConfirmDialog, Toast, etc.)
│   ├── workout/                     # Workout-specific components
│   │   ├── ActiveWorkoutHeader.tsx  # Header with navigation
│   │   ├── WorkoutExerciseManager.tsx # Main workout UI (controlled)
│   │   ├── ExerciseCard.tsx         # Exercise display
│   │   ├── SetLoggerDrawer.tsx      # Set logging drawer content
│   │   ├── ExerciseSelectionDrawer.tsx # Exercise selection drawer content
│   │   ├── ExerciseNotes.tsx        # Notes textarea
│   │   ├── PreviousSessionHistory.tsx # History display
│   │   └── WorkoutActions.tsx       # Cancel/Finish buttons
│   ├── AppRouter.tsx                # Route definitions + route wrappers
│   ├── DrawerManager.tsx            # Drawer routing logic (entity CRUD)
│   ├── RouteEntityWrapper.tsx       # Generic route wrapper component
│   ├── ErrorBoundary.tsx            # Error boundary wrapper
│   ├── LoadingSkeletons.tsx         # Skeleton loading states
│   ├── ExerciseForm.tsx             # Reusable exercise form
│   ├── ExerciseTypeSelector.tsx     # Exercise type picker
│   └── RoutineSelector.tsx          # Routine picker
├── contexts/                        # React contexts for state management
│   ├── AppStateContext.tsx          # Coordinator context (combines all contexts)
│   ├── ExercisesContext.tsx         # Exercise + ExerciseType state
│   ├── RoutinesContext.tsx          # Routine state
│   ├── ProgramsContext.tsx          # Program state
│   ├── WorkoutContext.tsx           # Workout session state + activeSession logic
│   ├── ErrorContext.tsx             # Global error handling + toast
│   └── AuthContext.tsx              # Supabase auth
├── hooks/                           # Custom React hooks
│   ├── usePersistedState.ts         # Repository persistence with delta tracking
│   ├── useDrawer.ts                 # Unified drawer management with smart history
│   ├── useNavigationHandlers.ts     # Navigation + entity operations
│   ├── useRouteEntity.ts            # Entity lookup + 404 redirect
│   ├── useWorkoutLogic.ts           # Next workout calculation
│   ├── useExerciseHistory.ts        # Previous session lookup
│   ├── useEntityHandlers.ts         # Entity CRUD operations
│   ├── useAutoSaveNotes.ts          # Notes auto-save logic
│   └── useExercisesByType.ts        # Filter exercises by type
├── lib/
│   ├── repositories/                # Data layer
│   │   ├── types.ts                 # IDataRepository interface
│   │   ├── localStorage.ts          # LocalStorage implementation
│   │   ├── supabase.ts              # Supabase implementation
│   │   └── index.ts                 # Repository factory
│   ├── utils/                       # Utilities
│   │   ├── deepEqual.ts             # Deep equality check
│   │   └── logger.ts                # Structured logging
│   ├── validation/                  # Zod schemas
│   │   └── schemas.ts               # Validation schemas
│   ├── workoutCalculations.ts       # Volume, duration calculations
│   ├── exerciseHistory.ts           # Exercise history queries
│   ├── entityFactory.ts             # Entity creation helpers
│   ├── constants.ts                 # App constants (DRAWER_MODE, DRAWER_HEIGHT_CLASS, etc.)
│   ├── config.ts                    # Environment config
│   └── supabase.ts                  # Supabase client setup
├── pages/                           # Route components
│   ├── Home.tsx                     # Home page with start/resume workout
│   ├── ActiveWorkout.tsx            # Active workout page
│   ├── ExerciseTypeList.tsx         # Exercise types list
│   ├── ExerciseList.tsx             # Exercises for a type
│   ├── ExerciseDetail.tsx           # Exercise edit/delete page
│   ├── RoutineList.tsx              # Routines list
│   ├── RoutineDetail.tsx            # Routine detail
│   ├── ProgramList.tsx              # Programs list
│   ├── ProgramDetail.tsx            # Program detail
│   ├── CreateExerciseType.tsx       # Create exercise type form
│   ├── EditExerciseType.tsx         # Edit exercise type form
│   ├── CreateExercise.tsx           # Create exercise form
│   ├── CreateRoutine.tsx            # Create routine form
│   ├── EditRoutine.tsx              # Edit routine form
│   ├── CreateProgram.tsx            # Create program form
│   └── EditProgram.tsx              # Edit program form
├── styles/
│   └── globals.css                  # Tailwind + CSS variables
├── types/                           # TypeScript domain types
│   ├── exerciseType.ts              # ExerciseType
│   ├── exercise.ts                  # Exercise, CreateExerciseInput
│   ├── routine.ts                   # Routine, CreateRoutineInput
│   ├── program.ts                   # Program, CreateProgramInput
│   └── workoutSession.ts            # WorkoutSession, ExerciseLog, SetLog
├── App.tsx                          # Main app component
└── main.tsx                         # Entry point with context providers
```

## Conventions

### Code Style
- **Path aliases**: `@/` maps to `src/`
- **TypeScript**: Strict mode enabled with `noUncheckedIndexedAccess`
- **Entity types**: All extend `{ id: string }` base interface
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
- **Repository pattern**: All data access through `IDataRepository<T>` interface
- **Optimistic updates**: UI updates immediately, rollback on error
- **Delta tracking**: Only save changed entities (add/update/delete detection)
- **Deep equality**: Use `deepEqual()` to detect actual changes before saves

## Important Implementation Details

### Drawer System
- **Two types of drawers**:
  1. **Persistent drawers** (DrawerManager): Entity CRUD operations that need to persist across navigations
  2. **In-page drawers** (ActiveWorkout): Transient actions tied to specific page state
- **Drawer modes** defined in `DRAWER_MODE` constant (constants.ts):
  - CREATE_EXERCISE_TYPE, EDIT_EXERCISE_TYPE
  - CREATE_EXERCISE, CREATE_ROUTINE, EDIT_ROUTINE
  - CREATE_PROGRAM, EDIT_PROGRAM
  - ADD_EXERCISE_TYPE_TO_ROUTINE
  - SET_LOGGER, EXERCISE_SELECTION (in-page only)
- **Always use `{ replace: true }` when opening/closing drawers** to prevent back button issues

### Active Workout Session Management
- **Single active session**: Only one workout can have `status: 'in-progress'` at a time
- **Exercise index in URL**: `/workout/active/:exerciseIndex` (0-based)
- **Exercise selection persistence**: Stored in `session.exerciseSelections` (Record<number, string>)
- **Lazy exercise log creation**: ExerciseLog only created when first set added or notes entered
- **Finish workflow**: Calculates `duration` (minutes) and `totalVolume` (kg) before marking completed

### Context Architecture
- **AppStateContext**: Combines all domain contexts, provides unified API to components
- **Individual contexts**: Each manages its own domain (Exercises, Routines, Programs, Workouts)
- **usePersistedState**: All contexts use this hook for repository sync
- **Error handling**: ErrorContext wraps all operations, shows toast on errors
