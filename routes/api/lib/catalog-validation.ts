import { z } from 'zod'

const httpsUrl = z
  .string()
  .url()
  .refine((u) => u.startsWith('https://'), 'Image URL must use HTTPS')

const optionalHttpsUrl = z.union([z.literal(''), httpsUrl]).optional()

export const catalogExerciseSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and hyphens')
    .optional(),
  primaryMuscle: z.string().max(100).optional().nullable(),
  secondaryMuscles: z.array(z.string()).default([]),
  equipment: z.string().max(100).optional().nullable(),
  level: z.string().max(50).optional().nullable(),
  instructions: z.array(z.string().max(500)).default([]),
  tips: z.array(z.string().max(300)).default([]),
  heroImageUrl: optionalHttpsUrl,
  stepImageUrls: z.array(httpsUrl).default([]),
  published: z.boolean().default(true),
})

export const catalogUpdateSchema = catalogExerciseSchema.partial()
