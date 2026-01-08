# deleted_at Filter Rules Investigation

## The Rules

### Rule 1: List Queries (`getEntities()`)

Always filter `deleted_at IS NULL`. Deleted entities should not appear in lists.

### Rule 2: Detail Queries (`getEntityById()`)

Do NOT filter `deleted_at` on the **main entity**. Return the entity even if deleted, because:

- User might be navigating from historical data (e.g., workout details → exercise type)
- User might have a bookmark/link to a deleted entity
- UI can show a "deleted" indicator if needed

Still filter `deleted_at` on **joined configuration entities** that are pure metadata.

### Rule 3: Transaction Data (Workouts)

For entities directly referenced by the transaction (captured foreign keys):

- `exercise_type_id`, `exercise_id` → Don't filter `deleted_at` (historical reference)

For entities that are just metadata/properties of referenced entities:

- `gyms` (property of exercise, not captured in workout) → Filter `deleted_at`

### Key Question

> "Was this entity's ID captured in the transaction, or is it just metadata of a captured entity?"

---

## Query Analysis

### `gym-view.service.ts`

| Method         | Current            | Expected              | Status       |
| -------------- | ------------------ | --------------------- | ------------ |
| `listGyms()`   | Filters deleted_at | Filter deleted_at     | ✅ CORRECT   |
| `getGymById()` | Filters deleted_at | Don't filter (Rule 2) | ❌ NEEDS FIX |

### `program-view.service.ts`

| Method                   | Current                       | Expected                           | Status       |
| ------------------------ | ----------------------------- | ---------------------------------- | ------------ |
| `listPrograms()`         | Filters programs and routines | Filter both                        | ✅ CORRECT   |
| `getProgramDetailById()` | Filters programs and routines | Don't filter main, filter routines | ❌ NEEDS FIX |

### `routine-view.service.ts`

| Method                      | Current                       | Expected                 | Status       |
| --------------------------- | ----------------------------- | ------------------------ | ------------ |
| `getRoutineDetailById()`    | Filters deleted_at            | Don't filter main entity | ❌ NEEDS FIX |
| `getNextRoutineByProgram()` | Filters via getPrograms()     | Filter (list context)    | ✅ CORRECT   |
| `getPrograms()`             | Filters programs and routines | Filter (list context)    | ✅ CORRECT   |
| `getLastWorkout()`          | Filters workouts and routines | Filter (finding latest)  | ✅ CORRECT   |

### `exercise-type-view.service.ts`

| Method                        | Current                         | Expected                                   | Status       |
| ----------------------------- | ------------------------------- | ------------------------------------------ | ------------ |
| `listExerciseTypes()`         | Filters deleted_at              | Filter (list)                              | ✅ CORRECT   |
| `getExerciseTypeDetailById()` | Filters main + exercises + gyms | Don't filter main, filter exercises + gyms | ❌ NEEDS FIX |

### `exercise-view.service.ts`

| Method                    | Current                              | Expected                       | Status       |
| ------------------------- | ------------------------------------ | ------------------------------ | ------------ |
| `getExerciseDetailById()` | Filters main + exercise_types + gyms | Don't filter main, filter gyms | ❌ NEEDS FIX |
| `getExercisesByType()`    | Filters exercises + gyms             | Filter (list)                  | ✅ CORRECT   |

**Note on `getExerciseDetailById()`:** The joined `exercise_types` is the parent of the exercise - if we're viewing a deleted exercise, we still want to see its (potentially deleted) exercise type for context.

### `workout-view.service.ts`

| Method                      | Current                                                                      | Expected                                                                           | Status                             |
| --------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------- |
| `getWorkoutDetail()`        | Previously filtered exercise_types, exercises, gyms. Now doesn't filter any. | Don't filter exercise_types + exercises (captured refs), DO filter gyms (metadata) | ❌ NEEDS FIX - missing gyms filter |
| `getInProgressWorkouts()`   | Filters all transaction data                                                 | Filter all                                                                         | ✅ CORRECT                         |
| `getExerciseHistory()`      | Previously filtered exercises. Now doesn't.                                  | Don't filter (captured ref)                                                        | ✅ CORRECT                         |
| `getWorkoutExerciseCount()` | Filters workout_exercises                                                    | Filter (transaction records)                                                       | ✅ CORRECT                         |

---

## Summary of Required Changes

| Service            | Method                    | Change Needed                                              |
| ------------------ | ------------------------- | ---------------------------------------------------------- |
| gym-view           | getGymById                | Remove deleted_at filter on main entity                    |
| program-view       | getProgramDetailById      | Remove deleted_at filter on main entity                    |
| routine-view       | getRoutineDetailById      | Remove deleted_at filter on main entity                    |
| exercise-type-view | getExerciseTypeDetailById | Remove deleted_at filter on main entity                    |
| exercise-view      | getExerciseDetailById     | Remove deleted_at filter on main entity and exercise_types |
| workout-view       | getWorkoutDetail          | Add back gyms.deleted_at filter                            |

---

## About.md Section

Add this section to document the pattern:

```markdown
### Soft Delete Filtering Rules

**Rule 1: List Queries (`getEntities()`)**

- Always filter `deleted_at IS NULL`
- Deleted entities should not appear in lists

**Rule 2: Detail Queries (`getEntityById()`)**

- Do NOT filter `deleted_at` on the main entity
- Return even deleted entities (user may navigate from historical data)
- Still filter `deleted_at` on joined metadata entities

**Rule 3: Transaction Data (Workouts)**

- Entities with captured foreign keys (exercise_type_id, exercise_id): Don't filter
- Metadata of captured entities (gyms): Filter

Key question: "Was this entity's ID captured in the transaction?"
```
