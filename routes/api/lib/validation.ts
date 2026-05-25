import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  password: z.string().min(8).max(128),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
})

export const setSchema = z.object({
  setNumber: z.number().int().positive(),
  reps: z.number().int().positive().optional().nullable(),
  weight: z.number().nonnegative().optional().nullable(),
  weightUnit: z.enum(['kg', 'lb']).default('kg'),
  rpe: z.number().int().min(1).max(10).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
})

export const exerciseSchema = z.object({
  name: z.string().min(1).max(200),
  sortOrder: z.number().int().nonnegative(),
  sets: z.array(setSchema).min(1),
})

export const createWorkoutSchema = z.object({
  title: z.string().min(1).max(200).default('Workout'),
  notes: z.string().max(2000).optional().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  durationMinutes: z.number().int().nonnegative().optional().nullable(),
  startedAt: z.string().datetime().optional().nullable(),
  completedAt: z.string().datetime().optional().nullable(),
  exercises: z.array(exerciseSchema).min(1),
})

export const updateWorkoutSchema = createWorkoutSchema.partial().extend({
  exercises: z.array(exerciseSchema).optional(),
})
