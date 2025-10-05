# Step 01: Create views for building routines

## Overview
Create the foundational navigation and CRUD views for Exercise Types and Routines.

## Requirements

### Main Page (Home)
- [x] Three navigation buttons: "Programs", "Routines" and "Exercise Types"
- [x] Navigate to respective list views when clicked

### Exercise Types Flow
- [x] **List View** ([ExerciseTypeList.tsx](../../apps/web/src/pages/ExerciseTypeList.tsx))
  - [x] Display all created exercise types
  - [x] Show exercise count for each type
  - [x] Show preview badges with first 3 exercise names
  - [x] "+ Add" button to create new exercise type
  - [x] Click on item navigates to detail page
  - [x] Back button to return to home

- [x] **Create Form** ([CreateExerciseType.tsx](../../apps/web/src/pages/CreateExerciseType.tsx))
  - [x] Opens in drawer (Vaul)
  - [x] Form to input exercise type name
  - [x] Save and cancel actions

- [x] **Detail View** ([ExerciseList.tsx](../../apps/web/src/pages/ExerciseList.tsx))
  - [x] Display exercise type name
  - [x] List all exercises belonging to this type
  - [x] "+ Add" button to create new exercise
  - [x] "Edit" button to edit exercise type details (opens in drawer)
  - [x] Delete exercise type button (moved to bottom)
  - [x] Cascade deletion: deleting exercise type removes all associated exercises
  - [x] Back button to return to list

- [x] **Edit Exercise Type Form** ([EditExerciseType.tsx](../../apps/web/src/pages/EditExerciseType.tsx))
  - [x] Opens in drawer from detail view
  - [x] Form to update exercise type name
  - [x] Save and cancel actions

- [x] **Exercise Detail/Edit Page** ([ExerciseDetail.tsx](../../apps/web/src/pages/ExerciseDetail.tsx))
  - [x] Click on exercise navigates to detail page
  - [x] Form to edit all exercise fields (name, machine brand, target reps, reps in reserve)
  - [x] Delete button at bottom
  - [x] Save and cancel actions
  - [x] Back button to return to exercise type detail

### Routines Flow
- [x] **List View** ([RoutineList.tsx](../../apps/web/src/pages/RoutineList.tsx))
  - [x] Display all created routines
  - [x] Show preview of exercise types in each routine
  - [x] "+ Add" button to create new routine
  - [x] Click on item navigates to detail page
  - [x] Back button to return to home

- [x] **Create Form** ([CreateRoutine.tsx](../../apps/web/src/pages/CreateRoutine.tsx))
  - [x] Opens in drawer (Vaul)
  - [x] Form to input routine name
  - [x] Select exercise types to include
  - [x] Save and cancel actions

- [x] **Detail View** ([RoutineDetail.tsx](../../apps/web/src/pages/RoutineDetail.tsx))
  - [x] Display routine name
  - [x] List all exercise types in the routine
  - [x] "+ Add" button to add exercise types
  - [x] Remove exercise type from routine
  - [x] "Edit" button to edit routine details (opens in drawer)
  - [x] Delete routine button (moved to bottom)
  - [x] Back button to return to list

- [x] **Edit Routine Form** ([EditRoutine.tsx](../../apps/web/src/pages/EditRoutine.tsx))
  - [x] Opens in drawer from detail view
  - [x] Form to update routine name
  - [x] Save and cancel actions

### Programs Flow
- [x] **List View** ([ProgramList.tsx](../../apps/web/src/pages/ProgramList.tsx))
  - [x] Display all created programs
  - [x] Show routine count for each program
  - [x] Show preview badges with first 3 routine names
  - [x] "+ Add" button to create new program
  - [x] Click on item navigates to detail page
  - [x] Back button to return to home

- [x] **Create Form** ([CreateProgram.tsx](../../apps/web/src/pages/CreateProgram.tsx))
  - [x] Opens in drawer (Vaul)
  - [x] Form to input program name
  - [x] Select routines to include
  - [x] Save and cancel actions

- [x] **Detail View** ([ProgramDetail.tsx](../../apps/web/src/pages/ProgramDetail.tsx))
  - [x] Display program name
  - [x] List all routines in the program
  - [x] "+ Add" button to add routines
  - [x] Remove routine from program
  - [x] "Edit" button to edit program details (opens in drawer)
  - [x] Delete program button (at bottom)
  - [x] Back button to return to list

- [x] **Edit Program Form** ([EditProgram.tsx](../../apps/web/src/pages/EditProgram.tsx))
  - [x] Opens in drawer from detail view
  - [x] Form to update program name
  - [x] Save and cancel actions

## Implementation Status

### ✅ Completed Components
- [Home.tsx](../../apps/web/src/pages/Home.tsx) - Main navigation page
- [ExerciseTypeList.tsx](../../apps/web/src/pages/ExerciseTypeList.tsx) - Exercise types list
- [CreateExerciseType.tsx](../../apps/web/src/pages/CreateExerciseType.tsx) - Exercise type creation form
- [EditExerciseType.tsx](../../apps/web/src/pages/EditExerciseType.tsx) - Exercise type edit form
- [ExerciseList.tsx](../../apps/web/src/pages/ExerciseList.tsx) - Exercise type detail view with breadcrumb support
- [CreateExercise.tsx](../../apps/web/src/pages/CreateExercise.tsx) - Exercise creation form
- [ExerciseDetail.tsx](../../apps/web/src/pages/ExerciseDetail.tsx) - Exercise detail/edit page
- [RoutineList.tsx](../../apps/web/src/pages/RoutineList.tsx) - Routines list
- [CreateRoutine.tsx](../../apps/web/src/pages/CreateRoutine.tsx) - Routine creation form
- [EditRoutine.tsx](../../apps/web/src/pages/EditRoutine.tsx) - Routine edit form
- [RoutineDetail.tsx](../../apps/web/src/pages/RoutineDetail.tsx) - Routine detail view with clickable exercise types and breadcrumb support
- [ProgramList.tsx](../../apps/web/src/pages/ProgramList.tsx) - Programs list
- [CreateProgram.tsx](../../apps/web/src/pages/CreateProgram.tsx) - Program creation form
- [EditProgram.tsx](../../apps/web/src/pages/EditProgram.tsx) - Program edit form
- [ProgramDetail.tsx](../../apps/web/src/pages/ProgramDetail.tsx) - Program detail view with clickable routines and breadcrumb support
- [RoutineSelector.tsx](../../apps/web/src/components/RoutineSelector.tsx) - Multi-select component for routines
- [Breadcrumb.tsx](../../apps/web/src/components/Breadcrumb.tsx) - Reusable breadcrumb navigation component

### ✅ Core Features
- Navigation between all views with Framer Motion animations
- Bottom drawer UI pattern using Vaul
- In-memory state management via React hooks in [App.tsx](../../apps/web/src/App.tsx)
- Full CRUD operations for all entities (Exercise Types, Exercises, Routines, Programs)
- Edit functionality via drawer forms
- **Hierarchical navigation**: Navigate through the full domain hierarchy
  - Program → Routine → Exercise Type → Exercise
  - Clickable cards with enhanced hover effects (shadow lift, color tint, chevron animation)
  - Colored icon backgrounds for visual hierarchy (green/blue/purple)
- **Breadcrumb navigation**: Shows navigation path with clickable items
  - Optional breadcrumb support in all detail views
  - Home icon for first breadcrumb item
  - Falls back to "Back" button when breadcrumbs not provided
- Cascade deletion:
  - Deleting exercise type removes all exercises and removes from routines
  - Deleting routine removes from programs
- Multi-select components for exercise types (routines) and routines (programs)
- Consistent delete button placement at bottom of detail pages
- Preview badges showing first 3 items with "+X more" indicator

## Technical Notes

### State Management
Currently using React `useState` in [App.tsx](../../apps/web/src/App.tsx:1) for all data:
- `exerciseTypes`: Array of exercise type objects
- `exercises`: Array of exercise objects
- `routines`: Array of routine objects
- `programs`: Array of program objects
- View navigation state
- Drawer state for modals
- Selected item state for detail views

### Data Persistence
✅ **Implemented in Step 02**: Data now persists using localStorage. See [step_02.md](./step_02.md)

### UI/UX Implementation
- Framer Motion for page transitions and list animations
- Vaul for mobile-friendly bottom drawers
- shadcn/ui components (Button, Card, Badge, Input, Label)
- Responsive design with Tailwind CSS v4
- **Modern card interactions**:
  - Enhanced hover states with shadow-lg transitions
  - Colored icon backgrounds (Calendar for routines, Dumbbell for exercise types)
  - Smooth chevron animations indicating clickable items
  - Subtle color tint overlays on hover
  - Stop propagation on remove buttons to prevent navigation

### Navigation Handlers in App.tsx
- `handleSelectExerciseType` - Navigate from list to exercise type detail
- `handleSelectExercise` - Navigate from exercise list to exercise detail
- `handleSelectRoutine` - Navigate from list to routine detail
- `handleSelectProgram` - Navigate from list to program detail
- **`handleSelectRoutineFromProgram`** - Navigate from program detail to routine detail
- **`handleSelectExerciseTypeFromRoutine`** - Navigate from routine detail to exercise type detail
- All handlers support hierarchical drill-down navigation

## Status
**✅ COMPLETED** - All functionality for Step 01 is fully implemented including:
- Complete CRUD operations for Exercise Types, Exercises, Routines, and Programs
- Edit forms for all entities
- Consistent UX patterns with delete buttons at bottom of detail pages
- Smooth navigation and animations throughout
- Full domain hierarchy: Exercise → Exercise Type → Routine → Program
- **Hierarchical navigation**: Full drill-down capability (Program → Routine → Exercise Type → Exercise)
- **Breadcrumb component**: Reusable navigation breadcrumbs with Home icon
- **Enhanced card design**: Modern hover effects, colored icons, smooth animations