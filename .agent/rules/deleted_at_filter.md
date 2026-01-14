---
trigger: model_decision
description: When working on Supabase queries
---

# deleted_at Filter Rules

## Core Principle

The key distinction is between **operational queries** and **historical/audit queries**:

- **Operational queries**: Used for current/active operations (e.g., listing available programs to start, selecting exercises for a workout). These should filter `deleted_at` on ALL tables.
- **Historical/audit queries**: Used for viewing completed/historical data (e.g., workout history, completed workout details). These should NOT filter `deleted_at` on entities that were captured at the time of the transaction.
