import { defineHandler } from 'nitro'
import { createError } from 'nitro/h3'
import { requireAdmin } from '../../lib/auth'
import { getCatalogById } from '../../lib/catalog'
import { handleDbError } from '../../lib/errors'

export default defineHandler(async (event) => {
  await requireAdmin(event)
  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, message: 'Missing id' })

  try {
    const exercise = await getCatalogById(id)
    if (!exercise) throw createError({ statusCode: 404, message: 'Exercise not found' })
    return { exercise }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    handleDbError(error)
  }
})
