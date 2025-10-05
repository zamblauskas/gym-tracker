# Step 02: Local Persistence

## Overview

Implement local storage persistence so data survives page refreshes. Create a repository pattern with an interface that can later be swapped for Supabase.

## Requirements

- [x] Create repository interface pattern for data persistence
- [x] Implement LocalStorage-based repository
- [x] Handle Date serialization/deserialization
- [x] Integrate with existing state management
- [x] Data persists across page refreshes

## Implementation Status

### ✅ Completed Components

- [types.ts](../../apps/web/src/lib/repositories/types.ts) - Repository interface definition
- [localStorage.ts](../../apps/web/src/lib/repositories/localStorage.ts) - LocalStorage implementation
- [index.ts](../../apps/web/src/lib/repositories/index.ts) - Repository factory functions
- [usePersistedState.ts](../../apps/web/src/hooks/usePersistedState.ts) - Custom hook for persisted state

### ✅ Core Features

- **Repository Pattern**: Generic `IDataRepository<T>` interface for abstraction
- **LocalStorage Backend**: Concrete implementation using browser localStorage
- **Date Handling**: Automatic serialization/deserialization of Date objects
- **Type Safety**: Fully typed repository pattern with TypeScript generics
- **Factory Pattern**: Easy repository creation with factory functions

## Technical Notes

### Repository Interface

The `IDataRepository<T>` interface provides a clean abstraction:

```typescript
interface IDataRepository<T> {
  getAll(): Promise<T[]>
  getById(id: string): Promise<T | null>
  create(item: T): Promise<T>
  update(id: string, item: T): Promise<T>
  delete(id: string): Promise<void>
  clear(): Promise<void>
}
```

### LocalStorage Implementation

- **Storage Keys**: Uses namespaced keys with `gym-tracker:` prefix
  - `gym-tracker:exercise-types`
  - `gym-tracker:exercises`
  - `gym-tracker:routines`

- **Date Serialization**: Automatically converts Date objects to ISO strings for storage and back to Date objects on retrieval

- **Error Handling**: Gracefully handles localStorage errors and quota exceeded scenarios

### Custom Hook

The `usePersistedState` hook:
- Loads initial data from repository on component mount
- Automatically saves changes to repository when state updates
- Returns same API as `useState` for easy drop-in replacement

### Integration

Updated [App.tsx](../../apps/web/src/App.tsx:28-43) to use:
```typescript
const exerciseTypeRepo = useMemo(() => createExerciseTypeRepository(), [])
const [exerciseTypes, setExerciseTypes] = usePersistedState(exerciseTypeRepo)
```

## Future Migration Path

The repository pattern makes it easy to swap LocalStorage for Supabase:

1. Create `SupabaseRepository<T>` implementing `IDataRepository<T>`
2. Update factory functions in `repositories/index.ts`
3. No changes needed in App.tsx or components

The interface-based design ensures the migration will be seamless.

## Status

**✅ COMPLETED** - Local persistence is fully implemented and working. All data now persists across page refreshes using localStorage.
