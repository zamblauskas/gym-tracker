---
trigger: glob
globs: src/**/*.ts
---

## TypeScript

Strict mode is enabled. See `tsconfig.json` for all flags.

### Key Compiler Options

- `strict: true` - all strict checks enabled
- `noUncheckedIndexedAccess: true` - array access returns `T | undefined`
- `exactOptionalPropertyTypes: true` - `undefined` must be explicit
- `verbatimModuleSyntax: true` - requires `import type` for types
- `noUnusedLocals` / `noUnusedParameters` - no dead code

### Code Style

**Imports:**

- Use `import type` for type-only imports (required by `verbatimModuleSyntax`)
- Namespace imports for view/command types: `import * as Workout from '$lib/types/views/workout'`

**Nullability:**

- Use `| null` for optional fields, not `?` (e.g., `machineBrand: string | null`)
- Handle `T | undefined` from array access due to `noUncheckedIndexedAccess`

**Type assertions:**

- Use specific casts to Supabase types: `as Database['public']['Tables']['workouts']['Insert']`
- Avoid `as any` - find proper types instead

**Error handling:**

- Throw `Error` with descriptive messages in services
- Catch and set `errorMessage` state in models

**Generics:**

- Use generic types for reusable patterns: `Range<T>` with `min: T | null`, `max: T | null`
