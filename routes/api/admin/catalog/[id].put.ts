import { defineHandler } from 'nitro'
import { readBody, createError } from 'nitro/h3'
import { requireAdmin } from '../../lib/auth'
import { catalogUpdateSchema } from '../../lib/catalog-validation'
import { getCatalogById, updateCatalog } from '../../lib/catalog'
import { handleDbError } from '../../lib/errors'

export default defineHandler(async (event) => {
  await requireAdmin(event)
  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, message: 'Missing id' })

  const body = await readBody(event)
  const parsed = catalogUpdateSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      message: parsed.error.issues[0]?.message ?? 'Invalid input',
    })
  }

  const data = parsed.data
  const patch: Parameters<typeof updateCatalog>[1] = {}

  if (data.name !== undefined) patch.name = data.name
  if (data.slug !== undefined) patch.slug = data.slug
  if (data.primaryMuscle !== undefined) patch.primaryMuscle = data.primaryMuscle
  if (data.secondaryMuscles !== undefined) patch.secondaryMuscles = data.secondaryMuscles
  if (data.equipment !== undefined) patch.equipment = data.equipment
  if (data.level !== undefined) patch.level = data.level
  if (data.instructions !== undefined) patch.instructions = data.instructions
  if (data.tips !== undefined) patch.tips = data.tips
  if (data.stepImageUrls !== undefined) patch.stepImageUrls = data.stepImageUrls
  if (data.published !== undefined) patch.published = data.published
  if (data.heroImageUrl !== undefined) {
    patch.heroImageUrl = data.heroImageUrl === '' ? null : data.heroImageUrl
  }

  try {
    const existing = await getCatalogById(id)
    if (!existing) throw createError({ statusCode: 404, message: 'Exercise not found' })

    const exercise = await updateCatalog(id, patch)
    return { exercise }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    const msg = error instanceof Error ? error.message : String(error)
    if (msg.includes('unique') || msg.includes('duplicate')) {
      throw createError({ statusCode: 409, message: 'Slug already exists' })
    }
    handleDbError(error)
  }
})
