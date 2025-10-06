# CLAUDE.md

## Tech Stack
- React + Vite + TypeScript + Tailwind v4
- shadcn/ui + Framer Motion + Vaul (drawers)
- Supabase (auth + storage) or LocalStorage
- React Router v6

## Domain Model (Hierarchical)
- **Exercise**: Specific movement (name, machine brand, target reps, RIR)
- **Exercise Type**: Category grouping exercises (e.g., "Incline chest")
- **Routine**: Collection of exercise types (e.g., "Chest + Triceps")
- **Program**: Collection of routines in cycle order
- **Workout Session**: Logged workout with exercise logs, sets, notes, metrics

## Architecture
**Data Layer**:
- Repository pattern (`IDataRepository<T>`)
- LocalStorage or Supabase backend (env-based: `VITE_STORAGE_BACKEND`)
- Supabase: RLS-enforced, automatic user_id injection
- `usePersistedState` hook for persistence

**Routing** (React Router v6):
- URL-based navigation (`navigate()`, `useParams()`)
- Drawers controlled by URL patterns (e.g., `/routines/new`, `/routines/:id/edit`)
- Browser back closes drawers
- Route wrapper components fetch data from params

**State**:
- App.tsx holds all entity state
- Route wrappers compute props from URL params + state
- No back buttons—browser navigation + breadcrumbs only

**Key Patterns**:
- Cascade deletion (exercise type → exercises → routine refs)
- Smart routine cycling (tracks last completed workout in program cycle)
- Auto-save notes (500ms debounce)
- Exercise history lookup (searches all sessions for specific exercise)

## File Structure
```
apps/web/src/
├── components/ui/     # shadcn/ui (Button, Card, Drawer, ConfirmDialog, etc.)
├── components/        # Breadcrumb, RoutineSelector, ExerciseSelector
├── pages/             # Route components (Home, ActiveWorkout, *List, *Detail)
├── hooks/             # usePersistedState
├── lib/repositories/  # IDataRepository, LocalStorage, Supabase
├── types/             # Domain types
└── contexts/          # AuthContext
```

## Conventions
- Path aliases: `@/components/ui/button`
- CSS variables in globals.css
- Mobile-first (Vaul drawers, responsive layouts)
- No explicit back buttons (browser + breadcrumbs)
