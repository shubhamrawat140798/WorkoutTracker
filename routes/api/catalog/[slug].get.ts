import { defineHandler } from 'nitro'
import { createError } from 'nitro/h3'
import { getCatalogBySlug } from '../lib/catalog'
import { handleDbError } from '../lib/errors'

export default defineHandler(async (event) => {
  const slug = event.context.params?.slug
  if (!slug) throw createError({ statusCode: 400, message: 'Missing slug' })

  try {
    const exercise = await getCatalogBySlug(slug, true)
    if (!exercise) throw createError({ statusCode: 404, message: 'Exercise not found' })
    return { exercise }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    handleDbError(error)
  }
})
