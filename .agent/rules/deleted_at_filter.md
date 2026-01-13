---
trigger: model_decision
description: When working on Supabase queries
---

# deleted_at Filter Rules

## Core Principle

The key distinction is between **operational queries** and **historical/audit queries**:

- **Operational queries**: Used for current/active operations (e.g., listing available programs to start, selecting exercises for a workout). These should filter `deleted_at` on ALL tables.
- **Historical/audit queries**: Used for viewing completed/historical data (e.g., workout history, completed workout details). These should NOT filter `deleted_at` on entities that were captured at the time of the transaction.

## The Rules

### Rule 1: List Queries (`getEntities()`)

Always filter `deleted_at IS NULL`. Deleted entities should not appear in lists.

### Rule 2: Detail Queries (`getEntityById()`)

Do NOT filter `deleted_at` on the **main entity**. Return the entity even if deleted, because:

- User might be navigating from historical data (e.g., workout details → exercise type)
- User might have a bookmark/link to a deleted entity
- UI can show a "deleted" indicator if needed

Still filter `deleted_at` on **joined configuration entities** that are pure metadata.

### Rule 3: Historical/Audit Queries (e.g., Workout History, Completed Workouts)

When querying **historical data** (completed transactions, audit logs, etc.):
**Main transaction table:** Filter `deleted_at` only if you want to exclude cancelled/deleted transactions themselves

- Example: `WHERE status = 'completed' AND deleted_at IS NULL`
  **Entities captured by the transaction** (foreign keys stored at transaction time): DO NOT filter `deleted_at`
- Example: `routines`, `programs` (referenced by workout via `routine_id`)
- Example: `exercise_types`, `exercises` (referenced by workout_exercise via `exercise_type_id`, `exercise_id`)
- **Rationale**: These entities were part of the historical record. Filtering them would create "holes" in history.
  **Entities that are just current metadata/properties** (not captured as FKs): DO filter `deleted_at`
- Example: `gyms` joined through `exercise_gyms` (not captured in workout_exercises)
- **Rationale**: These are current attributes, not historical snapshots.
  **Key Question**:
  > "Was this entity's ID captured as a foreign key in the transaction record, or is it just current metadata fetched via another join?"
  > If captured as FK → Don't filter
  > If current metadata → Filter
