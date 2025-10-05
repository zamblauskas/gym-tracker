# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A mobile web app for tracking gym progress built with:
- **Frontend**: React + Vite + TypeScript + Tailwind CSS v4
- **UI Components**: shadcn/ui + Framer Motion + Vaul
- **Data Persistence**: LocalStorage (via repository pattern, ready for Supabase migration)

## Project Architecture

### Domain Model

The app uses a hierarchical structure for organizing workouts:

1. **Exercise** - A specific movement with optional manufacturer/brand info
   - Example: "Incline Chest Press Machine (Insosportus)"
   - Includes: name, machine brand (optional), target rep range, target reps in reserve (optional)

2. **Exercise Type** - A category grouping similar exercises
   - Example: "Incline chest"
   - Exercises are assigned to exercise types

3. **Routine** - A collection of exercise types for a single workout session
   - Example: "Chest + Triceps" containing ["Incline chest", "Lateral raise", "Tricep extension"]

4. **Program** - A named collection of routines representing a workout program
   - Example: "My current workout" containing ["Chest + Triceps", "Back + Biceps + Delts", "Shoulders + Arms + Legs"]

### Planned Directory Structure

The project follows a monorepo structure (see `docs/project_structure.md`):

- **apps/web/** - Main React frontend application
  - `src/components/ui/` - shadcn/ui components (button, card, input, label, badge, textarea, ConfirmDialog, etc.)
  - `src/components/` - Domain-specific components (Breadcrumb, RoutineSelector, ExerciseSelector, workout components)
  - `src/pages/` - Route components (Home, ActiveWorkout, list/detail views for all entities)
  - `src/hooks/` - Custom hooks (usePersistedState for localStorage integration)
  - `src/lib/` - Utility functions (cn helper) and repositories (localStorage implementation)
  - `src/types/` - TypeScript types (Exercise, ExerciseType, Routine, Program, WorkoutSession, etc.)
  - `src/styles/` - Global CSS with Tailwind directives and CSS variables for theming

## UI/UX Guidelines

- **Component Library**: Uses shadcn/ui components with Tailwind CSS v4
- **Theming**: CSS variables defined in `globals.css` for consistent design tokens
- **Path Aliases**: Use `@/` prefix for imports (e.g., `@/components/ui/button`)
- **Animations**: Framer Motion for smooth transitions and micro-interactions
- **Mobile UI Patterns**: Vaul for bottom drawers (native mobile feel)
- **Design Tokens**: Leverages shadcn/ui's semantic color system (primary, secondary, muted, accent, destructive)

## Implementation Status

### ✅ Step 01: CRUD Views & Navigation (Completed)
- **Full CRUD operations** for all entities (Exercise Types, Exercises, Routines, Programs)
- **Hierarchical navigation**: Drill-down from Program → Routine → Exercise Type → Exercise
- **Breadcrumb navigation**: Clickable breadcrumbs with Home icon, reusable component
- **Enhanced card design**: Modern hover effects, colored icons, shadow animations
- **Bottom drawer pattern**: Vaul-based forms for create/edit operations
- **State management**: React useState in App.tsx with handler functions for all navigation flows
- **Cascade deletion**: Deleting exercise type removes exercises and updates routines; deleting routine updates programs

### ✅ Step 02: Local Persistence (Completed)
- **Repository pattern**: Generic `IDataRepository<T>` interface for data abstraction
- **LocalStorage implementation**: Concrete repository with namespaced keys (`gym-tracker:*`)
- **Date handling**: Automatic serialization/deserialization of Date objects
- **Custom hook**: `usePersistedState` hook for seamless state persistence
- **Migration ready**: Interface-based design allows easy swap to Supabase without component changes

### ✅ Step 03: Progress Tracking System (Completed)
- **Smart routine cycling**: Automatically determines next workout based on program cycle and last completed session
- **Skip workout functionality**: Skip button with confirmation dialog to move to next workout in cycle without logging exercises
- **Responsive home card**: Mobile-optimized layout with stacked buttons (full-width on mobile, horizontal on desktop)
- **Workout session flow**: Complete flow from start to finish with exercise selection, set logging, and notes
- **Bi-directional navigation**: Free navigation between exercises with Previous/Next buttons, state persistence per exercise type
- **Set logging**: Drawer-based form for weight, reps, and RIR (Reps In Reserve)
- **Auto-saving notes**: Debounced auto-save (500ms) for "notes for next time" with visual highlighting
- **Exercise history**: Shows last time specific exercise was performed (searches all sessions, not just last workout)
- **Session metrics**: Calculates and saves endTime, duration, and totalVolume on workout completion
- **Data persistence**: All workout sessions saved via repository pattern

### Key Technical Patterns
- **State Management**: `usePersistedState` hook wraps repository pattern for automatic persistence
- **Navigation Handlers**: Centralized in App.tsx (`handleSelectExerciseType`, `handleSelectRoutineFromProgram`, etc.)
- **Data Flow**: Repository → Hook → State → Components → Repository on updates
- **UX Patterns**: Gradient cards, progress bars, sticky notes UI, previous session history cards
