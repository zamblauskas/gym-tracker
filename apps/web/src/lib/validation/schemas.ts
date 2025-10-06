import { z } from 'zod'

// ExerciseType schemas
export const exerciseTypeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const createExerciseTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
})

export const updateExerciseTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').optional(),
})

// Exercise schemas
export const exerciseSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  machineBrand: z.string().max(100, 'Machine brand must be less than 100 characters').optional(),
  targetRepRange: z.string().min(1, 'Target rep range is required').max(20, 'Target rep range must be less than 20 characters'),
  targetRepsInReserve: z.number().min(0, 'RIR must be at least 0').max(10, 'RIR must be at most 10').optional(),
  exerciseTypeId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const createExerciseSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  machineBrand: z.string().max(100, 'Machine brand must be less than 100 characters').optional(),
  targetRepRange: z.string().min(1, 'Target rep range is required').max(20, 'Target rep range must be less than 20 characters'),
  targetRepsInReserve: z.number().min(0, 'RIR must be at least 0').max(10, 'RIR must be at most 10').optional(),
  exerciseTypeId: z.string().uuid(),
})

export const updateExerciseSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').optional(),
  machineBrand: z.string().max(100, 'Machine brand must be less than 100 characters').optional(),
  targetRepRange: z.string().min(1, 'Target rep range is required').max(20, 'Target rep range must be less than 20 characters').optional(),
  targetRepsInReserve: z.number().min(0, 'RIR must be at least 0').max(10, 'RIR must be at most 10').optional(),
  exerciseTypeId: z.string().uuid().optional(),
})

// Routine schemas
export const routineSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  exerciseTypeIds: z.array(z.string().uuid()),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const createRoutineSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  exerciseTypeIds: z.array(z.string().uuid()),
})

export const updateRoutineSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').optional(),
  exerciseTypeIds: z.array(z.string().uuid()).optional(),
})

// Program schemas
export const programSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  routineIds: z.array(z.string().uuid()),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const createProgramSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  routineIds: z.array(z.string().uuid()),
})

export const updateProgramSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').optional(),
  routineIds: z.array(z.string().uuid()).optional(),
})

// WorkoutSession schemas
export const setLogSchema = z.object({
  id: z.string().uuid(),
  weight: z.number().min(0),
  reps: z.number().min(0),
  repsInReserve: z.number().min(0).max(10).optional(),
})

export const exerciseLogSchema = z.object({
  id: z.string().uuid(),
  exerciseId: z.string().uuid(),
  exerciseTypeId: z.string().uuid(),
  sets: z.array(setLogSchema),
  notes: z.string().optional(),
})

export const workoutSessionSchema = z.object({
  id: z.string().uuid(),
  programId: z.string().uuid().optional(),
  routineId: z.string().uuid(),
  exerciseLogs: z.array(exerciseLogSchema),
  startTime: z.date(),
  endTime: z.date().optional(),
  duration: z.number().min(0).optional(),
  totalVolume: z.number().min(0).optional(),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Type inference helpers
export type ExerciseTypeInput = z.infer<typeof createExerciseTypeSchema>
export type ExerciseInput = z.infer<typeof createExerciseSchema>
export type RoutineInput = z.infer<typeof createRoutineSchema>
export type ProgramInput = z.infer<typeof createProgramSchema>
