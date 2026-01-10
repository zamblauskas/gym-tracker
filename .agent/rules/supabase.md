---
trigger: model_decision
description: After adding a new Supabase migration
---

# Apply new migration

npx supabase migration up

# Generate types

npx supabase gen types typescript --local > src/lib/supabase/types.ts
