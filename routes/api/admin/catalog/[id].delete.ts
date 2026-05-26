import { defineHandler } from 'nitro'
import { createError } from 'nitro/h3'
import { requireAdmin } from '../../lib/auth'
import { deleteCatalog } from '../../lib/catalog'
import { handleDbError } from '../../lib/errors'

export default defineHandler(async (event) => {
  await requireAdmin(event)
  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, message: 'Missing id' })

  try {
    const deleted = await deleteCatalog(id)
    if (!deleted) throw createError({ statusCode: 404, message: 'Exercise not found' })
    return { success: true }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    handleDbError(error)
  }
})
