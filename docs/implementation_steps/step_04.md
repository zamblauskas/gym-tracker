# Step 04: Supabase + Google Sign in

## Overview

Add Supabase authentication with Google OAuth provider. Users can sign in with their Google account on the home page. Data persistence continues using localStorage (Supabase database migration will be implemented in a future step).

## Implementation Details

### 1. Supabase Setup
- **Package**: `@supabase/supabase-js` v2.58.0
- **Configuration**: Environment variables in `.env.local`
  - `VITE_SUPABASE_URL`: Your Supabase project URL
  - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- **Client**: Singleton instance in `src/lib/supabase.ts`

### 2. Authentication Context
- **File**: `src/contexts/AuthContext.tsx`
- **Provider**: `AuthProvider` component wrapping the entire app
- **Hook**: `useAuth()` for accessing authentication state
- **State**:
  - `user`: Current authenticated user (or null)
  - `session`: Current session (or null)
  - `loading`: Authentication initialization state
- **Methods**:
  - `signInWithGoogle()`: Initiates Google OAuth flow
  - `signOut()`: Signs out the current user

### 3. UI Integration
- **Location**: Home page (`src/pages/Home.tsx`)
- **When not authenticated**:
  - "Sign in with Google" button (gradient blue-to-purple, with Google icon)
- **When authenticated**:
  - Clickable user avatar (profile picture from Google) in header
  - Bottom drawer (using Vaul) triggered by avatar click
  - Drawer displays: large avatar, user name, email, and sign-out button
- **Layout**: Header section with flex layout, auth controls in top-right
- **Drawer pattern**: Reuses existing Vaul drawer pattern for consistency

### 4. OAuth Flow
- **Provider**: Google
- **Redirect**: Returns to application origin (`window.location.origin`)
- **Session Persistence**: Handled automatically by Supabase client
- **State Management**: `onAuthStateChange` listener updates React state

### 5. Configuration Notes

#### Supabase Project Setup
Before using authentication, configure your Supabase project:
1. Create a project at https://app.supabase.com
2. Navigate to Authentication > Providers
3. Enable Google provider
4. Add OAuth credentials from Google Cloud Console
5. Configure authorized redirect URIs

#### Environment Variables
Copy `.env.local` and update with your credentials:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 6. Data Persistence
- **Current**: LocalStorage (unchanged from Step 02)
- **Future**: Will migrate to Supabase database in next step
- **Scope**: All user data currently stored client-side without user filtering

## Files Modified

### Created
- `apps/web/.env.local` - Environment configuration for Supabase
- `apps/web/src/lib/supabase.ts` - Supabase client singleton
- `apps/web/src/contexts/AuthContext.tsx` - Authentication context and provider

### Modified
- `apps/web/package.json` - Added `@supabase/supabase-js` dependency
- `apps/web/vite.config.ts` - Added environment variable exposure
- `apps/web/src/main.tsx` - Wrapped app with `AuthProvider`
- `apps/web/src/pages/Home.tsx` - Added sign-in UI and user display

## Technical Patterns

### Authentication State Management
```typescript
const { user, session, loading, signInWithGoogle, signOut } = useAuth()
```

### Conditional Rendering
- Show sign-in when `!user`
- Show user info and sign-out when `user` exists
- Hide auth UI during `loading` state

### Error Handling
- Console logging for sign-in/sign-out errors
- Graceful fallback if Supabase credentials missing (warning in console)
