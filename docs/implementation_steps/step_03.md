# Step 03: Progress Tracking System

## Overview
In previous steps we implemented building a workout program.
Now we need to implement progress tracking / workout log.
We go through the program in a cycle - Program X: Routine 1, Routine 2, Routine 1, Routine 2...

## Data Model
Program (e.g., "My Current Workout")
  └─ Routines (ordered cycle)
      ├─ "Chest + Triceps"
      ├─ "Back + Biceps + Delts"
      └─ "Shoulders + Arms + Legs"
           └─ Exercise Types
               ├─ "Lateral raise"
               │   └─ Exercises
               │       ├─ "Dumbbell Lateral Raise"
               │       └─ "Machine Lateral Raise (Insosportus)"
               ├─ "Biceps"
               └─ "Leg press"

Workout Session (actual workout on specific date)
  ├─ Date: 2025-10-04
  ├─ Routine: "Shoulders + Arms + Legs"
  └─ Exercise Logs
      ├─ Exercise Log: "Machine Lateral Raise"
      │   └─ Sets
      │       ├─ Set 1: 25kg × 12 reps @ 2 RIR
      │       ├─ Set 2: 20kg × 10 reps @ 1 RIR
      │       └─ Set 3: 15kg × 8 reps @ 0 RIR
      │   └─ Notes: "Increase weight next time"
      └─ Exercise Log: "Cable Bicep Curl"
          └─ Sets...

## Workout Flow
1. Starting a Workout

User opens app
App shows: "Next workout: Shoulders + Arms + Legs" (based on last completed routine in cycle)
User has two options:
- Tap "Start Workout" → Creates new Workout Session with current date and selected routine
- Tap "Skip Workout" → Confirmation dialog appears → If confirmed, creates empty session record and advances to next routine in cycle

2. Working Through Exercise Types

Shows first exercise type: "Lateral raise"
Lists available exercises:

Dumbbell Lateral Raise
Machine Lateral Raise (Insosportus)


User selects: "Machine Lateral Raise"

3. Logging Sets

User taps "Add Set" (this is the word you're looking for!)
Form appears with:

Weight: [20] kg
Reps: [12]
RIR: [2] (optional)

Save set

Shows history from previous sessions (if any):

  Previous (Oct 1): 
  - 20kg × 12, 15kg x 10, 15kg x 8 reps
  - Notes: "Weight was ok"

User adds Set 2, Set 3, etc.
Tap "Next Exercise" when done

4. Moving to Next Exercise Type

App shows: "Biceps"
User selects exercise (e.g., "Cable Bicep Curl")
Repeats logging sets

5. Completing Workout

User taps "Finish Workout"
Session is saved with timestamp, duration, total volume

## Implementation Status

### ✅ Completed Components

- [workoutSession.ts](../../apps/web/src/types/workoutSession.ts) - Type definitions for WorkoutSession, ExerciseLog, and SetLog
- [Home.tsx](../../apps/web/src/pages/Home.tsx) - Updated with "Next Workout" card, "Start Workout" and "Skip Workout" buttons, responsive mobile layout
- [ActiveWorkout.tsx](../../apps/web/src/pages/ActiveWorkout.tsx) - Complete workout session flow with enhanced UX
- [textarea.tsx](../../apps/web/src/components/ui/textarea.tsx) - shadcn/ui component for notes
- [ConfirmDialog.tsx](../../apps/web/src/components/ui/ConfirmDialog.tsx) - Reusable confirmation dialog for skip workout and other actions
- [lib/repositories/index.ts](../../apps/web/src/lib/repositories/index.ts) - Added workout session repository
- [App.tsx](../../apps/web/src/App.tsx) - Integrated workout session state, navigation, and skip functionality

### ✅ Core Features

- **Smart Routine Cycling**: Automatically determines next routine based on last completed workout in program cycle
- **Skip Workout**: Button with confirmation dialog to skip a workout and advance to next routine in cycle (creates empty session record)
- **Responsive Home Layout**: Mobile-optimized card with stacked buttons (full-width on mobile, horizontal layout on desktop)
- **Home Screen Integration**: Shows next scheduled workout with gradient card design
- **Bi-directional Navigation**: Free navigation between exercises with Previous/Next buttons at any time
- **Exercise Selection**: Choose from available exercises for each exercise type
- **Set Logging**: Drawer-based form for logging weight, reps, and RIR
- **Notes System**: Add notes for next time with textarea (auto-saves after 500ms of typing + on blur)
- **Previous Session History**: Shows previous workout data and notes prominently with visual highlighting
- **Progress Tracking**: Visual progress bar showing current position in workout
- **Session Completion**: Calculates and saves duration and total volume on finish
- **Data Persistence**: All workout sessions saved to localStorage via repository pattern

### 🎨 UX Enhancements

**Improved Workout Flow**:
1. Select exercise → See previous session history first (no auto-popup)
2. Review history and previous notes before starting
3. Add sets with drawer form
4. Add notes for next time (highlighted in yellow for visibility)
5. Navigate freely between exercises with Previous/Next buttons
6. Finish workout when ready (button shown on last exercise)

**Visual Design**:
- Gradient backgrounds for workout cards (blue/purple theme)
- Responsive button layout (stacked on mobile, horizontal on desktop)
- Progress bar with smooth animations
- Previous session history in muted card with highlighted notes
- Sticky note icon for notes section
- Consistent with existing shadcn/ui patterns
- ConfirmDialog component using Vaul drawer pattern for native mobile feel

### 📁 File Structure

```
apps/web/src/
├── types/
│   └── workoutSession.ts (NEW)
├── components/ui/
│   ├── textarea.tsx (NEW)
│   └── ConfirmDialog.tsx (NEW)
├── pages/
│   ├── Home.tsx (UPDATED - skip workout + responsive layout)
│   └── ActiveWorkout.tsx (NEW)
├── lib/repositories/
│   └── index.ts (UPDATED)
└── App.tsx (UPDATED - skip workout handler)
```

### 🔧 Technical Implementation

**State Management**:
- Workout sessions stored in localStorage via `usePersistedState` hook
- Active session tracked separately during workout
- Notes auto-save with 500ms debounce + on blur
- Exercise selection persists across navigation (stored per exercise type index)
- Navigation maintains state when moving between exercise types

**Next Routine Calculation** ([App.tsx:394-424](../../apps/web/src/App.tsx#L394)):
- Uses `useMemo` to prevent infinite re-renders
- Finds most recent program with routines
- Calculates next routine in cycle based on last completed session (including skipped sessions)
- Wraps around to first routine after completing all routines

**Skip Workout Implementation** ([App.tsx:376-394](../../apps/web/src/App.tsx#L376)):
- Creates a workout session with empty exercise logs
- Sets `startTime` and `endTime` to current timestamp
- Sets `duration` to 0 and `totalVolume` to 0
- Saves to repository to advance program cycle
- Uses ConfirmDialog component to prevent accidental skips

**Data Flow**:
1. User starts workout → Creates new `WorkoutSession`
   - OR User skips workout → Creates empty `WorkoutSession` with `endTime` set, advances cycle
2. Selects exercise → Loads previous notes if any, stores selection per exercise type
3. Logs sets → Updates `ExerciseLog.sets[]`
4. Saves notes → Auto-saves after 500ms of no typing to `ExerciseLog.notes`
5. Navigates between exercises → Restores previously selected exercise and notes
6. Finishes workout → Calculates `endTime`, `duration`, and `totalVolume`, saves complete session to repository

**Previous Exercise History** ([ActiveWorkout.tsx:62-87](../../apps/web/src/pages/ActiveWorkout.tsx#L62)):
- Searches through ALL completed sessions (not just last workout)
- Finds the last time THIS specific exercise was performed
- Returns exercise log with sets and notes + session date
- Displays: "Last time you did this (date)" with full history

## Status

**✅ COMPLETED** - All Step 03 functionality is fully implemented including:
- Complete workout session tracking system
- Smart program cycle management
- **Skip workout functionality with confirmation dialog**
- **Responsive mobile-optimized home screen layout**
- Bi-directional exercise navigation with state persistence
- Set logging with history display
- Auto-saving notes system (500ms debounce)
- Exercise selection persistence across navigation
- Previous exercise history lookup (searches all sessions for specific exercise)
- Session completion with calculated metrics (`endTime`, `duration`, `totalVolume`)
- Local persistence via repository pattern

### 🐛 Bug Fixes & Improvements Applied:
1. **Exercise History Display**: Fixed lookup to search ALL sessions for specific exercise (not just last workout)
2. **Notes Auto-Save**: Implemented debounced auto-save (500ms) removing need for manual save button
3. **Exercise Selection Persistence**: Navigation now maintains selected exercise per exercise type
4. **Session EndTime Bug**: Fixed `handleFinishWorkout` to properly save session with `endTime`, `duration`, and `totalVolume`
5. **Mobile Layout**: Improved home screen card layout - buttons now stack vertically on mobile instead of cramped horizontal layout
6. **Skip Workout**: Added ability to skip workouts with confirmation to prevent accidental skips

## Future plans
1. Session History View - Browse all completed workouts
2. Exercise Progress Charts - Visualize progress over time
3. Rest Timer - Built-in timer between sets
4. Exercise Photos/Videos - Add media to exercises
5. Export Workout Data - Export to CSV/JSON