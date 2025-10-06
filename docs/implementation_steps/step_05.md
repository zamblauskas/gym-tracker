# Step 05: Supabase Persistence with RLS

## Summary
Production-grade Supabase database with Row Level Security (RLS) for multi-tenant data isolation. Config system switches between LocalStorage and Supabase.

## Database Schema
- Tables: `exercise_types`, `exercises`, `routines`, `programs`, `workout_sessions`
- All tables: `user_id UUID NOT NULL REFERENCES auth.users(id)`
- RLS policies: 4 per table (SELECT, INSERT, UPDATE, DELETE) enforcing `auth.uid() = user_id`
- UUIDs, timestamps (created_at, updated_at), JSONB arrays, indexes (B-tree on user_id, GIN on JSONB)

## Supabase Repository
- Implements `IDataRepository<T>` interface
- Automatic `user_id` injection on INSERT
- Authentication validation (`getCurrentUserId()` throws if unauthenticated)
- camelCase ↔ snake_case conversion
- Date serialization/deserialization

## Configuration
- `lib/config.ts` checks `VITE_STORAGE_BACKEND` (default: `'localStorage'` | `'supabase'`)
- Repository factories return appropriate implementation
- Zero code changes in components

## Environment Variables
- `VITE_STORAGE_BACKEND` (optional, defaults to localStorage)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Security
- Multi-tenant isolation (PostgreSQL RLS enforces user data separation)
- Defense in depth (app + database level)
- CASCADE DELETE on user removal

## Status
✅ Completed
