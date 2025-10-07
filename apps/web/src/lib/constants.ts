/**
 * Application-wide constants
 * Centralizes magic numbers and strings for better maintainability
 */

// Auto-save settings
export const NOTES_AUTOSAVE_DEBOUNCE_MS = 500

// Drawer UI constants
export const DRAWER_HEIGHT_CLASS = 'h-[96%]'

// Drawer mode constants
// All drawers now use URL-based routing for consistency
// Uses { replace: true } pattern on close to prevent back button from reopening drawers
export const DRAWER_MODE = {
  // Persistent drawers (entity CRUD operations)
  CREATE_EXERCISE_TYPE: 'createExerciseType',
  EDIT_EXERCISE_TYPE: 'editExerciseType',
  CREATE_EXERCISE: 'createExercise',
  CREATE_ROUTINE: 'createRoutine',
  EDIT_ROUTINE: 'editRoutine',
  CREATE_PROGRAM: 'createProgram',
  EDIT_PROGRAM: 'editProgram',

  // Selector drawers (adding items to collections)
  ADD_EXERCISE_TYPE_TO_ROUTINE: 'addExerciseTypeToRoutine',

  // Transient drawers (temporary actions within a flow)
  SET_LOGGER: 'setLogger',
  EXERCISE_SELECTION: 'exerciseSelection',
} as const

export type DrawerMode = typeof DRAWER_MODE[keyof typeof DRAWER_MODE]
