# Step 04: Supabase + Google Sign In

## Summary
Google OAuth authentication via Supabase. User profile display in header with sign-out drawer. Data still uses LocalStorage (Supabase DB in Step 05).

## Key Components
- `@supabase/supabase-js` client (singleton in `lib/supabase.ts`)
- `AuthContext` with `useAuth()` hook (user, session, loading, signInWithGoogle, signOut)
- UI: Sign-in button when unauthenticated, avatar + drawer when authenticated
- Session persistence via `onAuthStateChange` listener

## Environment Variables
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Status
✅ Completed
