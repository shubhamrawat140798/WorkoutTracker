import { z } from 'zod'

const measurementField = z.number().positive().max(500).optional().nullable()

export const bodyMeasurementsSchema = z.object({
  chest: measurementField,
  waist: measurementField,
  hips: measurementField,
  biceps: measurementField,
  thighs: measurementField,
  neck: measurementField,
})

export const updateProfileSchema = z.object({
  gender: z
    .union([z.enum(['male', 'female', 'other', 'prefer_not_to_say']), z.literal('')])
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  heightCm: z.number().positive().max(300).optional().nullable(),
  weightKg: z.number().positive().max(500).optional().nullable(),
  measurements: bodyMeasurementsSchema.optional(),
})
