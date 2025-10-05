# Supabase Database Migrations

This directory contains the SQL migration file for the Gym Tracker database schema.

## Migration

### `initial_schema.sql` - Production-Ready Database Setup

This is a **complete, production-grade migration** that creates:

**Tables** (all with user_id for multi-tenant isolation):
- `exercise_types` - User-scoped exercise type definitions
- `exercises` - User-scoped exercises linked to exercise types
- `routines` - User-scoped routines with JSONB exercise type arrays
- `programs` - User-scoped programs with JSONB routine arrays
- `workout_sessions` - User-scoped workout sessions with JSONB exercise logs

**Security Features**:
- ✅ **user_id UUID NOT NULL** on all tables (FK to auth.users)
- ✅ **Row Level Security (RLS)** enabled on all tables
- ✅ **4 policies per table** (SELECT, INSERT, UPDATE, DELETE)
- ✅ **auth.uid() = user_id** validation on every operation
- ✅ **CASCADE DELETE** - User deletion removes all their data

**Performance Features**:
- UUID primary keys with auto-generation
- B-tree indexes on user_id for fast filtering
- GIN indexes on JSONB fields
- Composite indexes for common queries
- Automatic updated_at triggers

## How to Run Migrations

### Option 1: Supabase Dashboard (Recommended for First Time)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `initial_schema.sql`
4. Click **Run** to execute

### Option 2: Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## Row Level Security (RLS)

All tables have **production-grade RLS policies** that ensure:
- ✅ Users can only SELECT their own data (`auth.uid() = user_id`)
- ✅ Users can only INSERT data with their own user_id
- ✅ Users can only UPDATE/DELETE their own data
- ✅ Database-level enforcement (defense in depth)

## Multi-Tenant Architecture

This is a **multi-tenant SaaS architecture**:
- Each authenticated user has completely isolated data
- User data is scoped by `user_id` foreign key to `auth.users(id)`
- Deleting a user automatically cascades to delete all their data
- Perfect for production applications with multiple users

## Verifying RLS Policies

After running migrations, verify RLS is enabled:

```sql
-- Check if RLS is enabled on all tables
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('exercise_types', 'exercises', 'routines', 'programs', 'workout_sessions');

-- View all RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public';
```

All tables should have `rowsecurity = true` and multiple policies per table.

## Security Notes

⚠️ **IMPORTANT**: Never disable RLS on production tables
⚠️ **IMPORTANT**: Always test RLS policies with different user accounts
✅ **VERIFIED**: This schema follows Supabase security best practices
✅ **PRODUCTION-READY**: Enterprise-grade multi-tenant isolation
