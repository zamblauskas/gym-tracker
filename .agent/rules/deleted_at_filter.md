---
trigger: model_decision
description: When working on Supabase queries
---

# deleted_at Filter Rules

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
