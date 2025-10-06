/**
 * Application-wide constants
 * Centralizes magic numbers and strings for better maintainability
 */

// Auto-save settings
export const NOTES_AUTOSAVE_DEBOUNCE_MS = 500

// Drawer route patterns
export const DRAWER_ROUTES = {
  CREATE_EXERCISE_TYPE: '/exercise-types/new',
  EDIT_EXERCISE_TYPE: /^\/exercise-types\/[^/]+\/edit$/,
  CREATE_EXERCISE: /^\/exercise-types\/[^/]+\/exercises\/new$/,
  CREATE_ROUTINE: '/routines/new',
  EDIT_ROUTINE: /^\/routines\/[^/]+\/edit$/,
  EDIT_PROGRAM_ROUTINE: /^\/programs\/[^/]+\/routines\/[^/]+\/edit$/,
  CREATE_PROGRAM: '/programs/new',
  EDIT_PROGRAM: /^\/programs\/[^/]+\/edit$/,
} as const

// Drawer UI constants
export const DRAWER_HEIGHT_CLASS = 'h-[96%]'
