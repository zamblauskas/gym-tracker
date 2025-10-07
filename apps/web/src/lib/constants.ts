/**
 * Application-wide constants
 * Centralizes magic numbers and strings for better maintainability
 */

// Auto-save settings
export const NOTES_AUTOSAVE_DEBOUNCE_MS = 500

// Drawer UI constants
export const DRAWER_HEIGHT_CLASS = 'h-[96%]'

// Drawer mode constants
export const DRAWER_MODE = {
  CREATE_EXERCISE_TYPE: 'createExerciseType',
  EDIT_EXERCISE_TYPE: 'editExerciseType',
  CREATE_EXERCISE: 'createExercise',
  CREATE_ROUTINE: 'createRoutine',
  EDIT_ROUTINE: 'editRoutine',
  CREATE_PROGRAM: 'createProgram',
  EDIT_PROGRAM: 'editProgram',
} as const

export type DrawerMode = typeof DRAWER_MODE[keyof typeof DRAWER_MODE]
