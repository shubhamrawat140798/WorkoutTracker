import { defineHandler } from 'nitro'
import { readBody, createError } from 'nitro/h3'
import { requireAdmin } from '../../lib/auth'
import { catalogExerciseSchema } from '../../lib/catalog-validation'
import { createCatalog } from '../../lib/catalog'
import { slugify } from '../../lib/slug'
import { handleDbError } from '../../lib/errors'

export default defineHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody(event)
  const parsed = catalogExerciseSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      message: parsed.error.issues[0]?.message ?? 'Invalid input',
    })
  }

  const data = parsed.data
  const heroImageUrl = data.heroImageUrl === '' ? null : (data.heroImageUrl ?? null)

  try {
    const exercise = await createCatalog({
      name: data.name,
      slug: data.slug ?? slugify(data.name),
      primaryMuscle: data.primaryMuscle ?? null,
      secondaryMuscles: data.secondaryMuscles,
      equipment: data.equipment ?? null,
      level: data.level ?? null,
      instructions: data.instructions,
      tips: data.tips,
      heroImageUrl,
      stepImageUrls: data.stepImageUrls,
      published: data.published,
    })
    return { exercise }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    if (msg.includes('unique') || msg.includes('duplicate')) {
      throw createError({ statusCode: 409, message: 'Slug already exists' })
    }
    handleDbError(error)
  }
})
